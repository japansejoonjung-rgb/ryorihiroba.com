"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import CategoryList from "@/components/CategoryList";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { useLanguage } from "@/context/LanguageContext";
import { Search } from "lucide-react";

type SortKey = "new" | "views" | "likes" | "saves";

function RecipesContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") ?? "";
  const category = searchParams.get("category") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [sortKey, setSortKey] = useState<SortKey>("new");
  const { recipes, loading, error } = useCommunityRecipes();
  const { t, categoryName } = useLanguage();

  const filteredRecipes = useMemo(() => {
    const items = recipes.filter((recipe) => {
      const keyword = query.toLowerCase();
      const matchesQuery = recipe.title.toLowerCase().includes(keyword) || recipe.description.toLowerCase().includes(keyword) || recipe.tags.some((tag) => tag.toLowerCase().includes(keyword)) || recipe.ingredients.some((item) => item.name.toLowerCase().includes(keyword));
      const matchesCategory = category ? recipe.category === category : true;
      return matchesQuery && matchesCategory;
    });

    return [...items].sort((a, b) => {
      if (sortKey === "views") return b.views - a.views;
      if (sortKey === "likes") return b.likes - a.likes;
      if (sortKey === "saves") return b.saves - a.saves;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [recipes, query, category, sortKey]);

  const sortTabs: { key: SortKey; label: string }[] = [
    { key: "new", label: t.latest },
    { key: "views", label: t.views },
    { key: "likes", label: t.likes },
    { key: "saves", label: t.saves },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
        <p className="font-bold text-orange-500">{t.recipeSearch}</p>
        <h1 className="mt-2 text-3xl font-black">{t.recipeList}</h1>
        <div className="mt-6 flex items-center rounded-full border border-orange-100 bg-orange-50 px-4 py-3">
          <Search size={20} className="text-orange-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.searchPlaceholder} className="ml-3 w-full bg-transparent outline-none" />
        </div>
        <div className="mt-6"><CategoryList selectedCategory={category} /></div>
      </div>
      {loading && <p className="mt-5 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600">{t.loadedRecipes}</p>}
      {error && <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{t.loadRecipesFailed}</p>}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-bold">{filteredRecipes.length}{t.recipesFoundSuffix}{category && <span className="text-orange-500"> / {categoryName(category)}</span>}</p>
        <div className="flex flex-wrap gap-2">
          {sortTabs.map((tab) => (
            <button key={tab.key} type="button" onClick={() => setSortKey(tab.key)} className={`rounded-full px-4 py-2 text-sm font-bold ${sortKey === tab.key ? "bg-orange-500 text-white" : "bg-white text-stone-600 ring-1 ring-orange-100 hover:bg-orange-50"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {filteredRecipes.length > 0 ? <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filteredRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div> : <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm"><p className="text-lg font-bold">{t.noRecipesTitle}</p><p className="mt-2 text-stone-500">{t.noRecipesText}</p></div>}
    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10">Loading...</div>}>
      <RecipesContent />
    </Suspense>
  );
}
