"use client";

import { useEffect, useMemo, useState } from "react";
import { recipes as sampleRecipes } from "@/data/recipes";
import { getAllRecipes } from "@/lib/firestoreService";
import { Recipe } from "@/types/recipe";

export function useCommunityRecipes() {
  const [userRecipes, setUserRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    getAllRecipes()
      .then((items) => {
        if (mounted) {
          setUserRecipes(items);
          setError("");
        }
      })
      .catch((recipeError) => {
        if (mounted) {
          setUserRecipes([]);
          setError(recipeError instanceof Error ? recipeError.message : "레시피를 불러오지 못했습니다.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const recipes = useMemo(() => {
    const userRecipeIds = new Set(userRecipes.map((recipe) => recipe.id));
    return [...userRecipes, ...sampleRecipes.filter((recipe) => !userRecipeIds.has(recipe.id))];
  }, [userRecipes]);

  return { recipes, userRecipes, loading, error };
}
