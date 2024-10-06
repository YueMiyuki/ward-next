import { NextResponse } from 'next/server'
import si from 'systeminformation'

export async function GET() {
  try {
    const [cpu, mem, disks, time] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.fsSize(),
      si.time(),
    ])

    const systemInfo = {
      processor: {
        usage: await si.currentLoad().then((data) => Math.round(data.currentLoad)),
        model: `${cpu.manufacturer} ${cpu.brand}`,
        cores: cpu.physicalCores,
        speed: `${cpu.speed} GHz`,  
      },
      memory: {
        usage: Math.round((mem.active / mem.total) * 100),  
        total: Math.round(mem.total / 1024 / 1024 / 1024),  
        free: Math.round(mem.free / 1024 / 1024 / 1024),    
      },
      storage: disks.map((disk) => ({
        usage: Math.round((disk.used / disk.size) * 100),  
        total: Math.round(disk.size / 1024 / 1024 / 1024), 
        free: Math.round(disk.available / 1024 / 1024 / 1024), 
      })),
      uptime: time.uptime,
    }

    return NextResponse.json(systemInfo)
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Failed to fetch system information' }, { status: 500 })
  }
}