"use client";

import Link from "next/link";
import { categories } from "@/data/recipes";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";

export default function CategoriesPage() {
  const { recipes, loading, error } = useCommunityRecipes();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <p className="font-bold text-orange-500">カテゴリー</p>
        <h1 className="mt-2 text-3xl font-black">料理ジャンルから探す</h1>
        <p className="mt-3 text-stone-500">和食、時短料理、スイーツ、作り置きなど、目的に合わせてレシピを探せます。</p>
      </div>

      {loading && <p className="mb-5 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600">投稿レシピを読み込み中です。</p>}
      {error && <p className="mb-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">投稿レシピを読み込めませんでした。</p>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const categoryRecipes = recipes.filter((recipe) => recipe.category === category);
          const sample = categoryRecipes[0];

          return (
            <Link key={category} href={`/recipes?category=${encodeURIComponent(category)}`} className="group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="h-40 overflow-hidden bg-orange-50">{sample ? <img src={sample.image} alt={category} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-4xl">🍽️</div>}</div>
              <div className="p-5"><h2 className="text-xl font-black">{category}</h2><p className="mt-2 text-sm text-stone-500">{categoryRecipes.length}件のレシピ</p></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
