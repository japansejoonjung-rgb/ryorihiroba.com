import { FirebaseError } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User,
  updateProfile,
} from 'firebase/auth';
import { getFirebaseAuth } from './firebase';

// 회원가입
export const registerUser = async (
  email: string,
  password: string,
  displayName: string
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
    return userCredential.user;
  } catch (error) {
    throw error;
  }
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

export const getAuthErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message.includes('Firebase 설정이 필요합니다')) {
    return error.message;
  }

  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return '이미 가입된 이메일입니다.';
      case 'auth/invalid-email':
        return '이메일 형식이 올바르지 않습니다.';
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return '이메일 또는 비밀번호가 올바르지 않습니다.';
      case 'auth/weak-password':
        return '비밀번호는 6자 이상으로 입력해주세요.';
      case 'auth/popup-closed-by-user':
        return 'Google 로그인 창이 닫혔습니다.';
      case 'auth/unauthorized-domain':
        return 'Firebase Authentication의 승인된 도메인에 현재 도메인을 추가해주세요.';
      default:
        return `로그인 처리 중 오류가 발생했습니다. (${error.code})`;
    }
  }

  return '로그인 처리 중 알 수 없는 오류가 발생했습니다.';
};
