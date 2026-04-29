"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import RecipeDetail from "@/components/RecipeDetail";
import { useLanguage } from "@/context/LanguageContext";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";

function RecipeDetailContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { recipes, loading } = useCommunityRecipes();
  const recipeId = searchParams.get("id") ?? "";
  const recipe = useMemo(() => recipes.find((item) => item.id === recipeId) ?? null, [recipeId, recipes]);

  const relatedRecipes = useMemo(() => {
    if (!recipe) return [];
    const sameCategory = recipes
      .filter((item) => item.id !== recipe.id && item.category === recipe.category)
      .slice(0, 3);
    return sameCategory.length > 0
      ? sameCategory
      : recipes.filter((item) => item.id !== recipe.id).slice(0, 3);
  }, [recipe, recipes]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 font-bold text-stone-600">{t.recipeLoading}</div>;
  }

  if (!recipe) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black">{t.recipeNotFound}</h1>
        <p className="mt-3 leading-7 text-stone-500">{t.recipeNotFoundDesc}</p>
        <Link href="/recipes" className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600">
          {t.goRecipeList}
        </Link>
      </div>
    );
  }

  return <RecipeDetail recipe={recipe} relatedRecipes={relatedRecipes} />;
}

export default function RecipeDetailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 font-bold text-stone-600">Loading...</div>}>
      <RecipeDetailContent />
    </Suspense>
  );
}
