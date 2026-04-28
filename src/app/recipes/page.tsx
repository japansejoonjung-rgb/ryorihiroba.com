"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import RecipeCard from "@/components/RecipeCard";
import CategoryList from "@/components/CategoryList";
import { recipes } from "@/data/recipes";
import { Search } from "lucide-react";

function RecipesContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") ?? "";
  const category = searchParams.get("category") ?? "";
  const [query, setQuery] = useState(initialQuery);

  const filteredRecipes = useMemo(() => recipes.filter((recipe) => {
    const keyword = query.toLowerCase();
    const matchesQuery = recipe.title.toLowerCase().includes(keyword) || recipe.description.toLowerCase().includes(keyword) || recipe.tags.some((tag) => tag.toLowerCase().includes(keyword)) || recipe.ingredients.some((item) => item.name.toLowerCase().includes(keyword));
    const matchesCategory = category ? recipe.category === category : true;
    return matchesQuery && matchesCategory;
  }), [query, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm"><p className="font-bold text-orange-500">レシピ検索</p><h1 className="mt-2 text-3xl font-black">レシピ一覧</h1><div className="mt-6 flex items-center rounded-full border border-orange-100 bg-orange-50 px-4 py-3"><Search size={20} className="text-orange-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="料理名・食材で検索" className="ml-3 w-full bg-transparent outline-none" /></div><div className="mt-6"><CategoryList selectedCategory={category} /></div></div>
      <div className="mt-8 flex items-center justify-between"><p className="font-bold">{filteredRecipes.length}件のレシピ{category && <span className="text-orange-500"> / {category}</span>}</p></div>
      {filteredRecipes.length > 0 ? <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filteredRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div> : <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm"><p className="text-lg font-bold">該当するレシピが見つかりませんでした。</p><p className="mt-2 text-stone-500">別のキーワードで検索してください。</p></div>}
    </div>
  );
}

export default function RecipesPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10">読み込み中...</div>}>
      <RecipesContent />
    </Suspense>
  );
}
