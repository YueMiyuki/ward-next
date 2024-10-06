export interface SystemInfo {
    processor: {
      usage: number
      model: string
      cores: number
      speed: number
    }
    memory: {
      usage: number
      total: number
      type: string
      processes: number
    }
    storage: {
      usage: number
      total: number
      disks: number
      swap: number
    }
    uptime: number
  }