"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Coins, Loader2, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import RecipeCard from "@/components/RecipeCard";
import { deleteRecipe, getUserRecipes } from "@/lib/firestoreService";
import { getPointTransactions, PointTransaction } from "@/lib/userService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Recipe } from "@/types/recipe";

export default function MyPage() {
  const { user, loading } = useAuth();
  const { profile } = useUserProfile(user?.uid);
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    if (!user) {
      setMyRecipes([]);
      setTransactions([]);
      setPageLoading(false);
      return;
    }

    let mounted = true;
    setPageLoading(true);
    Promise.all([getUserRecipes(user.uid), getPointTransactions(user.uid)])
      .then(([recipes, pointItems]) => {
        if (!mounted) return;
        setMyRecipes(recipes);
        setTransactions(pointItems);
      })
      .catch(() => {
        if (!mounted) return;
        setMyRecipes([]);
        setTransactions([]);
      })
      .finally(() => {
        if (mounted) setPageLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  const handleDelete = async (recipeId: string) => {
    const confirmed = window.confirm("このレシピを削除しますか？");
    if (!confirmed) return;

    setDeletingId(recipeId);
    try {
      await deleteRecipe(recipeId);
      setMyRecipes((items) => items.filter((item) => item.id !== recipeId));
    } finally {
      setDeletingId("");
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <Loader2 className="mx-auto animate-spin text-orange-500" size={32} />
        <p className="mt-3 font-bold text-stone-600">マイページを読み込んでいます。</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black">ログインが必要です</h1>
        <p className="mt-3 text-stone-500">ポイントと投稿管理を見るにはログインしてください。</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600">
          ログインへ
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="font-bold text-orange-500">My Page</p>
        <h1 className="mt-2 text-3xl font-black">マイページ</h1>
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <img src={profile?.photoURL || user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}`} alt="profile" className="h-16 w-16 rounded-full" />
            <div>
              <h2 className="text-xl font-black">{profile?.displayName || user.displayName || user.email}</h2>
              <p className="text-sm text-stone-500">{profile?.email || user.email}</p>
              {profile?.role === "admin" && <span className="mt-2 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">運営者</span>}
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-amber-800">
            <div className="flex items-center gap-2 text-sm font-bold"><Coins size={18} />保有ポイント</div>
            <p className="mt-2 text-4xl font-black">{profile?.points ?? 0}P</p>
          </div>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">ポイント履歴</h2>
          <div className="mt-4 grid gap-3">
            {transactions.length > 0 ? transactions.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 text-sm">
                <div>
                  <p className="font-bold">{item.description}</p>
                  <p className="text-xs text-stone-400">{new Date(item.createdAt).toLocaleDateString("ja-JP")}</p>
                </div>
                <span className="font-black text-amber-700">+{item.amount}P</span>
              </div>
            )) : <p className="rounded-2xl bg-stone-50 p-4 text-sm font-semibold text-stone-500">まだポイント履歴がありません。</p>}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-orange-500">My Recipes</p>
            <h2 className="text-2xl font-black">自分の投稿</h2>
          </div>
          <Link href="/post" className="rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">新規投稿</Link>
        </div>

        {myRecipes.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myRecipes.map((recipe) => (
              <div key={recipe.id} className="grid gap-3">
                <RecipeCard recipe={recipe} />
                <div className="flex gap-2">
                  <Link href={`/post?edit=${recipe.id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-orange-200 px-4 py-3 text-sm font-bold text-orange-500 hover:bg-orange-50">
                    <Pencil size={16} />
                    編集
                  </Link>
                  <button onClick={() => handleDelete(recipe.id)} disabled={deletingId === recipe.id} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-rose-200 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-stone-400">
                    {deletingId === recipe.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
            <p className="font-bold text-stone-600">まだ投稿がありません。</p>
            <Link href="/post" className="mt-5 inline-flex rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600">最初のレシピを投稿</Link>
          </div>
        )}
      </section>
    </div>
  );
}
