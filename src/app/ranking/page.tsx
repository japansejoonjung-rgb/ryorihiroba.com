"use client";

import RankingList from "@/components/RankingList";
import RecipeCard from "@/components/RecipeCard";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { useLanguage } from "@/context/LanguageContext";

export default function RankingPage() {
  const { recipes, loading, error } = useCommunityRecipes();
  const { t } = useLanguage();
  const byViews = [...recipes].sort((a, b) => b.views - a.views).slice(0, 5);
  const byLikes = [...recipes].sort((a, b) => b.likes - a.likes).slice(0, 5);
  const bySaves = [...recipes].sort((a, b) => b.saves - a.saves).slice(0, 5);
  const weekly = [...recipes].sort((a, b) => b.views + b.likes - (a.views + a.likes)).slice(0, 4);
  const newest = [...recipes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="font-bold text-orange-500">{t.ranking}</p>
        <h1 className="mt-2 text-3xl font-black">{t.rankingTitle}</h1>
        <p className="mt-3 text-stone-500">{t.rankingDescription}</p>
      </div>
      {loading && <p className="mb-5 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600">{t.loadedRecipes}</p>}
      {error && <p className="mb-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{t.loadRecipesFailed}</p>}
      <div className="grid gap-6 lg:grid-cols-3">
        <RankingList title={t.viewsRanking} recipes={byViews} type="views" />
        <RankingList title={t.likesRanking} recipes={byLikes} type="likes" />
        <RankingList title={t.savesRanking} recipes={bySaves} type="saves" />
      </div>
      <section className="mt-12">
        <div className="mb-6">
          <p className="font-bold text-orange-500">Weekly</p>
          <h2 className="text-2xl font-black">{t.weeklyPopular}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{weekly.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div>
      </section>
      <section className="mt-12">
        <div className="mb-6">
          <p className="font-bold text-orange-500">New</p>
          <h2 className="text-2xl font-black">{t.newestPopular}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{newest.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div>
      </section>
    </div>
  );
}
