export interface ChartDataPoint {
  time: string;
  processor: number;
  memory: number;
  storage: number;
  gpu?: number;
  processorTemp: number;
  gpuTemp?: number;
}
