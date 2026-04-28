import RecipeForm from "@/components/RecipeForm";

export default function PostPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8"><p className="font-bold text-orange-500">レシピ投稿</p><h1 className="mt-2 text-3xl font-black">あなたのレシピを投稿する</h1><p className="mt-3 leading-7 text-stone-500">家庭の定番料理、時短レシピ、アレンジ料理などをレシピ広場に投稿しましょう。</p></div>
      <RecipeForm />
    </div>
  );
}
