import { createSlice } from "@reduxjs/toolkit";
import { setErrorMessage, clearErrorMessage } from "./global.action";

interface GlobalState {
  error: string | null;
}

const initialState: GlobalState = {
  error: null,
};

export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(setErrorMessage, (state, { payload }) => {
        state.error = payload;
      })
      .addCase(clearErrorMessage, (state) => {
        state.error = initialState.error;
      });
  },
});
