import { combineSlices, configureStore } from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  useStore,
  type TypedUseSelectorHook,
} from "react-redux";
import { heroesSlice } from "./heroes/heroes.reducer";
import { globalSlice } from "./global/global.reducer";

const reducer = combineSlices(heroesSlice, globalSlice);

export const store = configureStore({
  reducer,
});

export type AppStore = typeof store;
export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = useStore.withTypes<AppStore>();
