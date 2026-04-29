"use client";

import { useEffect, useMemo, useState } from "react";
import { recipes as sampleRecipes } from "@/data/recipes";
import { getAllRecipes, getDeletedRecipeIds } from "@/lib/firestoreService";
import { Recipe } from "@/types/recipe";

export function useCommunityRecipes() {
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [deletedRecipeIds, setDeletedRecipeIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadRecipes = async () => {
      setLoading(true);
      try {
        const [items, deletedIds] = await Promise.all([getAllRecipes(), getDeletedRecipeIds()]);
        if (!mounted) return;
        setUserRecipes(items);
        setDeletedRecipeIds(deletedIds);
        setError("");
      } catch (recipeError) {
        if (!mounted) return;
        setUserRecipes([]);
        setDeletedRecipeIds(new Set());
        setError(recipeError instanceof Error ? recipeError.message : "레시피를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadRecipes();

    return () => {
      mounted = false;
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
