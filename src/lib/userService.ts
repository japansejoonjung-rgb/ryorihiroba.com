import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'banned';

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  status: UserStatus;
  points: number;
  recoveryQuestion: string;
  recoveryAnswerHash?: string;
  createdAt: string;
  updatedAt: string;
};

export type PointType = 'signup' | 'recipe_post' | 'like_milestone' | 'admin_adjustment';

export type PointTransaction = {
  id: string;
  userId: string;
  amount: number;
  type: PointType;
  sourceId: string;
  description: string;
  createdAt: string;
};

export const recoveryQuestions = [
  { id: 'birthday', label: '생일은?' },
  { id: 'university', label: '내가 졸업한 대학교는?' },
  { id: 'hometown', label: '태어난 도시는?' },
  { id: 'favorite_food', label: '가장 좋아하는 음식은?' },
];

const defaultAvatar = (uid: string) => `https://i.pravatar.cc/100?u=${encodeURIComponent(uid)}`;

const normalizeAnswer = (email: string, question: string, answer: string) =>
  `${email.trim().toLowerCase()}::${question}::${answer.trim().toLowerCase().replace(/\s+/g, '')}`;

export const hashRecoveryAnswer = async (email: string, question: string, answer: string) => {
  const source = normalizeAnswer(email, question, answer);
  const bytes = new TextEncoder().encode(source);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const normalizeProfile = (uid: string, data: Record<string, any>, points: number): UserProfile => ({
  uid,
  email: String(data.email ?? ''),
  displayName: String(data.displayName ?? '料理好きユーザー'),
  photoURL: String(data.photoURL ?? defaultAvatar(uid)),
  role: data.role === 'admin' ? 'admin' : 'user',
  status: data.status === 'banned' ? 'banned' : 'active',
  points,
  recoveryQuestion: String(data.recoveryQuestion ?? ''),
  recoveryAnswerHash: typeof data.recoveryAnswerHash === 'string' ? data.recoveryAnswerHash : undefined,
  createdAt: String(data.createdAt ?? new Date().toISOString()),
  updatedAt: String(data.updatedAt ?? new Date().toISOString()),
});

export const getUserPoints = async (uid: string) => {
  const db = getFirebaseDb();
  const pointsQuery = query(collection(db, 'pointTransactions'), where('userId', '==', uid));
  const snapshot = await getDocs(pointsQuery);

  return snapshot.docs.reduce((total, item) => total + Number(item.data().amount ?? 0), 0);
};

export const getPointTransactions = async (uid: string): Promise<PointTransaction[]> => {
  const db = getFirebaseDb();
  const pointsQuery = query(collection(db, 'pointTransactions'), where('userId', '==', uid));
  const snapshot = await getDocs(pointsQuery);

  return snapshot.docs
    .map((item) => {
      const data = item.data();
      return {
        id: item.id,
        userId: String(data.userId ?? uid),
        amount: Number(data.amount ?? 0),
        type: (data.type === 'recipe_post' || data.type === 'like_milestone' || data.type === 'admin_adjustment') ? data.type : 'signup',
        sourceId: String(data.sourceId ?? ''),
        description: String(data.description ?? ''),
        createdAt: String(data.createdAt ?? new Date().toISOString()),
      };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const getUserProfile = async (uid: string) => {
  const db = getFirebaseDb();
  const profileSnap = await getDoc(doc(db, 'users', uid));
  const points = await getUserPoints(uid);

  if (!profileSnap.exists()) return null;
  return normalizeProfile(uid, profileSnap.data(), points);
};

export const createUserProfile = async ({
  uid,
  email,
  displayName,
  photoURL,
  recoveryQuestion,
  recoveryAnswer,
}: {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  recoveryQuestion: string;
  recoveryAnswer: string;
}) => {
  const db = getFirebaseDb();
  const now = new Date().toISOString();
  const recoveryAnswerHash = await hashRecoveryAnswer(email, recoveryQuestion, recoveryAnswer);

  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    displayName,
    photoURL: photoURL || defaultAvatar(uid),
    role: 'user',
    status: 'active',
    recoveryQuestion,
    recoveryAnswerHash,
    createdAt: now,
    updatedAt: now,
  });

  try {
    await awardPointsOnce({
      userId: uid,
      amount: 10,
      type: 'signup',
      sourceId: uid,
      description: '회원가입 보너스',
    });
  } catch {
    // Account creation should not fail while point rules are being configured.
  }
};

export const ensureUserProfile = async ({
  uid,
  email,
  displayName,
  photoURL,
}: {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
}) => {
  const existing = await getUserProfile(uid);
  if (existing) return existing;

  const db = getFirebaseDb();
  const now = new Date().toISOString();
  await setDoc(doc(db, 'users', uid), {
    uid,
    email,
    displayName,
    photoURL: photoURL || defaultAvatar(uid),
    role: 'user',
    status: 'active',
    recoveryQuestion: '',
    createdAt: now,
    updatedAt: now,
  });

  return getUserProfile(uid);
};

export const awardPointsOnce = async ({
  userId,
  amount,
  type,
  sourceId,
  description,
}: {
  userId: string;
  amount: number;
  type: PointType;
  sourceId: string;
  description: string;
}) => {
  const db = getFirebaseDb();
  const transactionId = `${type}_${sourceId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  const transactionRef = doc(db, 'pointTransactions', transactionId);
  const existing = await getDoc(transactionRef);

  if (existing.exists()) return false;

  await setDoc(transactionRef, {
    userId,
    amount,
    type,
    sourceId,
    description,
    createdAt: new Date().toISOString(),
  });

  return true;
};

export const banUser = async (uid: string) => {
  const db = getFirebaseDb();
  await updateDoc(doc(db, 'users', uid), {
    status: 'banned',
    updatedAt: new Date().toISOString(),
  });
};

export const unbanUser = async (uid: string) => {
  const db = getFirebaseDb();
  await updateDoc(doc(db, 'users', uid), {
    status: 'active',
    updatedAt: new Date().toISOString(),
  });
};
