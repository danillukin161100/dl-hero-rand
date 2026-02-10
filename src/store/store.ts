import { combineSlices, configureStore } from "@reduxjs/toolkit";
import {
  useDispatch,
  useSelector,
  useStore,
  type TypedUseSelectorHook,
} from "react-redux";
import storage from "redux-persist/lib/storage";
import { heroesSlice } from "./heroes/heroes.reducer";
import { globalSlice } from "./global/global.reducer";
import { persistReducer, persistStore } from "redux-persist";

const reducer = combineSlices(heroesSlice, globalSlice);

const persistedReducer = persistReducer(
  {
    key: "root",
    storage,
    whitelist: ["heroes"],
  },
  reducer,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // необходимо для redux-persist
    }),
});

export const persistor = persistStore(store);

export type AppStore = typeof store;
export type RootState = ReturnType<typeof reducer>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore = useStore.withTypes<AppStore>();
