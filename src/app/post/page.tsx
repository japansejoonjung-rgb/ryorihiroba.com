"use client";

import { Suspense } from "react";
import RecipeForm from "@/components/RecipeForm";
import { useLanguage } from "@/context/LanguageContext";

export default function PostPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <p className="font-bold text-orange-500">{t.post}</p>
        <h1 className="mt-2 text-3xl font-black">{t.postPageTitle}</h1>
        <p className="mt-3 leading-7 text-stone-500">{t.postPageDesc}</p>
      </div>
      <Suspense fallback={<div className="rounded-3xl bg-white p-10 text-center font-bold text-stone-600 shadow-sm">{t.formLoading}</div>}>
        <RecipeForm />
      </Suspense>
    </div>
  );
}
