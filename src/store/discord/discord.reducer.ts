import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { DiscordMember } from "../../services/DiscordApi.service";
import {
  clearDiscordMembers,
  fetchGuildMembers,
  setDiscordMembers,
} from "./discord.action";

interface DiscordState {
  members: DiscordMember[];
  isLoading: boolean;
  error: string | null;
}

const initialState: DiscordState = {
  members: [],
  isLoading: false,
  error: null,
};

export const discordSlice = createSlice({
  name: "discord",
  initialState,
  selectors: {
    getDiscordMembers: createSelector(
      [(state: DiscordState) => state.members],
      (members): DiscordMember[] => members,
    ),
    getDiscordMembersCount: createSelector(
      [(state: DiscordState) => state.members],
      (members): number => members.length,
    ),
    getDiscordMembersWithoutBots: createSelector(
      [(state: DiscordState) => state.members],
      (members): DiscordMember[] =>
        members.filter((m) => !m.user.bot),
    ),
    getDiscordLoading: (state: DiscordState): boolean => state.isLoading,
    getDiscordError: (state: DiscordState): string | null => state.error,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGuildMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGuildMembers.fulfilled, (state, { payload }) => {
        state.members = payload;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchGuildMembers.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = (payload as string) ?? "Unknown error";
      })

      .addCase(setDiscordMembers, (state, { payload }) => {
        state.members = payload;
      })
      .addCase(clearDiscordMembers, (state) => {
        state.members = initialState.members;
        state.error = null;
      });
  },
});

export const {
  getDiscordMembers,
  getDiscordMembersCount,
  getDiscordMembersWithoutBots,
  getDiscordLoading,
  getDiscordError,
} = discordSlice.selectors;