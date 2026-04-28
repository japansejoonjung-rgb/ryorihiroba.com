import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { Recipe } from '@/types/recipe';

// 레시피 추가
export const addRecipe = async (
  userId: string,
  recipeData: Omit<Recipe, 'id'>
) => {
  try {
    const db = getFirebaseDb();
    const docRef = await addDoc(collection(db, 'recipes'), {
      ...recipeData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// 모든 레시피 가져오기
export const getAllRecipes = async () => {
  try {
    const db = getFirebaseDb();
    const querySnapshot = await getDocs(collection(db, 'recipes'));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw error;
  }
};

// 특정 레시피 가져오기
export const getRecipeById = async (recipeId: string) => {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, 'recipes', recipeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('레시피를 찾을 수 없습니다');
    }
  } catch (error) {
    throw error;
  }
};

// 사용자의 레시피 가져오기
export const getUserRecipes = async (userId: string) => {
  try {
    const db = getFirebaseDb();
    const q = query(collection(db, 'recipes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw error;
  }
};

// 레시피 수정
export const updateRecipe = async (
  recipeId: string,
  recipeData: Partial<Recipe>
) => {
  try {
    const db = getFirebaseDb();
    const docRef = doc(db, 'recipes', recipeId);
    await updateDoc(docRef, {
      ...recipeData,
      updatedAt: new Date(),
    });
  } catch (error) {
    throw error;
  }
};

// 레시피 삭제
export const deleteRecipe = async (recipeId: string) => {
  try {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, 'recipes', recipeId));
  } catch (error) {
    throw error;
  }
};

// 찜한 레시피 추가
export const addFavorite = async (userId: string, recipeId: string) => {
  try {
    const db = getFirebaseDb();
    await addDoc(collection(db, 'favorites'), {
      userId,
      recipeId,
      createdAt: new Date(),
    });
  } catch (error) {
    throw error;
  }
};

// 찜한 레시피 제거
export const removeFavorite = async (userId: string, recipeId: string) => {
  try {
    const db = getFirebaseDb();
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      where('recipeId', '==', recipeId)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.docs.forEach((doc) => deleteDoc(doc.ref));
  } catch (error) {
    throw error;
  }
};

// 사용자의 찜한 레시피 가져오기
export const getUserFavorites = async (userId: string) => {
  try {
    const db = getFirebaseDb();
    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data().recipeId);
  } catch (error) {
    throw error;
  }
};
