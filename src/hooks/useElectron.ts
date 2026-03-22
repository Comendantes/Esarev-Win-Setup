interface GpuInfo {
  name: string;
  driver: string;
  driverDate: string;
}

interface DiskInfo {
  name: string;
  sizeGB: number;
  type: string;
}

export interface HardwareInfo {
  cpu: string;
  cores: string;
  clockGHz: number;
  gpus: GpuInfo[];
  ramGB: number;
  ramSpeed: number;
  ramType: string;
  board: string;
  disks: DiskInfo[];
  os: string;
}

interface ElectronAPI {
  runPowerShell: (command: string) => Promise<{ success: boolean; code?: number; error?: string }>;
  getHardwareInfo: () => Promise<{ success: boolean; data?: HardwareInfo; error?: string }>;
  openExternal: (url: string) => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export const useElectron = () => {
  const api = window.electronAPI;
  const isElectron = Boolean(api?.isElectron);

  const runPowerShell = async (command: string) => {
    if (!api) return { success: false, error: 'Не в Electron' };
    return api.runPowerShell(command);
  };

  const getHardwareInfo = async () => {
    if (!api) return { success: false, error: 'Не в Electron' };
    return api.getHardwareInfo();
  };

  const openExternal = (url: string) => {
    if (api) api.openExternal(url);
    else window.open(url, '_blank');
  };

  return { isElectron, runPowerShell, getHardwareInfo, openExternal, api };
};
