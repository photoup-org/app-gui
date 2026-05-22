import { create } from 'zustand';

type DialogType = 'DETAILS' | 'CHART' | null;

interface DeviceDialogStore {
  activeDialog: DialogType;
  activeDeviceId: string | null;
  openDialog: (type: DialogType, deviceId: string) => void;
  closeDialog: () => void;
}

export const useDeviceDialogStore = create<DeviceDialogStore>((set) => ({
  activeDialog: null,
  activeDeviceId: null,
  openDialog: (type, deviceId) => set({ activeDialog: type, activeDeviceId: deviceId }),
  closeDialog: () => set({ activeDialog: null, activeDeviceId: null }),
}));
