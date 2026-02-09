import type { ErrorMessage, Hero } from "../../types";
import { createSelector, createSlice } from "@reduxjs/toolkit";
import {
  addExcludedIds,
  addRandomHeroes,
  clearExcludedIds,
  clearRandomHeroes,
  loadHeroes,
  removeExcludedIds,
  removeRandomHeroes,
  setRandomHeroes,
  updateRandomHero,
} from "./heroes.action";

interface HeroesState {
  heroes: Hero[];
  randomHeroes: Hero[];
  excludedIds: Array<Hero["id"]>;
  isLoading: boolean;
  errors: ErrorMessage[];
}

const initialState: HeroesState = {
  heroes: [],
  randomHeroes: [],
  excludedIds: [],
  isLoading: false,
  errors: [],
};

export const heroesSlice = createSlice({
  name: "heroes",
  initialState,
  selectors: {
    getAvailableHeroes: createSelector(
      [
        (state: HeroesState) => state.heroes,
        (state: HeroesState) => state.excludedIds,
      ],
      (heroes, excludedIds): Hero[] => {
        return heroes.filter((t) => !excludedIds.includes(t.id));
      },
    ),
    getExcludedHeroes: createSelector(
      [
        (state: HeroesState) => state.heroes,
        (state: HeroesState) => state.excludedIds,
      ],
      (heroes, excludedIds): Hero[] =>
        heroes.filter((t) => excludedIds.includes(t.id)),
    ),
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadHeroes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadHeroes.fulfilled, (state, { payload }) => {
        state.heroes = payload;
        state.isLoading = false;
      })
      .addCase(loadHeroes.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(setRandomHeroes, (state, { payload }) => {
        state.randomHeroes = payload;
      })
      .addCase(clearRandomHeroes, (state) => {
        state.randomHeroes = initialState.randomHeroes;
      })
      .addCase(addRandomHeroes, (state, { payload }) => {
        state.randomHeroes = [...state.randomHeroes, ...payload];
      })
      .addCase(removeRandomHeroes, (state, { payload }) => {
        state.randomHeroes = state.randomHeroes.filter(
          (t) => !payload.some((r) => r.id === t.id),
        );
      })
      .addCase(updateRandomHero, (state, { payload }) => {
        const { heroId, newHero } = payload;
        const updatedHeroes = [...state.randomHeroes];
        const index = state.randomHeroes.findIndex((t) => t.id === heroId);

        if (!index) return;

        updatedHeroes[index] = newHero;
        state.randomHeroes = updatedHeroes;
      })

      .addCase(addExcludedIds, (state, { payload }) => {
        const newExcludedIds = payload.filter(
          (t) => !state.excludedIds.includes(t),
        );

        if (!newExcludedIds.length) return;

        state.excludedIds = [...state.excludedIds, ...newExcludedIds];
      })
      .addCase(removeExcludedIds, (state, { payload }) => {
        state.excludedIds = state.excludedIds.filter(
          (t) => !payload.includes(t),
        );
      })
      .addCase(clearExcludedIds, (state) => {
        state.excludedIds = initialState.excludedIds;
      });
  },
});

export const { getAvailableHeroes, getExcludedHeroes } = heroesSlice.selectors;
