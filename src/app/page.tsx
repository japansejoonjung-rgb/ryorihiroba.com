"use client";

import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";
import CategoryList from "@/components/CategoryList";
import RankingList from "@/components/RankingList";
import { popularKeywords, recipes as fallbackRecipes } from "@/data/recipes";
import { useCommunityRecipes } from "@/hooks/useCommunityRecipes";
import { useLanguage } from "@/context/LanguageContext";
import { BookOpen, ChevronRight, Search, Sparkles, Utensils } from "lucide-react";

const guideLinks = [
  { key: "guideOne", query: "下ごしらえ" },
  { key: "guideTwo", query: "作り置き" },
  { key: "guideThree", query: "人気" },
];

const themeCards = [
  {
    titleKey: "themeBento",
    descKey: "themeBentoDesc",
    category: "お弁当",
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
  },
  {
    titleKey: "themeSolo",
    descKey: "themeSoloDesc",
    category: "一人暮らし",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80",
  },
  {
    titleKey: "themeHealthy",
    descKey: "themeHealthyDesc",
    category: "ダイエット",
    image: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80",
  },
  {
    titleKey: "themeSweets",
    descKey: "themeSweetsDesc",
    category: "スイーツ",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
  },
];

export default function HomePage() {
  const { t, categoryName } = useLanguage();
  const { recipes, loading } = useCommunityRecipes();
  const recipePool = recipes.length > 0 ? recipes : fallbackRecipes;
  const recommended = recipePool.slice(0, 6);
  const popular = [...recipePool].sort((a, b) => b.views - a.views).slice(0, 5);
  const latest = [...recipePool].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const creators = recipePool.slice(0, 4).map((recipe) => recipe.author);
  const heroRecipe = recipePool[0] ?? fallbackRecipes[0];

  return (
    <div>
      <section className="bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_50%,#ffe4e6_100%)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:py-16">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-500 shadow-sm">
              <Sparkles size={17} />
              {t.heroKicker}
            </div>
            <h1 className="text-4xl font-black leading-tight text-stone-900 md:text-6xl">{t.heroTitle}</h1>
            <p className="mt-5 max-w-xl leading-8 text-stone-600">{t.heroDescription}</p>
            <form action="/recipes" className="mt-8 flex max-w-xl rounded-full bg-white p-2 shadow-md">
              <div className="flex flex-1 items-center px-4">
                <Search size={20} className="text-orange-400" />
                <input name="query" placeholder={t.searchPlaceholder} className="ml-3 w-full bg-transparent outline-none" />
              </div>
              <button className="rounded-full bg-orange-500 px-5 py-3 font-bold text-white hover:bg-orange-600 sm:px-6">{t.search}</button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              {popularKeywords.map((keyword) => (
                <Link key={keyword} href={`/recipes?query=${encodeURIComponent(keyword)}`} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-stone-600 shadow-sm hover:text-orange-500">
                  {keyword}
                </Link>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl bg-white p-3 shadow-xl">
              <img src={heroRecipe.image} alt={heroRecipe.title} className="h-[280px] w-full rounded-2xl object-cover sm:h-[360px]" />
            </div>
            <div className="absolute -bottom-5 left-5 max-w-[80%] rounded-3xl bg-white p-5 shadow-lg">
              <p className="text-sm font-bold text-orange-500">{t.todayPick}</p>
              <p className="mt-1 truncate text-xl font-black">{heroRecipe.title}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-bold text-orange-500">{t.themedSearch}</p>
            <h2 className="text-3xl font-black">{t.themeTitle}</h2>
          </div>
          <Link href="/categories" className="hidden items-center gap-1 text-sm font-bold text-orange-500 sm:inline-flex">
            {t.categories}
            <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {themeCards.map((theme) => (
            <Link key={theme.category} href={`/recipes?category=${encodeURIComponent(theme.category)}`} className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <div className="h-32 overflow-hidden">
                <img src={theme.image} alt={t[theme.titleKey]} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-orange-500">{categoryName(theme.category)}</p>
                <h3 className="mt-1 text-lg font-black">{t[theme.titleKey]}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-500">{t[theme.descKey]}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-bold text-orange-500">{t.recommended}</p>
            <h2 className="text-3xl font-black">{t.recommendedRecipes}</h2>
          </div>
          <Link href="/recipes" className="text-sm font-bold text-orange-500">{t.more}</Link>
        </div>
        {loading && <p className="mb-5 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-600">{t.loadedRecipes}</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{recommended.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div>
      </section>

      <section className="bg-white/70 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="mb-6">
              <p className="font-bold text-orange-500">{t.popular}</p>
              <h2 className="text-3xl font-black">{t.todayPopularRecipes}</h2>
            </div>
            <RankingList title={t.todayAccessRanking} recipes={popular} type="views" />
          </div>
          <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-orange-500">
              <BookOpen size={20} />
              <p className="font-bold">{t.guide}</p>
            </div>
            <h2 className="mt-2 text-2xl font-black">{t.guideTitle}</h2>
            <div className="mt-5 grid gap-3">
              {guideLinks.map((item) => (
                <Link key={item.key} href={`/recipes?query=${encodeURIComponent(item.query)}`} className="flex items-center justify-between rounded-2xl bg-orange-50 px-4 py-4 font-bold text-stone-700 hover:text-orange-500">
                  {t[item.key]}
                  <ChevronRight size={18} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6">
          <p className="font-bold text-orange-500">{t.categories}</p>
          <h2 className="text-3xl font-black">{t.categorySearchTitle}</h2>
        </div>
        <CategoryList />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="font-bold text-orange-500">{t.latest}</p>
            <h2 className="text-3xl font-black">{t.latestRecipes}</h2>
          </div>
          <Link href="/recipes" className="text-sm font-bold text-orange-500">{t.more}</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{latest.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6">
          <p className="font-bold text-orange-500">{t.creator}</p>
          <h2 className="text-3xl font-black">{t.popularCreators}</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {creators.map((creator) => (
            <div key={creator.name} className="rounded-3xl border border-orange-100 bg-white p-6 text-center shadow-sm">
              <img src={creator.avatar} alt={creator.name} className="mx-auto h-20 w-20 rounded-full" />
              <h3 className="mt-4 font-black">{creator.name}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-500">{creator.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-3xl bg-orange-500 p-8 text-white md:p-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 font-bold">
            <Utensils size={18} />
            {t.easyFeature}
          </div>
          <h2 className="mt-4 text-3xl font-black md:text-4xl">{t.quickFeatureTitle}</h2>
          <p className="mt-4 max-w-2xl leading-8 text-white/90">{t.quickFeatureDescription}</p>
          <Link href="/recipes?category=%E6%99%82%E7%9F%AD%E6%96%99%E7%90%86" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-bold text-orange-500">
            {t.quickFeatureButton}
          </Link>
        </div>
      </section>
    </div>
  );
}
