import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';
import { createUserProfile, ensureUserProfile } from './userService';

// 회원가입
export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  recoveryQuestion: string,
  recoveryAnswer: string
) => {
  try {
    const auth = getFirebaseAuth();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    // 프로필 이름 설정
    await updateProfile(userCredential.user, { displayName });
    await createUserProfile({
      uid: userCredential.user.uid,
      email,
      displayName,
      photoURL: userCredential.user.photoURL,
      recoveryQuestion,
      recoveryAnswer,
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// 로그인
export const loginUser = async (email: string, password: string) => {
  try {
    const auth = getFirebaseAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const profile = await ensureUserProfile({
      uid: userCredential.user.uid,
      email: userCredential.user.email ?? email,
      displayName: userCredential.user.displayName ?? userCredential.user.email?.split('@')[0] ?? '料理好きユーザー',
      photoURL: userCredential.user.photoURL,
    });

    if (profile?.status === 'banned') {
      await signOut(auth);
      throw new Error('이 계정은 이용이 제한되었습니다. 운영자에게 문의해주세요.');
    }

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Google 로그인
export const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(getFirebaseAuth(), provider);
    const profile = await ensureUserProfile({
      uid: userCredential.user.uid,
      email: userCredential.user.email ?? '',
      displayName: userCredential.user.displayName ?? '料理好きユーザー',
      photoURL: userCredential.user.photoURL,
    });

    if (profile?.status === 'banned') {
      await signOut(getFirebaseAuth());
      throw new Error('이 계정은 이용이 제한되었습니다. 운영자에게 문의해주세요.');
    }

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const sendResetPasswordEmail = async (email: string) => {
  await sendPasswordResetEmail(getFirebaseAuth(), email);
};

// 로그아웃
export const logoutUser = async () => {
  try {
    await signOut(getFirebaseAuth());
  } catch (error) {
    throw error;
  }
};

// 현재 사용자 가져오기
export const getCurrentUser = (): User | null => {
  try {
    return getFirebaseAuth().currentUser;
  } catch {
    return null;
  }
};

const authMessages = {
  ja: {
    restricted: 'このアカウントは利用が制限されています。運営者にお問い合わせください。',
    emailInUse: 'すでに登録されているメールアドレスです。',
    invalidEmail: 'メールアドレスの形式が正しくありません。',
    invalidCredential: 'メールアドレスまたはパスワードが正しくありません。',
    weakPassword: 'パスワードは6文字以上で入力してください。',
    popupClosed: 'Googleログイン画面が閉じられました。',
    unauthorizedDomain: 'Firebase Authenticationの承認済みドメインに現在のドメインを追加してください。',
    missingEmail: 'パスワード再設定用のメールアドレスを入力してください。',
    unknown: 'ログイン処理中に不明なエラーが発生しました。',
    code: 'ログイン処理中にエラーが発生しました。',
  },
  ko: {
    restricted: '이 계정은 이용이 제한되었습니다. 운영자에게 문의해주세요.',
    emailInUse: '이미 가입된 이메일입니다.',
    invalidEmail: '이메일 형식이 올바르지 않습니다.',
    invalidCredential: '이메일 또는 비밀번호가 올바르지 않습니다.',
    weakPassword: '비밀번호는 6자 이상으로 입력해주세요.',
    popupClosed: 'Google 로그인 창이 닫혔습니다.',
    unauthorizedDomain: 'Firebase Authentication의 승인된 도메인에 현재 도메인을 추가해주세요.',
    missingEmail: '비밀번호 재설정 이메일을 입력해주세요.',
    unknown: '로그인 처리 중 알 수 없는 오류가 발생했습니다.',
    code: '로그인 처리 중 오류가 발생했습니다.',
  },
  en: {
    restricted: 'This account has been restricted. Please contact the admin.',
    emailInUse: 'This email is already registered.',
    invalidEmail: 'The email format is invalid.',
    invalidCredential: 'Email or password is incorrect.',
    weakPassword: 'Password must be at least 6 characters.',
    popupClosed: 'The Google login window was closed.',
    unauthorizedDomain: 'Add the current domain to Firebase Authentication authorized domains.',
    missingEmail: 'Enter an email address for password reset.',
    unknown: 'An unknown login error occurred.',
    code: 'An error occurred during login.',
  },
};

export const getAuthErrorMessage = (error: unknown, language: keyof typeof authMessages = 'ko') => {
  const messages = authMessages[language] ?? authMessages.ko;
  if (error instanceof Error && error.message.includes('Firebase 설정이 필요합니다')) {
    return error.message;
  }

  if (error instanceof Error && error.message.includes('이 계정은 이용이 제한')) {
    return messages.restricted;
  }

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return messages.emailInUse;
      case 'auth/invalid-email':
        return messages.invalidEmail;
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return messages.invalidCredential;
      case 'auth/weak-password':
        return messages.weakPassword;
      case 'auth/popup-closed-by-user':
        return messages.popupClosed;
      case 'auth/unauthorized-domain':
        return messages.unauthorizedDomain;
      case 'auth/missing-email':
        return messages.missingEmail;
      default:
        return `${messages.code} (${error.code})`;
    }
  }

  return messages.unknown;
};
