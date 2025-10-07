import { create } from 'zustand'

interface FeedState {
  isConnected: boolean
  feedData: Record<string, any>
  setConnected: (v: boolean) => void
  updateFeed: (payload: Record<string, any>) => void
  reset: () => void
}

export const useFeedStore = create<FeedState>((set) => ({
  isConnected: false,
  feedData: {},
  setConnected: (v) => set({ isConnected: v }),
  updateFeed: (p) => set((s) => ({ feedData: { ...s.feedData, ...p } })),
  reset: () => set({ isConnected: false, feedData: {} }),
}))
