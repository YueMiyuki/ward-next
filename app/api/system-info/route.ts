import { NextResponse } from 'next/server';
import si from 'systeminformation';

export async function GET() {
  try {
    
    const [cpu, mem, disks, time, gpu, temperatures, memLayout] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.fsSize(),
      si.time(),
      si.graphics(),
      si.cpuTemperature(),
      si.memLayout(), 
    ]);
    const gpuController = gpu.controllers?.[0] || null;
    
    const systemInfo = {
      processor: {
        usage: await si.currentLoad().then((data) => Math.round(data.currentLoad)),
        model: `${cpu.manufacturer} ${cpu.brand}`,
        cores: cpu.physicalCores,
        speed: `${cpu.speed} GHz`,
        temperature: Math.round(temperatures.main ?? 0),
      },
      memory: {
        usage: Math.round((mem.active / mem.total) * 100),
        total: Math.round(mem.total / 1024 / 1024 / 1024),
        available: Math.round(mem.available / 1024 / 1024 / 1024),
        model: `${memLayout[0]?.manufacturer} DDR${memLayout[0]?.type}`, 
      },
      storage: disks.map((disk) => ({
        usage: Math.round((disk.used / disk.size) * 100),
        total: Math.round(disk.size / 1024 / 1024 / 1024),
        free: Math.round(disk.available / 1024 / 1024 / 1024),
      })),
      gpu: gpuController ? {
        usage: gpuController.utilizationGpu ? Math.round(gpuController.utilizationGpu) : 0,
        model: gpuController.model ?? 'N/A',
        temperature: gpuController.temperatureGpu ? Math.round(gpuController.temperatureGpu) : 0,
        vram: gpuController.memoryTotal ? Math.round(gpuController.memoryTotal / 1024) : 0,   
        vramUsed: gpuController.memoryUsed ? Math.round(gpuController.memoryUsed / 1024) : 0  
      } : null,
      uptime: time.uptime,
    };

    return NextResponse.json(systemInfo);

  } catch (error) {
    console.error('Failed to fetch system information:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system information' },
      { status: 500 }
    );
  }
}