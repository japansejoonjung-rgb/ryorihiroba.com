"use client";

import Link from "next/link";
import { Recipe } from "@/types/recipe";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  title: string;
  recipes: Recipe[];
  type: "views" | "likes" | "saves";
};

export default function RankingList({ title, recipes, type }: Props) {
  const { t, categoryName } = useLanguage();
  const getValue = (recipe: Recipe) => {
    if (type === "views") return `${recipe.views.toLocaleString()} ${t.views}`;
    if (type === "likes") return `${recipe.likes.toLocaleString()} ${t.likes}`;
    return `${recipe.saves.toLocaleString()} ${t.saves}`;
  };

  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-black text-stone-800">{title}</h2>
      <div className="mt-5 grid gap-4">
        {recipes.map((recipe, index) => (
          <Link key={recipe.id} href={`/recipes/detail?id=${encodeURIComponent(recipe.id)}`} className="flex gap-4 rounded-2xl p-2 transition hover:bg-orange-50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 text-lg font-black text-white">{index + 1}</div>
            <img src={recipe.image} alt={recipe.title} className="h-20 w-24 rounded-2xl object-cover" />
            <div className="min-w-0">
              <h3 className="font-bold text-stone-800">{recipe.title}</h3>
              <p className="mt-1 text-sm text-stone-500">{categoryName(recipe.category)}</p>
              <p className="mt-1 text-sm font-bold text-orange-500">{getValue(recipe)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
