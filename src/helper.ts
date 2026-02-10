import type { Hero } from "./types";

const imageModules = import.meta.glob(
  "/src/assets/images/*.{webp,png,jpg,jpeg}",
  {
    eager: true, // Немедленная загрузка
    import: "default",
    query: "?url", // Получаем URL, а не модуль
  }
);

// Создаем карту для быстрого доступа
const imageCache = new Map<string, string>();

// Преобразуем пути
Object.entries(imageModules).forEach(([filePath, imageUrl]) => {
  // Извлекаем имя файла из пути
  const filename = filePath.split("/").pop() || "";
  imageCache.set(filename, imageUrl as string);
});

export const getHeroImage = (filename: string): string => {
  // Убедитесь, что имя файла совпадает с ключом в кэше
  const key = filename.endsWith(".webp") ? filename : `${filename}.webp`;
  return imageCache.get(key) || imageCache.get("default.png") || "";
};

export const getRandomSelection = (
  items: Hero[],
  count: number = 1
): Hero[] => {
  const shuffled = [...items].sort(() => 0.5 - Math.random()).slice(0, count);
  const res: Hero[] = [];

  for (let i = 0; i < shuffled.length; i++) {
    const item = shuffled[i];
    const avatar = item.avatar;
    res.push({ ...item, avatar });
  }

  return res;
};

export const getRandomHero = (items: Hero[]) => {
  const selection = getRandomSelection(items);
  return selection[0];
};
