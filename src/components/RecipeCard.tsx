"use client";

import Link from "next/link";
import { Eye, Heart, Clock, Bookmark } from "lucide-react";
import { Recipe } from "@/types/recipe";
import { useState } from "react";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <article className="group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <Link href={`/recipes/${recipe.id}`} className="block"><div className="relative h-48 overflow-hidden"><img src={recipe.image} alt={recipe.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" /><div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-orange-500">{recipe.category}</div></div></Link>
      <div className="p-4">
        <Link href={`/recipes/${recipe.id}`}><h3 className="text-lg font-bold text-stone-800 transition hover:text-orange-500">{recipe.title}</h3></Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-500">{recipe.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">{recipe.tags.slice(0, 3).map((tag) => <span key={tag} className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-500">#{tag}</span>)}</div>
        <div className="mt-4 flex items-center justify-between text-xs text-stone-500"><div className="flex items-center gap-1"><Clock size={15} />{recipe.time}分</div><span>{recipe.difficulty}</span><div className="flex items-center gap-1"><Eye size={15} />{recipe.views.toLocaleString()}</div></div>
        <div className="mt-4 flex items-center justify-between border-t border-orange-50 pt-4">
          <div className="flex items-center gap-2"><img src={recipe.author.avatar} alt={recipe.author.name} className="h-7 w-7 rounded-full" /><span className="text-xs font-medium text-stone-600">{recipe.author.name}</span></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLiked((prev) => !prev)} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${liked ? "bg-rose-50 text-rose-500" : "bg-stone-50 text-stone-500 hover:bg-rose-50 hover:text-rose-500"}`}><Heart size={15} fill={liked ? "currentColor" : "none"} />{recipe.likes + (liked ? 1 : 0)}</button>
            <button onClick={() => setSaved((prev) => !prev)} className={`rounded-full p-2 ${saved ? "bg-orange-100 text-orange-500" : "bg-stone-50 text-stone-500 hover:bg-orange-50 hover:text-orange-500"}`}><Bookmark size={15} fill={saved ? "currentColor" : "none"} /></button>
          </div>
        </div>
      </div>
    </article>
  );
}
