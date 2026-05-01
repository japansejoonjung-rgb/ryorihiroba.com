import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { awardPointsOnce } from './userService';
import { Recipe } from '@/types/recipe';

export type RecipeComment = {
  id: string;
  recipeId: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  text: string;
  createdAt: string;
  createdAtMs: number;
};

export type DeletedRecipe = {
  id: string;
  recipe: Recipe;
  authorId: string;
  deletedBy: string;
  deletedAt: string;
  source: 'firestore' | 'sample';
};

const defaultImage =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80';

const defaultAuthorAvatar = 'https://i.pravatar.cc/100?u=recipe-hiroba';

const normalizeStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const normalizeRecipe = (id: string, data: Record<string, any>): Recipe => ({
  id,
  title: String(data.title ?? 'タイトルなし'),
  description: String(data.description ?? ''),
  image: String(data.image || defaultImage),
  time: Number(data.time ?? 20),
  servings: Number(data.servings ?? 2),
  difficulty: data.difficulty === '普通' || data.difficulty === '本格' ? data.difficulty : '簡単',
  likes: Number(data.likes ?? 0),
  views: Number(data.views ?? 0),
  saves: Number(data.saves ?? 0),
  authorId: typeof data.authorId === 'string' ? data.authorId : undefined,
  author: {
    name: String(data.author?.name ?? data.authorName ?? '料理好きユーザー'),
    avatar: String(data.author?.avatar ?? data.authorAvatar ?? defaultAuthorAvatar),
    bio: String(data.author?.bio ?? data.authorBio ?? 'レシピ広場の投稿者です。'),
  },
  category: String(data.category ?? '時短料理'),
  tags: normalizeStringArray(data.tags),
  ingredients: Array.isArray(data.ingredients)
    ? data.ingredients.map((item) => ({
        name: String(item?.name ?? ''),
        amount: String(item?.amount ?? ''),
      }))
    : [],
  steps: normalizeStringArray(data.steps),
  tips: String(data.tips ?? ''),
  createdAt: String(data.createdAt ?? new Date().toISOString()),
});

const activityDocId = (userId: string, recipeId: string) =>
  `${encodeURIComponent(userId)}_${encodeURIComponent(recipeId)}`;

const safeUpdateRecipeMetric = async (
  recipeId: string,
  field: 'likes' | 'saves' | 'views',
  amount: number
) => {
  const db = getFirebaseDb();
  const recipeRef = doc(db, 'recipes', recipeId);
  const recipeSnap = await getDoc(recipeRef);

  if (recipeSnap.exists()) {
    try {
      await updateDoc(recipeRef, {
        [field]: increment(amount),
        updatedAt: new Date().toISOString(),
      });
    } catch {
      // Activity documents are the source of truth if metric updates are blocked by rules.
    }
  }
};

const getRecipeSnapshotData = async (recipeId: string) => {
  const db = getFirebaseDb();
  const recipeSnap = await getDoc(doc(db, 'recipes', recipeId));
  return recipeSnap.exists() ? recipeSnap.data() : null;
};

const visitorDocId = (visitorId: string, recipeId: string) =>
  `${encodeURIComponent(visitorId)}_${encodeURIComponent(recipeId)}`;

const recipeToFirestoreData = (recipe: Recipe) => {
  const { id: _id, ...recipeData } = recipe;
  return recipeData;
};

const normalizeDeletedRecipe = (id: string, data: Record<string, any>): DeletedRecipe => {
  const recipeData = typeof data.recipeData === 'object' && data.recipeData
    ? data.recipeData
    : data;

  return {
    id,
    recipe: normalizeRecipe(id, recipeData),
    authorId: String(data.authorId ?? recipeData.authorId ?? ''),
    deletedBy: String(data.deletedBy ?? ''),
    deletedAt: String(data.deletedAt ?? new Date().toISOString()),
    source: data.source === 'sample' ? 'sample' : 'firestore',
  };
};

// 레시피 추가
export const addRecipe = async (
  userId: string,
  recipeData: Omit<Recipe, 'id'>
) => {
  const db = getFirebaseDb();
  const now = new Date().toISOString();
  const docRef = await addDoc(collection(db, 'recipes'), {
    ...recipeData,
    authorId: userId,
    createdAt: recipeData.createdAt || now,
    updatedAt: now,
  });

  try {
    await awardPointsOnce({
      userId,
      amount: 10,
      type: 'recipe_post',
      sourceId: docRef.id,
      description: '레시피投稿 포인트',
    });
  } catch {
    // The recipe should still be posted even if point rules are not ready yet.
  }

  return docRef.id;
};

// 모든 사용자 레시피 가져오기
export const getAllRecipes = async () => {
  const db = getFirebaseDb();
  const querySnapshot = await getDocs(collection(db, 'recipes'));

  return querySnapshot.docs
    .map((recipeDoc) => normalizeRecipe(recipeDoc.id, recipeDoc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const subscribeAllRecipes = (
  onUpdate: (recipes: Recipe[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = getFirebaseDb();
  return onSnapshot(
    collection(db, 'recipes'),
    (snapshot) => {
      onUpdate(
        snapshot.docs
          .map((recipeDoc) => normalizeRecipe(recipeDoc.id, recipeDoc.data()))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      );
    },
    (error) => onError?.(error)
  );
};

export const getDeletedRecipeIds = async () => {
  const db = getFirebaseDb();
  const querySnapshot = await getDocs(collection(db, 'deletedRecipeIds'));
  return new Set(querySnapshot.docs.map((item) => item.id));
};

export const subscribeDeletedRecipeIds = (
  onUpdate: (ids: Set<string>) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const db = getFirebaseDb();
  return onSnapshot(
    collection(db, 'deletedRecipeIds'),
    (snapshot) => {
      onUpdate(new Set(snapshot.docs.map((item) => item.id)));
    },
    (error) => onError?.(error)
  );
};

export const isRecipeDeleted = async (recipeId: string) => {
  const db = getFirebaseDb();
  const deletedSnap = await getDoc(doc(db, 'deletedRecipeIds', recipeId));
  return deletedSnap.exists();
};

export const markRecipeDeleted = async ({
  recipeId,
  deletedBy,
  authorId,
}: {
  recipeId: string;
  deletedBy: string;
  authorId?: string;
}) => {
  const db = getFirebaseDb();
  await setDoc(doc(db, 'deletedRecipeIds', recipeId), {
    recipeId,
    deletedBy,
    authorId: authorId ?? '',
    deletedAt: new Date().toISOString(),
  });
};

export const getDeletedRecipesForUser = async (
  userId: string,
  isAdminUser: boolean
): Promise<DeletedRecipe[]> => {
  const db = getFirebaseDb();
  const snapshots = isAdminUser
    ? [await getDocs(collection(db, 'deletedRecipes'))]
    : await Promise.all([
        getDocs(query(collection(db, 'deletedRecipes'), where('deletedBy', '==', userId))),
        getDocs(query(collection(db, 'deletedRecipes'), where('authorId', '==', userId))),
      ]);

  const deletedMap = new Map<string, DeletedRecipe>();
  snapshots.forEach((snapshot) => {
    snapshot.docs.forEach((item) => {
      deletedMap.set(item.id, normalizeDeletedRecipe(item.id, item.data()));
    });
  });

  return Array.from(deletedMap.values())
    .sort((a, b) => b.deletedAt.localeCompare(a.deletedAt));
};

// 특정 레시피 가져오기
export const getRecipeById = async (recipeId: string) => {
  const db = getFirebaseDb();
  const docRef = doc(db, 'recipes', recipeId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error('레시피를 찾을 수 없습니다');
  }

  return normalizeRecipe(docSnap.id, docSnap.data());
};

// 사용자의 레시피 가져오기
export const getUserRecipes = async (userId: string) => {
  const db = getFirebaseDb();
  const recipesQuery = query(collection(db, 'recipes'), where('authorId', '==', userId));
  const querySnapshot = await getDocs(recipesQuery);

  return querySnapshot.docs
    .map((recipeDoc) => normalizeRecipe(recipeDoc.id, recipeDoc.data()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

// 레시피 수정
export const updateRecipe = async (
  recipeId: string,
  recipeData: Partial<Recipe>
) => {
  const db = getFirebaseDb();
  const docRef = doc(db, 'recipes', recipeId);
  await updateDoc(docRef, {
    ...recipeData,
    updatedAt: new Date().toISOString(),
  });
};

// 레시피 삭제
export const deleteRecipe = async (
  recipeId: string,
  options: { deletedBy: string; recipe?: Recipe }
) => {
  const db = getFirebaseDb();
  const recipeRef = doc(db, 'recipes', recipeId);
  const recipeSnap = await getDoc(recipeRef);
  const now = new Date().toISOString();

  if (!recipeSnap.exists() && !options.recipe) {
    await markRecipeDeleted({ recipeId, deletedBy: options.deletedBy });
    return;
  }

  const source: DeletedRecipe['source'] = recipeSnap.exists() ? 'firestore' : 'sample';
  const recipeData = recipeSnap.exists()
    ? recipeSnap.data()
    : recipeToFirestoreData(options.recipe as Recipe);
  const authorId = String(recipeData.authorId ?? options.recipe?.authorId ?? '');

  await setDoc(doc(db, 'deletedRecipes', recipeId), {
    recipeId,
    recipeData,
    authorId,
    deletedBy: options.deletedBy,
    deletedAt: now,
    source,
  });

  await setDoc(doc(db, 'deletedRecipeIds', recipeId), {
    recipeId,
    deletedBy: options.deletedBy,
    authorId,
    deletedAt: now,
  });

  if (recipeSnap.exists()) {
    await deleteDoc(recipeRef);
  }
};

export const restoreDeletedRecipe = async (recipeId: string) => {
  const db = getFirebaseDb();
  const deletedRef = doc(db, 'deletedRecipes', recipeId);
  const deletedSnap = await getDoc(deletedRef);

  if (!deletedSnap.exists()) {
    throw new Error('삭제된 레시피를 찾을 수 없습니다.');
  }

  const deletedData = deletedSnap.data();
  const source = deletedData.source === 'sample' ? 'sample' : 'firestore';

  if (source !== 'sample') {
    const recipeData =
      typeof deletedData.recipeData === 'object' && deletedData.recipeData
        ? deletedData.recipeData
        : {};
    await setDoc(doc(db, 'recipes', recipeId), {
      ...recipeData,
      updatedAt: new Date().toISOString(),
    });
  }

  await deleteDoc(deletedRef);
  await deleteDoc(doc(db, 'deletedRecipeIds', recipeId));
};

export const getRecipeActivityStatus = async (userId: string, recipeId: string) => {
  const db = getFirebaseDb();
  const likeSnap = await getDoc(doc(db, 'recipeLikes', activityDocId(userId, recipeId)));
  const saveSnap = await getDoc(doc(db, 'favorites', activityDocId(userId, recipeId)));

  return {
    liked: likeSnap.exists(),
    saved: saveSnap.exists(),
  };
};

export const toggleRecipeLike = async (
  userId: string,
  recipeId: string,
  currentValue: boolean
) => {
  const db = getFirebaseDb();
  const likeRef = doc(db, 'recipeLikes', activityDocId(userId, recipeId));

  if (currentValue) {
    await deleteDoc(likeRef);
    await safeUpdateRecipeMetric(recipeId, 'likes', -1);
    return false;
  }

  await setDoc(likeRef, {
    userId,
    recipeId,
    createdAt: new Date().toISOString(),
  });
  await safeUpdateRecipeMetric(recipeId, 'likes', 1);

  const recipeData = await getRecipeSnapshotData(recipeId);
  const authorId = typeof recipeData?.authorId === 'string' ? recipeData.authorId : undefined;
  if (authorId && authorId !== userId) {
    const currentLikes = Number(recipeData?.likes ?? 0) + 1;
    if (currentLikes % 100 === 0) {
      try {
        await awardPointsOnce({
          userId: authorId,
          amount: 10,
          type: 'like_milestone',
          sourceId: `${recipeId}_${currentLikes}`,
          description: `추천 ${currentLikes}개 달성 포인트`,
        });
      } catch {
        // Likes still count even if point rules are not ready yet.
      }
    }
  }

  return true;
};

export const recordRecipeView = async (recipeId: string, visitorId: string) => {
  const db = getFirebaseDb();
  const viewRef = doc(db, 'recipeViews', visitorDocId(visitorId, recipeId));
  const viewSnap = await getDoc(viewRef);

  if (viewSnap.exists()) return false;

  await setDoc(viewRef, {
    recipeId,
    visitorId,
    createdAt: new Date().toISOString(),
  });
  await safeUpdateRecipeMetric(recipeId, 'views', 1);
  return true;
};

export const toggleRecipeSave = async (
  userId: string,
  recipeId: string,
  currentValue: boolean
) => {
  const db = getFirebaseDb();
  const favoriteRef = doc(db, 'favorites', activityDocId(userId, recipeId));

  if (currentValue) {
    await deleteDoc(favoriteRef);
    await safeUpdateRecipeMetric(recipeId, 'saves', -1);
    return false;
  }

  await setDoc(favoriteRef, {
    userId,
    recipeId,
    createdAt: new Date().toISOString(),
  });
  await safeUpdateRecipeMetric(recipeId, 'saves', 1);
  return true;
};

export const getRecipeComments = async (recipeId: string): Promise<RecipeComment[]> => {
  const db = getFirebaseDb();
  const commentsQuery = query(collection(db, 'comments'), where('recipeId', '==', recipeId));
  const querySnapshot = await getDocs(commentsQuery);

  return querySnapshot.docs
    .map((commentDoc) => {
      const data = commentDoc.data();
      return {
        id: commentDoc.id,
        recipeId: String(data.recipeId ?? recipeId),
        userId: String(data.userId ?? ''),
        authorName: String(data.authorName ?? '料理好きユーザー'),
        authorAvatar: String(data.authorAvatar ?? defaultAuthorAvatar),
        text: String(data.text ?? ''),
        createdAt: String(data.createdAt ?? new Date().toISOString()),
        createdAtMs: Number(data.createdAtMs ?? 0),
      };
    })
    .sort((a, b) => a.createdAtMs - b.createdAtMs);
};

export const addRecipeComment = async (
  recipeId: string,
  userId: string,
  authorName: string,
  authorAvatar: string,
  text: string
) => {
  const db = getFirebaseDb();
  const now = new Date();
  const docRef = await addDoc(collection(db, 'comments'), {
    recipeId,
    userId,
    authorName,
    authorAvatar,
    text,
    createdAt: now.toISOString(),
    createdAtMs: now.getTime(),
  });

  return docRef.id;
};
