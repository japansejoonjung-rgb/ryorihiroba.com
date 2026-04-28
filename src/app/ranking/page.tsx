import RankingList from "@/components/RankingList";
import RecipeCard from "@/components/RecipeCard";
import { recipes } from "@/data/recipes";

export default function RankingPage() {
  const byViews = [...recipes].sort((a, b) => b.views - a.views).slice(0, 5);
  const byLikes = [...recipes].sort((a, b) => b.likes - a.likes).slice(0, 5);
  const bySaves = [...recipes].sort((a, b) => b.saves - a.saves).slice(0, 5);
  const weekly = [...recipes].sort((a, b) => b.views + b.likes - (a.views + a.likes)).slice(0, 4);
  const newest = [...recipes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8"><p className="font-bold text-orange-500">ランキング</p><h1 className="mt-2 text-3xl font-black">人気レシピランキング</h1><p className="mt-3 text-stone-500">조회수, 좋아요, 저장 수 기준으로 인기 레시피를 확인할 수 있습니다.</p></div>
      <div className="grid gap-6 lg:grid-cols-3"><RankingList title="조회数ランキング" recipes={byViews} type="views" /><RankingList title="いいねランキング" recipes={byLikes} type="likes" /><RankingList title="保存数ランキング" recipes={bySaves} type="saves" /></div>
      <section className="mt-12"><div className="mb-6"><p className="font-bold text-orange-500">Weekly</p><h2 className="text-2xl font-black">今週の人気レシピ</h2></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{weekly.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div></section>
      <section className="mt-12"><div className="mb-6"><p className="font-bold text-orange-500">New</p><h2 className="text-2xl font-black">新着人気レシピ</h2></div><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{newest.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}</div></section>
    </div>
  );
}
