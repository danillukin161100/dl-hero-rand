import type { Hero } from "./types";

export const getRandomSelection = (
  items: Hero[],
  count: number = 1
): Hero[] => {
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getRandomHero = (items: Hero[]) => {
  return getRandomSelection(items)[0];
};
