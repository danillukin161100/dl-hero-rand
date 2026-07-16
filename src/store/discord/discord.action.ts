import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import { DiscordApiService, type DiscordMember } from "../../services/DiscordApi.service";

export const fetchGuildMembers = createAsyncThunk<DiscordMember[]>(
  "discord/fetchGuildMembers",
  async (_, { rejectWithValue }) => {
    const api = new DiscordApiService();
    const result = await api.getGuildMembers();

    if (!result.success || !result.data) {
      return rejectWithValue(result.error ?? "Failed to fetch guild members");
    }

    return result.data;
  },
);

export const setDiscordMembers = createAction<DiscordMember[]>(
  "discord/setDiscordMembers",
);

export const clearDiscordMembers = createAction(
  "discord/clearDiscordMembers",
);