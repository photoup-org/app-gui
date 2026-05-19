import { create } from 'zustand';

interface ProjectStore {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  isOpen: false,
  openDialog: () => set({ isOpen: true }),
  closeDialog: () => set({ isOpen: false }),
  setIsOpen: (isOpen) => set({ isOpen }),
}));
