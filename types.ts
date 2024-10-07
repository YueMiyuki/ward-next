export interface ProcessorInfo {
  model: string;
  cores: number;
  speed: string;
  usage: number;
  temperature: number;
}

export interface MemoryInfo {
  total: number;
  available: number;
  usage: number;
  model: string[];
}

export interface GpuInfo {
  model: string;
  usage: number;
  temperature: number;
  vram: number;
  vramUsed: number;
}

export interface StorageInfo {
  total: number;
  free: number;
  usage: number;
}

export interface SystemInfo {
  processor: ProcessorInfo;
  memory: MemoryInfo;
  gpu: GpuInfo | null;
  storage: StorageInfo[];
  uptime: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    hidden?: boolean;
  }[];
}

export interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}
