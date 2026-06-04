import { create } from 'zustand';

type DialogType = 'DETAILS' | 'CHART' | null;

interface DeviceDialogStore {
  activeDialog: DialogType;
  activeDeviceId: string | null;
  activeDeviceSku: string | null;
  openDialog: (type: DialogType, deviceId: string, sku?: string) => void;
  closeDialog: () => void;
}

export const useDeviceDialogStore = create<DeviceDialogStore>((set) => ({
  activeDialog: null,
  activeDeviceId: null,
  activeDeviceSku: null,
  openDialog: (type, deviceId, sku) => set({ activeDialog: type, activeDeviceId: deviceId, activeDeviceSku: sku || null }),
  closeDialog: () => set({ activeDialog: null, activeDeviceId: null, activeDeviceSku: null }),
}));
