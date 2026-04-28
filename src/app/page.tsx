import Link from "next/link";
import RecipeCard from "@/components/RecipeCard";
import CategoryList from "@/components/CategoryList";
import RankingList from "@/components/RankingList";
import { popularKeywords, recipes } from "@/data/recipes";
import { Search, Sparkles } from "lucide-react";

export default function HomePage() {
  const recommended = recipes.slice(0, 6);
  const popular = [...recipes].sort((a, b) => b.views - a.views).slice(0, 5);
  const creators = recipes.slice(0, 4).map((recipe) => recipe.author);

  return (
    <div>
      <section className="bg-gradient-to-br from-orange-50 via-white to-rose-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-orange-500 shadow-sm"><Sparkles size={17} />毎日のごはんを、もっと楽しく</div>
            <h1 className="text-4xl font-black leading-tight text-stone-900 md:text-6xl">今日なに作る？</h1>
            <p className="mt-5 max-w-xl leading-8 text-stone-600">レシピ広場は、家庭料理・時短料理・お弁当・スイーツまで探せる日本向けレシピコミュニティです。</p>
            <form action="/recipes" className="mt-8 flex max-w-xl rounded-full bg-white p-2 shadow-md">
              <div className="flex flex-1 items-center px-4"><Search size={20} className="text-orange-400" /><input name="query" placeholder="料理名・食材で検索" className="ml-3 w-full bg-transparent outline-none" /></div>
              <button className="rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600">検索</button>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">{popularKeywords.map((keyword) => <Link key={keyword} href={`/recipes?query=${encodeURIComponent(keyword)}`} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-stone-600 shadow-sm hover:text-orange-500">{keyword}</Link>)}</div>
          </div>
          <div className="relative"><div className="overflow-hidden rounded-[2rem] bg-white p-3 shadow-xl"><img src={recipes[0].image} alt={recipes[0].title} className="h-[360px] w-full rounded-[1.5rem] object-cover" /></div><div className="absolute -bottom-5 left-5 rounded-3xl bg-white p-5 shadow-lg"><p className="text-sm font-bold text-orange-500">今日のおすすめ</p><p className="mt-1 text-xl font-black">{recipes[0].title}</p></div></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="font-bold text-orange-500">おすすめ</p><h2 className="text-3xl font-black">おすすめレシピ</h2></div><Link href="/recipes" className="text-sm font-bold text-orange-500">もっと見る</Link></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{recommended.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div></section>
      <section className="bg-white/70 py-14"><div className="mx-auto max-w-7xl px-4"><div className="mb-6"><p className="font-bold text-orange-500">人気</p><h2 className="text-3xl font-black">今日の人気レシピ</h2></div><RankingList title="今日のアクセスランキング" recipes={popular} type="views" /></div></section>
      <section className="mx-auto max-w-7xl px-4 py-14"><div className="mb-6"><p className="font-bold text-orange-500">カテゴリー</p><h2 className="text-3xl font-black">料理ジャンルから探す</h2></div><CategoryList /></section>
      <section className="mx-auto max-w-7xl px-4 py-14"><div className="mb-6"><p className="font-bold text-orange-500">クリエイター</p><h2 className="text-3xl font-black">人気の投稿者</h2></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{creators.map((creator) => <div key={creator.name} className="rounded-3xl border border-orange-100 bg-white p-6 text-center shadow-sm"><img src={creator.avatar} alt={creator.name} className="mx-auto h-20 w-20 rounded-full" /><h3 className="mt-4 font-black">{creator.name}</h3><p className="mt-2 text-sm leading-6 text-stone-500">{creator.bio}</p></div>)}</div></section>
      <section className="mx-auto max-w-7xl px-4 py-14"><div className="rounded-[2rem] bg-gradient-to-r from-orange-500 to-rose-400 p-8 text-white md:p-12"><p className="font-bold">簡単料理特集</p><h2 className="mt-2 text-3xl font-black md:text-4xl">10〜20分で作れる、忙しい日のごはん</h2><p className="mt-4 max-w-2xl leading-8 text-white/90">一人暮らし、仕事帰り、朝ごはんにも使いやすい時短レシピをまとめました。</p><Link href="/recipes?category=時短料理" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-bold text-orange-500">時短レシピを見る</Link></div></section>
    </div>
  );
}
