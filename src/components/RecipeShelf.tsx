"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RecipeCard from "@/components/RecipeCard";
import { useLanguage } from "@/context/LanguageContext";
import { Recipe } from "@/types/recipe";

type Props = {
  eyebrow: string;
  title: string;
  recipes: Recipe[];
  moreHref?: string;
  ranked?: boolean;
};

export default function RecipeShelf({ eyebrow, title, recipes, moreHref, ranked = false }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const scroll = (direction: number) => {
    scrollRef.current?.scrollBy({ left: direction * 340, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lime-600">{eyebrow}</p>
            <h2 className="mt-1 text-2xl font-black text-stone-900 sm:text-3xl">{title}</h2>
          </div>
          <div className="flex items-center gap-2">
            {moreHref && (
              <Link href={moreHref} className="hidden rounded-full border border-orange-200 px-4 py-2 text-sm font-bold text-orange-500 hover:bg-orange-50 sm:inline-flex">
                {t.more}
              </Link>
            )}
            <button type="button" onClick={() => scroll(-1)} className="tap-target rounded-full border border-stone-200 bg-white p-2 text-stone-500 shadow-sm hover:text-orange-500" aria-label="previous">
              <ChevronLeft size={22} />
            </button>
            <button type="button" onClick={() => scroll(1)} className="tap-target rounded-full border border-stone-200 bg-white p-2 text-stone-500 shadow-sm hover:text-orange-500" aria-label="next">
              <ChevronRight size={22} />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex snap-x gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {recipes.map((recipe, index) => (
            <div key={recipe.id} className="relative min-w-[260px] snap-start sm:min-w-[300px] lg:min-w-[320px]">
              {ranked && (
                <div className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg border border-stone-200 bg-white text-lg font-black text-stone-800 shadow-sm">
                  {index + 1}
                </div>
              )}
              <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
