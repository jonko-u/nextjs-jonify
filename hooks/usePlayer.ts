import { create } from "zustand";

interface PlayerStore{
    ids: string[];
    activeId?: string;
    isLooping: boolean; // Add the isLooping state here
    setId: (id: string, isLooping: boolean) => void; // Update the setId function signature
    setIds: (ids: string[]) => void;
    toggleLooping: () => void; // Add a function to toggle the isLooping state
    reset: () => void;
};
const usePlayer = create<PlayerStore>((set) => ({
    ids: [],
    activeId: undefined,
    isLooping: false,
    setId: (id: string, isLooping: boolean) => set({ activeId: id, isLooping }), // Update the setId function
    setIds: (ids: string[]) => set({ids}),
    toggleLooping: () => set((state) => ({ isLooping: !state.isLooping })), // Implement the toggleLooping function
    reset: () => set({ ids: [], activeId: undefined, isLooping: false }),
}));
export default usePlayer;