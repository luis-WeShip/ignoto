export type Difficulty = "muy_facil" | "facil" | "medio" | "dificil";

export interface ChildProfile {
  name: string;
  age: number;
  likes: string[];
  difficulty: Difficulty;
  streak: number;
  totalCorrect: number;
  totalAttempted: number;
}

export const initialProfile: ChildProfile = {
  name: "",
  age: 6,
  likes: [],
  difficulty: "muy_facil",
  streak: 0,
  totalCorrect: 0,
  totalAttempted: 0,
};
