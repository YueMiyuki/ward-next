export interface ProcessorInfo {
  model: string;
  usage: number;
  cores: number;
  speed: string;
  temperature: number;
}

export interface MemoryInfo {
  model: string[];
  usage: number;
  total: number;
  available: number;
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
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    hidden?: boolean;
  }>;
}

export interface ThemeToggleProps {
  isDark: boolean;
  toggleTheme: () => void;
}
