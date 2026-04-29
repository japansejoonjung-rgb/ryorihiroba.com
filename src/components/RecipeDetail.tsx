"use client";

import { Recipe } from "@/types/recipe";
import RecipeCard from "@/components/RecipeCard";
import { Bookmark, Clock, Heart, Loader2, Share2, Users } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  addRecipeComment,
  deleteRecipe,
  getRecipeActivityStatus,
  getRecipeComments,
  recordRecipeView,
  RecipeComment,
  toggleRecipeLike,
  toggleRecipeSave,
} from "@/lib/firestoreService";
import { banUser } from "@/lib/userService";

type Props = {
  recipe: Recipe;
  relatedRecipes: Recipe[];
};

export default function RecipeDetail({ recipe, relatedRecipes }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const { t, categoryName } = useLanguage();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(recipe.likes);
  const [comments, setComments] = useState<RecipeComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(true);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [viewCount, setViewCount] = useState(recipe.views);

  useEffect(() => {
    setLikeCount(recipe.likes);
    setViewCount(recipe.views);
  }, [recipe.likes, recipe.views]);

  useEffect(() => {
    const storageKey = "recipe-hiroba-visitor-id";
    const visitorId = user?.uid || localStorage.getItem(storageKey) || crypto.randomUUID();
    localStorage.setItem(storageKey, visitorId);

    recordRecipeView(recipe.id, visitorId)
      .then((recorded) => {
        if (recorded) setViewCount((count) => count + 1);
      })
      .catch(() => undefined);
  }, [recipe.id, user?.uid]);

  useEffect(() => {
    if (!user) {
      setLiked(false);
      setSaved(false);
      return;
    }

    let mounted = true;
    getRecipeActivityStatus(user.uid, recipe.id)
      .then((status) => {
        if (!mounted) return;
        setLiked(status.liked);
        setSaved(status.saved);
      })
      .catch(() => {
        if (!mounted) return;
        setLiked(false);
        setSaved(false);
      });

    return () => {
      mounted = false;
    };
  }, [recipe.id, user]);

  useEffect(() => {
    let mounted = true;
    setCommentLoading(true);

    getRecipeComments(recipe.id)
      .then((items) => {
        if (mounted) setComments(items);
      })
      .catch(() => {
        if (mounted) setComments([]);
      })
      .finally(() => {
        if (mounted) setCommentLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [recipe.id]);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: recipe.title, text: recipe.description, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert(t.shareCopied);
    }
  };

  const handleLike = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    const nextLiked = await toggleRecipeLike(user.uid, recipe.id, liked);
    setLiked(nextLiked);
    setLikeCount((count) => count + (nextLiked ? 1 : -1));
  };

  const handleSave = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    const nextSaved = await toggleRecipeSave(user.uid, recipe.id, saved);
    setSaved(nextSaved);
  };

  const handleCommentSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }

    const text = commentText.trim();
    if (!text) return;

    const authorName = user.displayName || user.email?.split("@")[0] || t.authorDefault;
    const authorAvatar = user.photoURL || `https://i.pravatar.cc/100?u=${encodeURIComponent(user.uid)}`;
    const now = new Date();

    setCommentSubmitting(true);
    try {
      const id = await addRecipeComment(recipe.id, user.uid, authorName, authorAvatar, text);
      setComments((items) => [
        ...items,
        {
          id,
          recipeId: recipe.id,
          userId: user.uid,
          authorName,
          authorAvatar,
          text,
          createdAt: now.toISOString(),
          createdAtMs: now.getTime(),
        },
      ]);
      setCommentText("");
    } finally {
      setCommentSubmitting(false);
    }
  };

  const canManageRecipe = Boolean(user && (profile?.role === "admin" || recipe.authorId === user.uid));

  const handleDeleteRecipe = async () => {
    const confirmed = window.confirm(t.deleteConfirm);
    if (!confirmed) return;

    await deleteRecipe(recipe.id, { hideEverywhere: profile?.role === "admin" });
    router.push("/recipes");
  };

  const handleBanAuthor = async () => {
    if (!recipe.authorId) return;
    const confirmed = window.confirm(t.banConfirm);
    if (!confirmed) return;

    await banUser(recipe.authorId);
    alert(t.banDone);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm sm:rounded-3xl">
          <img src={recipe.image} alt={recipe.title} className="h-[240px] w-full object-cover sm:h-[320px] md:h-[460px]" />
        </div>
        <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
          <div className="mb-3 inline-flex rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-500">{categoryName(recipe.category)}</div>
          <h1 className="text-2xl font-black leading-tight text-stone-900 md:text-4xl">{recipe.title}</h1>
          <p className="mt-4 leading-7 text-stone-600">{recipe.description}</p>
          <div className="mt-6 flex items-center gap-3">
            <img src={recipe.author.avatar} alt={recipe.author.name} className="h-12 w-12 rounded-full" />
            <div><p className="font-bold">{recipe.author.name}</p><p className="text-sm text-stone-500">{recipe.author.bio}</p></div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-2xl bg-orange-50 p-3 text-center sm:p-4"><Clock className="mx-auto text-orange-500" size={22} /><p className="mt-2 text-xs font-bold sm:text-sm">{recipe.time}{t.minutes}</p></div>
            <div className="rounded-2xl bg-orange-50 p-3 text-center sm:p-4"><Users className="mx-auto text-orange-500" size={22} /><p className="mt-2 text-xs font-bold sm:text-sm">{recipe.servings}{t.people}</p></div>
            <div className="rounded-2xl bg-orange-50 p-3 text-center sm:p-4"><span className="text-xl">👁</span><p className="mt-2 text-xs font-bold sm:text-sm">{viewCount.toLocaleString()}</p></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={handleLike} className={`tap-target rounded-full px-5 py-3 text-sm font-bold ${liked ? "bg-rose-500 text-white" : "bg-rose-50 text-rose-500 hover:bg-rose-100"}`}><span className="inline-flex items-center gap-2"><Heart size={18} fill={liked ? "currentColor" : "none"} />{t.likes} {likeCount}</span></button>
            <button onClick={handleSave} className={`tap-target rounded-full px-5 py-3 text-sm font-bold ${saved ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-500 hover:bg-orange-100"}`}><span className="inline-flex items-center gap-2"><Bookmark size={18} fill={saved ? "currentColor" : "none"} />{t.save}</span></button>
            <button onClick={handleShare} className="tap-target rounded-full bg-stone-100 px-5 py-3 text-sm font-bold text-stone-600 hover:bg-stone-200"><span className="inline-flex items-center gap-2"><Share2 size={18} />{t.share}</span></button>
          </div>
          {canManageRecipe && (
            <div className="mt-4 flex flex-wrap gap-3 border-t border-orange-50 pt-4">
              {recipe.authorId === user?.uid && <button onClick={() => router.push(`/post?edit=${recipe.id}`)} className="rounded-full border border-orange-200 px-5 py-3 text-sm font-bold text-orange-500 hover:bg-orange-50">{t.edit}</button>}
              <button onClick={handleDeleteRecipe} className="rounded-full border border-rose-200 px-5 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50">{t.manageDelete}</button>
              {profile?.role === "admin" && recipe.authorId && recipe.authorId !== user?.uid && (
                <button onClick={handleBanAuthor} className="rounded-full bg-rose-500 px-5 py-3 text-sm font-bold text-white hover:bg-rose-600">{t.banAuthor}</button>
              )}
            </div>
          )}
        </div>
      </section>
      <section className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">{t.recipeIngredients}</h2><p className="mt-1 text-sm text-stone-500">{recipe.servings}{t.people}</p>
          <div className="mt-5 grid gap-3">{recipe.ingredients.map((item) => <div key={item.name} className="flex justify-between border-b border-orange-50 pb-3 text-sm"><span className="font-medium">{item.name}</span><span className="text-stone-500">{item.amount}</span></div>)}</div>
        </div>
        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">{t.recipeSteps}</h2>
          <div className="mt-6 grid gap-5">{recipe.steps.map((step, index) => <div key={step} className="flex gap-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 font-black text-white">{index + 1}</div><p className="leading-7 text-stone-700">{step}</p></div>)}</div>
          <div className="mt-8 rounded-2xl bg-orange-50 p-5"><h3 className="font-black text-orange-600">{t.cookingTips}</h3><p className="mt-2 leading-7 text-stone-600">{recipe.tips}</p></div>
        </div>
      </section>
      <section className="mt-10 rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black">{t.comments}</h2>
        <div className="mt-5 grid gap-4">
          {commentLoading ? (
            <div className="flex items-center gap-2 rounded-2xl bg-stone-50 p-4 text-sm font-semibold text-stone-500">
              <Loader2 size={18} className="animate-spin" />
              {t.commentsLoading}
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl bg-stone-50 p-4">
                <div className="flex items-center gap-3">
                  <img src={comment.authorAvatar} alt={comment.authorName} className="h-9 w-9 rounded-full" />
                  <div>
                    <p className="font-bold">{comment.authorName}</p>
                    <p className="text-xs text-stone-400">{new Date(comment.createdAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-600">{comment.text}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-stone-50 p-4 text-sm font-semibold text-stone-500">{t.firstComment}</div>
          )}

          <form onSubmit={handleCommentSubmit} className="grid gap-3">
            <textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder={user ? t.commentPlaceholder : t.commentLoginPlaceholder} className="min-h-28 rounded-2xl border border-orange-100 p-4 outline-none focus:border-orange-300" />
            <button disabled={commentSubmitting || !commentText.trim()} className="inline-flex w-fit items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-stone-300">
              {commentSubmitting && <Loader2 size={16} className="animate-spin" />}
              {t.commentSubmit}
            </button>
          </form>
        </div>
      </section>
      <section className="mt-12"><h2 className="text-2xl font-black">{t.relatedRecipes}</h2><div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{relatedRecipes.map((item) => <RecipeCard key={item.id} recipe={item} />)}</div></section>
    </div>
  );
}
