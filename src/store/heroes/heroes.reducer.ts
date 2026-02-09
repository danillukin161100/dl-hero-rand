import type { Hero } from "../../types";
import { createSelector, createSlice } from "@reduxjs/toolkit";
import {
  addExcludedIds,
  addRandomHeroes,
  clearExcludedIds,
  clearRandomHeroes,
  loadHeroes,
  removeExcludedIds,
  removeRandomHeroes,
  setPlayers,
  setRandomHeroes,
  updateRandomHero,
} from "./heroes.action";

interface HeroesState {
  heroes: Hero[];
  randomHeroes: Hero[];
  excludedIds: Array<Hero["id"]>;
  players: string[];
  isLoading: boolean;
}

const initialState: HeroesState = {
  heroes: [],
  randomHeroes: [],
  excludedIds: [],
  players: [],
  isLoading: false,
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
        const index = state.randomHeroes.findIndex((t) => t.id === heroId);
        state.randomHeroes[index] = newHero;
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
      })

      .addCase(setPlayers, (state, { payload }) => {
        state.players = payload;
      });
  },
});

export const { getAvailableHeroes, getExcludedHeroes } = heroesSlice.selectors;
