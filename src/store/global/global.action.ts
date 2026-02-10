import { createAction } from "@reduxjs/toolkit";

export const setErrorMessage = createAction<string>("global/addErrorMessage");
export const clearErrorMessage = createAction("global/clearErrorMessage");
