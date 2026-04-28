"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-20 border-t border-orange-100 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <Link href="/" className="text-2xl font-black text-orange-500">{t.brand}</Link>
          <p className="mt-3 text-sm leading-6 text-stone-500">{t.footerDescription}</p>
        </div>
        <div><h3 className="font-bold">{t.footerFind}</h3><div className="mt-3 grid gap-2 text-sm text-stone-500"><Link href="/recipes">{t.recipeList}</Link><Link href="/categories">{t.categories}</Link><Link href="/ranking">{t.ranking}</Link></div></div>
        <div><h3 className="font-bold">{t.footerJoin}</h3><div className="mt-3 grid gap-2 text-sm text-stone-500"><Link href="/post">{t.post}</Link><Link href="/login">{t.login}</Link><Link href="/login">{t.signup}</Link></div></div>
        <div><h3 className="font-bold">{t.footerConcept}</h3><p className="mt-3 text-sm leading-6 text-stone-500">{t.footerConceptText}</p></div>
      </div>
      <div className="border-t border-orange-100 py-4 text-center text-xs text-stone-400">© 2026 {t.brand}. All rights reserved.</div>
    </footer>
  );
}
