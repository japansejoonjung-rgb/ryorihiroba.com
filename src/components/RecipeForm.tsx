"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { categories } from "@/data/recipes";
import { addRecipe, getRecipeById, updateRecipe } from "@/lib/firestoreService";
import { Difficulty, Recipe } from "@/types/recipe";

const fallbackImage =
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80";

export default function RecipeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const editId = searchParams.get("edit");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [time, setTime] = useState("20");
  const [servings, setServings] = useState("2");
  const [difficulty, setDifficulty] = useState<Difficulty>("簡単");
  const [category, setCategory] = useState(categories[0]);
  const [tags, setTags] = useState("");
  const [tips, setTips] = useState("");
  const [ingredients, setIngredients] = useState([{ name: "", amount: "" }]);
  const [steps, setSteps] = useState([""]);
  const [createdAt, setCreatedAt] = useState("");
  const [editingLoading, setEditingLoading] = useState(Boolean(editId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!editId) {
      setEditingLoading(false);
      return;
    }

    let mounted = true;
    setEditingLoading(true);
    getRecipeById(editId)
      .then((recipe) => {
        if (!mounted) return;
        if (user && recipe.authorId && recipe.authorId !== user.uid) {
          setError("自分のレシピだけ編集できます。");
          return;
        }

        setTitle(recipe.title);
        setDescription(recipe.description);
        setImage(recipe.image);
        setImagePreview(recipe.image);
        setTime(String(recipe.time));
        setServings(String(recipe.servings));
        setDifficulty(recipe.difficulty);
        setCategory(recipe.category);
        setTags(recipe.tags.join(", "));
        setTips(recipe.tips);
        setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: "", amount: "" }]);
        setSteps(recipe.steps.length > 0 ? recipe.steps : [""]);
        setCreatedAt(recipe.createdAt);
      })
      .catch(() => {
        if (mounted) setError("編集할 레시피를 불러오지 못했습니다.");
      })
      .finally(() => {
        if (mounted) setEditingLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [editId, user]);

  const addIngredient = () => setIngredients([...ingredients, { name: "", amount: "" }]);
  const removeIngredient = (index: number) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };
  const updateIngredient = (index: number, field: "name" | "amount", value: string) => {
    const next = [...ingredients];
    next[index][field] = value;
    setIngredients(next);
  };
  const addStep = () => setSteps([...steps, ""]);
  const removeStep = (index: number) => {
    if (steps.length === 1) return;
    setSteps(steps.filter((_, i) => i !== index));
  };
  const updateStep = (index: number, value: string) => {
    const next = [...steps];
    next[index] = value;
    setSteps(next);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("レシピを投稿するにはログインしてください。");
      return;
    }

    const cleanIngredients = ingredients
      .map((item) => ({ name: item.name.trim(), amount: item.amount.trim() }))
      .filter((item) => item.name && item.amount);
    const cleanSteps = steps.map((step) => step.trim()).filter(Boolean);

    if (cleanIngredients.length === 0 || cleanSteps.length === 0) {
      setError("材料と作り方を1つ以上入力してください。");
      return;
    }

    const displayName = user.displayName || user.email?.split("@")[0] || "料理好きユーザー";
    const authorAvatar =
      user.photoURL || `https://i.pravatar.cc/100?u=${encodeURIComponent(user.uid)}`;

    const recipeData: Omit<Recipe, "id"> = {
      title: title.trim(),
      description: description.trim(),
      image: image.trim() || fallbackImage,
      time: Number(time),
      servings: Number(servings),
      difficulty,
      likes: 0,
      views: 0,
      saves: 0,
      authorId: user.uid,
      author: {
        name: displayName,
        avatar: authorAvatar,
        bio: "レシピ広場の投稿者です。",
      },
      category,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      ingredients: cleanIngredients,
      steps: cleanSteps,
      tips: tips.trim() || "作りやすい分量に調整しながら楽しんでください。",
      createdAt: createdAt || new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      const imageUrl = image.trim() || imagePreview || fallbackImage;

      if (editId) {
        const { likes, views, saves, createdAt: _createdAt, ...editableData } = recipeData;
        await updateRecipe(editId, {
          ...editableData,
          image: imageUrl,
        });
        router.push(`/recipes/detail?id=${editId}`);
      } else {
        const recipeId = await addRecipe(user.uid, {
          ...recipeData,
          image: imageUrl,
        });
        router.push(`/recipes/detail?id=${recipeId}`);
      }
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "レシピを投稿できませんでした。");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || editingLoading) {
    return (
      <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <Loader2 className="mx-auto animate-spin text-orange-500" size={28} />
        <p className="mt-3 font-bold text-stone-600">{editingLoading ? "レシピを読み込んでいます。" : "ログイン状態を確認しています。"}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <h2 className="text-2xl font-black">ログインが必要です</h2>
        <p className="mt-3 leading-7 text-stone-500">レシピを投稿するには、会員登録またはログインしてください。</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600">
          ログインへ
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:gap-8">
      <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
        <h2 className="text-xl font-black">{editId ? "レシピ編集" : "基本情報"}</h2>
        <div className="mt-5 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-bold">タイトル</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="例：ふわとろ親子丼" className="tap-target rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold">代表画像</span>
            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="overflow-hidden rounded-3xl border border-orange-100 bg-orange-50">
                {imagePreview || image ? (
                  <img src={imagePreview || image} alt="preview" className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center text-orange-400">
                    <ImagePlus size={36} />
                  </div>
                )}
              </div>
              <div className="grid gap-3">
                <input value={image} onChange={(e) => { setImage(e.target.value); setImagePreview(e.target.value); }} type="url" placeholder="画像URLを入力" className="tap-target rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" />
                <p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs font-semibold leading-5 text-amber-700">写真ファイルの直接アップロードはFirebase Storage有料設定後に使えます。今は画像URLで登録してください。</p>
              </div>
            </div>
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold">説明</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="レシピの紹介文を入力してください" className="min-h-32 rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" />
          </label>
          <div className="grid gap-4 md:grid-cols-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold">調理時間</span>
              <input value={time} onChange={(e) => setTime(e.target.value)} type="number" min="1" required className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold">人数</span>
              <input value={servings} onChange={(e) => setServings(e.target.value)} type="number" min="1" required className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold">難易度</span>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300">
                <option>簡単</option>
                <option>普通</option>
                <option>本格</option>
              </select>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-bold">カテゴリー</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300">
                {categories.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">材料</h2><button type="button" onClick={addIngredient} className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-500 hover:bg-orange-100"><span className="inline-flex items-center gap-1"><Plus size={16} />材料追加</span></button></div>
        <div className="mt-5 grid gap-3">{ingredients.map((ingredient, index) => <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"><input value={ingredient.name} onChange={(e) => updateIngredient(index, "name", e.target.value)} placeholder="材料名" className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" /><input value={ingredient.amount} onChange={(e) => updateIngredient(index, "amount", e.target.value)} placeholder="分量" className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" /><button type="button" onClick={() => removeIngredient(index)} className="rounded-2xl bg-stone-100 px-4 py-3 text-stone-500 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={18} /></button></div>)}</div>
      </section>

      <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
        <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-black">作り方</h2><button type="button" onClick={addStep} className="rounded-full bg-orange-50 px-4 py-2 text-sm font-bold text-orange-500 hover:bg-orange-100"><span className="inline-flex items-center gap-1"><Plus size={16} />手順追加</span></button></div>
        <div className="mt-5 grid gap-4">{steps.map((step, index) => <div key={index} className="flex gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500 font-black text-white">{index + 1}</div><textarea value={step} onChange={(e) => updateStep(index, e.target.value)} placeholder="調理手順を入力" className="min-h-24 flex-1 rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" /><button type="button" onClick={() => removeStep(index)} className="h-12 rounded-2xl bg-stone-100 px-4 text-stone-500 hover:bg-rose-50 hover:text-rose-500"><Trash2 size={18} /></button></div>)}</div>
      </section>

      <section className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6">
        <h2 className="text-xl font-black">タグ・補足</h2>
        <div className="mt-5 grid gap-5">
          <label className="grid gap-2">
            <span className="text-sm font-bold">タグ</span>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="例：時短, 和食, お弁当" className="rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-bold">コツ・ポイント</span>
            <textarea value={tips} onChange={(e) => setTips(e.target.value)} placeholder="おいしく作るためのコツを書いてください" className="min-h-28 rounded-2xl border border-orange-100 px-4 py-3 outline-none focus:border-orange-300" />
          </label>
        </div>
      </section>

      {error && <div className="flex gap-2 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600"><AlertCircle size={18} className="mt-0.5 shrink-0" /><p>{error}</p></div>}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-8 py-3 font-bold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-stone-300">
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {editId ? "更新する" : "登録する"}
        </button>
      </div>
    </form>
  );
}
