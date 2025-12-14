import type { Hero } from "./types";

export const getHeroImage = async (filename: string): Promise<string> => {
  try {
    // Динамический импорт для Vite
    const module = await import(`./assets/images/${filename}`);
    return module.default;
  } catch (error) {
    console.error(`Error loading image: ${filename}`, error);
    const defaultModule = await import("./assets/images/default.png");
    return defaultModule.default;
  }
};

export const getRandomSelection = async (
  items: Hero[],
  count: number = 1
): Promise<Hero[]> => {
  const shuffled = [...items].sort(() => 0.5 - Math.random()).slice(0, count);
  const res: Hero[] = [];

  for (let i = 0; i < shuffled.length; i++) {
    const item = shuffled[i];
    const avatar = await getHeroImage(item.avatar);
    res.push({ ...item, avatar });
  }

  return res;
};

export const getRandomHero = async (items: Hero[]) => {
  const selection = await getRandomSelection(items);
  return selection[0];
};
