import { create } from 'zustand';

type DialogType = 'DETAILS' | 'CHART' | null;

interface DeviceDialogStore {
  activeDialog: DialogType;
  activeDeviceId: string | null;
  activeDeviceSku: string | null;
  activeDeviceName: string | null;
  openDialog: (type: DialogType, deviceId: string, sku?: string, deviceName?: string) => void;
  closeDialog: () => void;
}

export const useDeviceDialogStore = create<DeviceDialogStore>((set) => ({
  activeDialog: null,
  activeDeviceId: null,
  activeDeviceSku: null,
  activeDeviceName: null,
  openDialog: (type, deviceId, sku, deviceName) => set({ activeDialog: type, activeDeviceId: deviceId, activeDeviceSku: sku || null, activeDeviceName: deviceName || null }),
  closeDialog: () => set({ activeDialog: null, activeDeviceId: null, activeDeviceSku: null, activeDeviceName: null }),
}));
