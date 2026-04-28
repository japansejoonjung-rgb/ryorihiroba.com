import { notFound } from "next/navigation";
import RecipeDetail from "@/components/RecipeDetail";
import { recipes } from "@/data/recipes";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return recipes.map((recipe) => ({ id: recipe.id }));
}

export default async function RecipeDetailPage({ params }: Props) {
  const { id } = await params;
  const recipe = recipes.find((item) => item.id === id);
  if (!recipe) notFound();

  const relatedRecipes = recipes.filter((item) => item.id !== recipe.id && item.category === recipe.category).slice(0, 3);
  const fallbackRelated = recipes.filter((item) => item.id !== recipe.id).slice(0, 3);

  return <RecipeDetail recipe={recipe} relatedRecipes={relatedRecipes.length > 0 ? relatedRecipes : fallbackRelated} />;
}
