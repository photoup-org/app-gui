import { create } from 'zustand';

export type ProjectDetailView = 'EXPERIMENTS' | 'ALERTS' | 'DEVICES' | null;

interface ProjectStore {
  isOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  setIsOpen: (isOpen: boolean) => void;
  currentStep: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetWizard: () => void;

  activeDetailView: ProjectDetailView;
  activeProjectId: string | null;
  openDetailView: (view: ProjectDetailView, projectId: string) => void;
  closeDetailView: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  isOpen: false,
  openDialog: () => set({ isOpen: true, currentStep: 0 }),
  closeDialog: () => set({ isOpen: false, currentStep: 0 }),
  setIsOpen: (isOpen) => set((state) => ({ isOpen, currentStep: isOpen ? state.currentStep : 0 })),
  
  currentStep: 0,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 0) })),
  resetWizard: () => set({ currentStep: 0 }),

  activeDetailView: null,
  activeProjectId: null,
  openDetailView: (view, projectId) => set({ activeDetailView: view, activeProjectId: projectId }),
  closeDetailView: () => set({ activeDetailView: null, activeProjectId: null }),
}));
