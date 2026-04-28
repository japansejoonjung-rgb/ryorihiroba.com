export type Difficulty = "簡単" | "普通" | "本格";

export type Recipe = {
  id: string;
  title: string;
  description: string;
  image: string;
  time: number;
  servings: number;
  difficulty: Difficulty;
  likes: number;
  views: number;
  saves: number;
  authorId?: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  category: string;
  tags: string[];
  ingredients: {
    name: string;
    amount: string;
  }[];
  steps: string[];
  tips: string;
  createdAt: string;
};
