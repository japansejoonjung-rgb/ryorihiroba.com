"use client";

import Link from "next/link";
import { categories } from "@/data/recipes";
import { useLanguage } from "@/context/LanguageContext";

export default function CategoryList({ selectedCategory }: { selectedCategory?: string }) {
  const { categoryName } = useLanguage();

  return <div className="flex flex-wrap gap-3">{categories.map((category) => {
    const active = selectedCategory === category;
    return <Link key={category} href={`/recipes?category=${encodeURIComponent(category)}`} className={`rounded-full px-5 py-2 text-sm font-bold transition ${active ? "bg-orange-500 text-white shadow-sm" : "bg-white text-stone-600 ring-1 ring-orange-100 hover:bg-orange-50 hover:text-orange-500"}`}>{categoryName(category)}</Link>;
  })}</div>;
}
