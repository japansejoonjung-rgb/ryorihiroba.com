"use client";

import { useEffect, useMemo, useState } from "react";
import { recipes as sampleRecipes } from "@/data/recipes";
import { subscribeAllRecipes, subscribeDeletedRecipeIds } from "@/lib/firestoreService";
import { Recipe } from "@/types/recipe";

export function useCommunityRecipes() {
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [deletedRecipeIds, setDeletedRecipeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const unsubscribeRecipes = subscribeAllRecipes(
      (items) => {
        if (!mounted) return;
        setUserRecipes(items);
        setError("");
        setLoading(false);
      },
      (recipeError) => {
        if (!mounted) return;
        setUserRecipes([]);
        setError(recipeError.message || "레시피를 불러오지 못했습니다.");
        setLoading(false);
      }
    );

    const unsubscribeDeletedIds = subscribeDeletedRecipeIds(
      (deletedIds) => {
        if (mounted) setDeletedRecipeIds(deletedIds);
      },
      () => {
        // If rules were not published yet, keep recipes usable and only skip the hidden-id overlay.
        if (mounted) setDeletedRecipeIds(new Set());
      }
    );

    return () => {
      mounted = false;
      unsubscribeRecipes();
      unsubscribeDeletedIds();
    };
  }, []);

  const recipes = useMemo(() => {
    const visibleUserRecipes = userRecipes.filter((recipe) => !deletedRecipeIds.has(recipe.id));
    const userRecipeIds = new Set(visibleUserRecipes.map((recipe) => recipe.id));
    return [
      ...visibleUserRecipes,
      ...sampleRecipes.filter((recipe) => !userRecipeIds.has(recipe.id) && !deletedRecipeIds.has(recipe.id)),
    ];
  }, [deletedRecipeIds, userRecipes]);

  return { recipes, userRecipes, deletedRecipeIds, loading, error };
}
