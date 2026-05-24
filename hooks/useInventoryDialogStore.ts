import { create } from 'zustand';

export type InventoryCategory = 'OFFLINE' | 'ACTIVE' | 'MAINTENANCE' | 'PENDING_CONNECTION' | null;

interface InventoryDialogStore {
  activeCategory: InventoryCategory;
  openDialog: (category: InventoryCategory) => void;
  closeDialog: () => void;
}

export const useInventoryDialogStore = create<InventoryDialogStore>((set) => ({
  activeCategory: null,
  openDialog: (category) => set({ activeCategory: category }),
  closeDialog: () => set({ activeCategory: null }),
}));
