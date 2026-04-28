"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import RecipeDetail from "@/components/RecipeDetail";
import { recipes as sampleRecipes } from "@/data/recipes";
import { getRecipeById } from "@/lib/firestoreService";
import { Recipe } from "@/types/recipe";

function RecipeDetailContent() {
  const searchParams = useSearchParams();
  const recipeId = searchParams.get("id") ?? "";
  const [recipe, setRecipe] = useState<Recipe | null>(() => sampleRecipes.find((item) => item.id === recipeId) ?? null);
  const [loading, setLoading] = useState(Boolean(recipeId) && !recipe);

  useEffect(() => {
    if (!recipeId) {
      setRecipe(null);
      setLoading(false);
      return;
    }

    const sampleRecipe = sampleRecipes.find((item) => item.id === recipeId);
    if (sampleRecipe) {
      setRecipe(sampleRecipe);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    getRecipeById(recipeId)
      .then((item) => {
        if (mounted) setRecipe(item);
      })
      .catch(() => {
        if (mounted) setRecipe(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [recipeId]);

  const relatedRecipes = useMemo(() => {
    if (!recipe) return [];
    const sameCategory = sampleRecipes.filter((item) => item.id !== recipe.id && item.category === recipe.category).slice(0, 3);
    return sameCategory.length > 0 ? sameCategory : sampleRecipes.filter((item) => item.id !== recipe.id).slice(0, 3);
  }, [recipe]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 font-bold text-stone-600">レシピを読み込み中です。</div>;
  }

  if (!recipe) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-black">レシピが見つかりません</h1>
        <p className="mt-3 leading-7 text-stone-500">削除されたか、URLが間違っている可能性があります。</p>
        <Link href="/recipes" className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600">
          レシピ一覧へ
        </Link>
      </div>
    );
  }

  return <RecipeDetail recipe={recipe} relatedRecipes={relatedRecipes} />;
}

export default function RecipeDetailPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 font-bold text-stone-600">レシピを読み込み中です。</div>}>
      <RecipeDetailContent />
    </Suspense>
  );
}
