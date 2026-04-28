import Link from "next/link";
import { categories, recipes } from "@/data/recipes";

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8"><p className="font-bold text-orange-500">カテゴリー</p><h1 className="mt-2 text-3xl font-black">料理ジャンルから探す</h1><p className="mt-3 text-stone-500">和食、時短料理、スイーツ、作り置きなど、目的に合わせてレシピを探せます。</p></div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const count = recipes.filter((recipe) => recipe.category === category).length;
          const sample = recipes.find((recipe) => recipe.category === category);
          return (
            <Link key={category} href={`/recipes?category=${encodeURIComponent(category)}`} className="group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="h-40 overflow-hidden bg-orange-50">{sample ? <img src={sample.image} alt={category} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-4xl">🍽️</div>}</div>
              <div className="p-5"><h2 className="text-xl font-black">{category}</h2><p className="mt-2 text-sm text-stone-500">{count}件のレシピ</p></div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
