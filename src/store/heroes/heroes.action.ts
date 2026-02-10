import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import data from "../../assets/heroes.json";
import type { Hero } from "../../types";
import { getHeroImage } from "../../helper";

export const loadHeroes = createAsyncThunk<Hero[]>("heroes/loadHeroes", () =>
  data.map((t) => ({ ...t, avatar: getHeroImage(t.avatar) })),
);

export const setRandomHeroes = createAction<Hero[]>("heroes/setRandomHeroes");
export const clearRandomHeroes = createAction("heroes/clearRandomHeroes");
export const addRandomHeroes = createAction<Hero[]>("heroes/addRandomHeroes");
export const removeRandomHeroes = createAction<Hero[]>(
  "heroes/removeRandomHeroes",
);
export const updateRandomHero = createAction<{
  heroId: Hero["id"];
  newHero: Hero;
}>("heroes/updateRandomHero");

export const addExcludedIds = createAction<Array<Hero["id"]>>(
  "heroes/addExcludedIds",
);
export const removeExcludedIds = createAction<Array<Hero["id"]>>(
  "heroes/removeExcludedIds",
);
export const clearExcludedIds = createAction("heroes/clearExcludedIds");

export const setPlayers = createAction<string[]>("heroes/setPlayers");
