"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Coins, Loader2, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import RecipeCard from "@/components/RecipeCard";
import { deleteRecipe, getUserRecipes } from "@/lib/firestoreService";
import {
  createAdminPointAdjustment,
  getAllUserProfiles,
  getPointTransactions,
  PointTransaction,
  UserProfile,
} from "@/lib/userService";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Recipe } from "@/types/recipe";

export default function MyPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const { profile, refresh: refreshProfile } = useUserProfile(user?.uid);
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [targetUserId, setTargetUserId] = useState("");
  const [pointAmount, setPointAmount] = useState("10");
  const [pointReason, setPointReason] = useState("");
  const [adminSubmitting, setAdminSubmitting] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [adminError, setAdminError] = useState("");

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

  useEffect(() => {
    if (!user || profile?.role !== "admin") return;

    let mounted = true;
    setAdminLoading(true);
    getAllUserProfiles()
      .then((users) => {
        if (!mounted) return;
        setAllUsers(users);
        setTargetUserId((current) => current || user.uid);
      })
      .catch(() => {
        if (mounted) setAllUsers([]);
      })
      .finally(() => {
        if (mounted) setAdminLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [profile?.role, user]);

  const targetUser = useMemo(
    () => allUsers.find((item) => item.uid === targetUserId),
    [allUsers, targetUserId],
  );

  const getPointDescription = (item: PointTransaction) => {
    if (item.type === "signup") return t.pointSignup;
    if (item.type === "recipe_post") return t.pointRecipePost;
    if (item.type === "like_milestone") return t.pointLikeMilestone;
    return item.description;
  };

  const reloadAdminUsers = async () => {
    if (profile?.role !== "admin") return;
    const users = await getAllUserProfiles();
    setAllUsers(users);
  };

  const handleDelete = async (recipeId: string) => {
    const confirmed = window.confirm(t.deleteConfirm);
    if (!confirmed) return;

    setDeletingId(recipeId);
    try {
      await deleteRecipe(recipeId, { hideEverywhere: profile?.role === "admin" });
      setMyRecipes((items) => items.filter((item) => item.id !== recipeId));
    } finally {
      setDeletingId("");
    }
  };

  const handleAdminPoint = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || profile?.role !== "admin" || !targetUserId) return;

    setAdminMessage("");
    setAdminError("");
    setAdminSubmitting(true);
    try {
      await createAdminPointAdjustment({
        adminId: user.uid,
        userId: targetUserId,
        amount: Number(pointAmount),
        description: pointReason,
      });
      setAdminMessage(t.pointAdjustSuccess);
      setPointReason("");
      await reloadAdminUsers();
      if (targetUserId === user.uid) {
        await refreshProfile();
        setTransactions(await getPointTransactions(user.uid));
      }
    } catch {
      setAdminError(t.pointAdjustFailed);
    } finally {
      setAdminSubmitting(false);
    }
  };

  if (loading || pageLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <Loader2 className="mx-auto animate-spin text-orange-500" size={32} />
        <p className="mt-3 font-bold text-stone-600">{t.myPageLoading}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black">{t.loginRequired}</h1>
        <p className="mt-3 text-stone-500">{t.loginRequiredMypage}</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600">
          {t.goLogin}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="font-bold text-orange-500">My Page</p>
        <h1 className="mt-2 text-3xl font-black">{t.myPage}</h1>
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <img src={profile?.photoURL || user.photoURL || `https://i.pravatar.cc/100?u=${user.uid}`} alt="profile" className="h-16 w-16 rounded-full" />
            <div>
              <h2 className="text-xl font-black">{profile?.displayName || user.displayName || user.email}</h2>
              <p className="text-sm text-stone-500">{profile?.email || user.email}</p>
              {profile?.role === "admin" && <span className="mt-2 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">{t.roleAdmin}</span>}
            </div>
          </div>
          <div className="mt-6 rounded-2xl bg-amber-50 p-5 text-amber-800">
            <div className="flex items-center gap-2 text-sm font-bold"><Coins size={18} />{t.pointsOwned}</div>
            <p className="mt-2 text-4xl font-black">{profile?.points ?? 0}P</p>
          </div>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">{t.pointHistory}</h2>
          <div className="mt-4 grid gap-3">
            {transactions.length > 0 ? transactions.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-3 text-sm">
                <div>
                  <p className="font-bold">{getPointDescription(item)}</p>
                  <p className="text-xs text-stone-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`font-black ${item.amount >= 0 ? "text-amber-700" : "text-rose-600"}`}>
                  {item.amount > 0 ? "+" : ""}{item.amount}P
                </span>
              </div>
            )) : <p className="rounded-2xl bg-stone-50 p-4 text-sm font-semibold text-stone-500">{t.noPointHistory}</p>}
          </div>
        </div>
      </section>

      {profile?.role === "admin" && (
        <section className="mt-10 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="font-bold text-rose-500">{t.roleAdmin}</p>
            <h2 className="mt-1 text-2xl font-black">{t.adminPanel}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">{t.adminPanelDesc}</p>
          </div>

          {adminLoading ? (
            <p className="rounded-2xl bg-stone-50 p-4 text-sm font-semibold text-stone-500">{t.usersLoading}</p>
          ) : (
            <form onSubmit={handleAdminPoint} className="grid gap-4 lg:grid-cols-[1.3fr_0.6fr_1fr_auto] lg:items-end">
              <label className="grid gap-2">
                <span className="text-sm font-bold">{t.targetUser}</span>
                <select value={targetUserId} onChange={(event) => setTargetUserId(event.target.value)} className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300">
                  {allUsers.map((item) => (
                    <option key={item.uid} value={item.uid}>
                      {item.uid === user.uid ? `${t.currentUser} · ` : ""}{item.email || item.displayName} · {item.points}P
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">{t.pointAmount}</span>
                <input value={pointAmount} onChange={(event) => setPointAmount(event.target.value)} type="number" step="1" required className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-bold">{t.pointReason}</span>
                <input value={pointReason} onChange={(event) => setPointReason(event.target.value)} placeholder={t.pointReasonPlaceholder} className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" />
              </label>
              <button disabled={adminSubmitting || !targetUser} className="inline-flex justify-center rounded-full bg-rose-500 px-6 py-3 font-bold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-stone-300">
                {adminSubmitting ? <Loader2 size={18} className="animate-spin" /> : t.applyPoint}
              </button>
            </form>
          )}
          {adminMessage && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">{adminMessage}</p>}
          {adminError && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">{adminError}</p>}
        </section>
      )}

      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-orange-500">My Recipes</p>
            <h2 className="text-2xl font-black">{t.myRecipes}</h2>
          </div>
          <Link href="/post" className="rounded-full bg-orange-500 px-5 py-3 text-sm font-bold text-white hover:bg-orange-600">{t.newPost}</Link>
        </div>

        {myRecipes.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {myRecipes.map((recipe) => (
              <div key={recipe.id} className="grid gap-3">
                <RecipeCard recipe={recipe} />
                <div className="flex gap-2">
                  <Link href={`/post?edit=${recipe.id}`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-orange-200 px-4 py-3 text-sm font-bold text-orange-500 hover:bg-orange-50">
                    <Pencil size={16} />
                    {t.edit}
                  </Link>
                  <button onClick={() => handleDelete(recipe.id)} disabled={deletingId === recipe.id} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-rose-200 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-stone-400">
                    {deletingId === recipe.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    {t.delete}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
            <p className="font-bold text-stone-600">{t.noMyRecipes}</p>
            <Link href="/post" className="mt-5 inline-flex rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600">{t.firstRecipePost}</Link>
          </div>
        )}
      </section>
    </div>
  );
}
