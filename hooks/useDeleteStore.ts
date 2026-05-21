import { create } from 'zustand';

interface DeleteConfig {
  title: string;
  description: string;
  action: () => Promise<void>;
}

interface DeleteStore {
  isOpen: boolean;
  isDeleting: boolean;
  config: DeleteConfig | null;
  openDelete: (config: DeleteConfig) => void;
  closeDelete: () => void;
  confirmDelete: () => Promise<void>;
}

export const useDeleteStore = create<DeleteStore>((set, get) => ({
  isOpen: false,
  isDeleting: false,
  config: null,
  openDelete: (config) => set({ isOpen: true, config, isDeleting: false }),
  closeDelete: () => set({ isOpen: false, config: null, isDeleting: false }),
  confirmDelete: async () => {
    const { config } = get();
    if (!config) return;
    
    set({ isDeleting: true });
    try {
      await config.action();
    } finally {
      set({ isOpen: false, isDeleting: false, config: null });
    }
  },
}));
