import { NextResponse } from "next/server";
import si from "systeminformation";
import os from "os";

export async function GET() {
  try {
    const [
      cpu,
      mem,
      disks,
      time,
      gpu,
      temperatures,
      memLayout,
      currentLoad,
      processes,
      networkStats,
    ] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.fsSize(),
      si.time(),
      si.graphics(),
      si.cpuTemperature(),
      si.memLayout(),
      si.currentLoad(),
      si.processes(),
      si.networkStats(),
    ]);

    const gpuController = gpu.controllers?.[0] || null;

    const relevantMemory = memLayout.filter((slot) => slot.size > 0);

    // Aggregate network stats across all interfaces
    const totalBytesReceived = Array.isArray(networkStats)
      ? networkStats.reduce((sum, n) => sum + (n.rx_bytes || 0), 0)
      : 0;
    const totalBytesSent = Array.isArray(networkStats)
      ? networkStats.reduce((sum, n) => sum + (n.tx_bytes || 0), 0)
      : 0;

    const [load1, load5, load15] = os.loadavg();

    const systemInfo = {
      processor: {
        usage: Math.round(currentLoad.currentLoad),
        model: `${cpu.manufacturer} ${cpu.brand}`,
        cores: cpu.physicalCores,
        speed: `${cpu.speed} GHz`,
        temperature: Math.round(temperatures.main ?? 0),
      },
      memory: {
        usage: Math.round((mem.active / mem.total) * 100),
        total: Math.round(mem.total / 1024 / 1024 / 1024),
        available: Math.round(mem.available / 1024 / 1024 / 1024),
        model: relevantMemory.map(
          (slot) => `${slot.manufacturer || "Unknown"} ${slot.type}`,
        ),
      },
      storage: disks.map((disk) => ({
        usage: Math.round((disk.used / disk.size) * 100),
        total: Math.round(disk.size / 1024 / 1024 / 1024),
        free: Math.round(disk.available / 1024 / 1024 / 1024),
      })),
      gpu: gpuController
        ? {
            usage: gpuController.utilizationGpu
              ? Math.round(gpuController.utilizationGpu)
              : 0,
            model: gpuController.model ?? "N/A",
            temperature: gpuController.temperatureGpu
              ? Math.round(gpuController.temperatureGpu)
              : 0,
            vram: gpuController.memoryTotal
              ? Math.round(gpuController.memoryTotal / 1024)
              : 0,
            vramUsed: gpuController.memoryUsed
              ? Math.round(gpuController.memoryUsed / 1024)
              : 0,
          }
        : null,
      uptime: time.uptime,
      systemStats: {
        bootTime: new Date(
          Date.now() - (time.uptime || 0) * 1000,
        ).toISOString(),
        processes: processes?.all ?? 0,
        loadAverage: [load1, load5, load15].map((v) => v.toFixed(2)),
        networkStats: {
          bytesReceived: totalBytesReceived,
          bytesSent: totalBytesSent,
        },
      },
    };

    return NextResponse.json(systemInfo);
  } catch (error) {
    console.error("Failed to fetch system information:", error);
    return NextResponse.json(
      { error: "Failed to fetch system information" },
      { status: 500 },
    );
  }
}
