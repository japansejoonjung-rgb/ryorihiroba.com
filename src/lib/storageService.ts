import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirebaseStorage } from './firebase';

// 이미지 업로드
export const uploadRecipeImage = async (
  userId: string,
  recipeId: string,
  file: File
) => {
  try {
    const storage = getFirebaseStorage();
    const storageRef = ref(
      storage,
      `recipes/${userId}/${recipeId}/${file.name}`
    );
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

// 이미지 다운로드 URL 가져오기
export const getImageURL = async (path: string) => {
  try {
    const storage = getFirebaseStorage();
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw error;
  }
};

// 이미지 삭제
export const deleteRecipeImage = async (path: string) => {
  try {
    const storage = getFirebaseStorage();
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    throw error;
  }
};
