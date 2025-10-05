import { create } from "zustand";

export const useMarketStore = create((set) => ({
  feed: {},
  updateFeed: (symbol, data) =>
    set((s) => ({ feed: { ...s.feed, [symbol]: data } })),
}));
