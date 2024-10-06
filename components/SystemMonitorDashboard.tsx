'use client';

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Define the type for system stats (processor, memory, storage)
interface SystemInfo {
  processor: { usage: number; model: string; cores: number; speed: string };
  memory: { usage: number; free: number; total: number };
  storage: { usage: number; total: number; free: number }[];
  uptime: number;
}

// Define the details for each system resource (Processor, Memory, Storage parts)
interface SystemInfoDetails {
  usage: number;
  total?: number;
  model?: string;
  cores?: number;
  speed?: string;
  free?: number;
}

// Type for utilization chart data
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    hidden?: boolean;
  }[];
}

// InfoCard now expects a more explicit type instead of `any`
const InfoCard = ({ title, info, color }: { title: string; info: SystemInfoDetails; color: string }) => {
  const freePercentage = info.total ? Math.round((info.free! / info.total) * 100) : 0;
  const usage = info.usage.toString().padStart(3, '0');

  const renderUsageWithDimming = (usage: string) => {
    const chars = usage.split('');
    let leadingZero = true;
    return chars.map((char, index) => {
      if (leadingZero && char === '0') {
        return (
          <span key={index} className="text-gray-500">
            {char}
          </span>
        );
      } else {
        leadingZero = false;
        return <span key={index}>{char}</span>;
      }
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 w-full h-full">
      <h2 className="text-lg font-semibold mb-2" style={{ color }}>{title}</h2>
      <p className="text-xs mb-2 opacity-70 text-gray-300">{info.model || `${info.total} GB Total`}</p>

      <div className="text-4xl font-bold mb-1" style={{ color }}>
        {renderUsageWithDimming(usage)}%
      </div>

      <p className="text-xs mb-3 opacity-70 text-gray-300">{title.toLowerCase()} usage</p>

      <div className="grid grid-cols-2 gap-2 text-center text-gray-300">
        {title === 'Processor' ? (
          <>
            <div>
              <p className="text-sm font-semibold">{info.cores}</p>
              <p className="text-xs opacity-70">Cores</p>
            </div>
            <div>
              <p className="text-sm font-semibold">{info.speed}</p>
              <p className="text-xs opacity-70">CPU Speed</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold">{freePercentage}%</p>
              <p className="text-xs opacity-70">Free</p>
            </div>
            <div>
              <p className="text-sm font-semibold">{info.total} GB</p>
              <p className="text-xs opacity-70">Total</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StorageCardWithTabs = ({ storageData }: { storageData: SystemInfo['storage'] }) => {
  const [activeTab, setActiveTab] = useState(0);
  const changeTab = (direction: number) => {
    setActiveTab((prev) => (prev + direction + storageData.length) % storageData.length);
  };

  const storage = storageData[activeTab];
  const freePercentage = storage.total ? Math.round((storage.free / storage.total) * 100) : 0;
  const usage = storage.usage.toString().padStart(3, '0');

  const renderUsageWithDimming = (usage: string) => {
    const chars = usage.split('');
    let leadingZero = true;
    return chars.map((char, index) => {
      if (leadingZero && char === '0') {
        return (
          <span key={index} className="text-gray-500">
            {char}
          </span>
        );
      } else {
        leadingZero = false;
        return <span key={index}>{char}</span>;
      }
    });
  };
  
  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 w-full h-full relative">
      <h2 className="text-lg font-semibold mb-2 text-green-400">Storage</h2>

      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <button
          onClick={() => changeTab(-1)}
          className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <button
          onClick={() => changeTab(1)}
          className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="text-center text-gray-300">
        <p className="text-xs mb-2 opacity-70">{storage.total} GB Total</p>
        <div className="text-4xl font-bold mb-1 text-green-400">
          {renderUsageWithDimming(usage)}%
        </div>
        <p className="text-xs mb-3 opacity-70">storage usage</p>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <p className="text-sm font-semibold">{freePercentage}%</p>
            <p className="text-xs opacity-70">Free</p>
          </div>
          <div>
            <p className="text-sm font-semibold">{storage.total} GB</p>
            <p className="text-xs opacity-70">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// % Utilization chart component (fully typed)
const UtilizationChart = ({ utilizationData }: { utilizationData: ChartData }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 h-full min-h-[300px] flex flex-col justify-center items-center">
      <h2 className="text-lg font-semibold mb-4 text-white">% Utilization</h2>
      <div style={{ height: '120px', width: '100%' }}>
        <Line
          data={utilizationData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  stepSize: 10, // Fixed step of 10
                  maxTicksLimit: 11, // Make sure we have up to 11 ticks (0, 10, ..., 100)
                },
              },
              x: { display: false },
            },
            plugins: {
              legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'line' } },
            },
          }}
        />
      </div>
    </div>
  );
};

const WARD = ({ uptime }: { uptime: { days: number; hours: number; minutes: number; seconds: number } }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 w-full h-full min-h-[300px] flex flex-col justify-center items-center text-center">
      {/* Apply gradient color to W.A.R.D title */}
      <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
        W.A.R.D
      </h2>

      <div className="grid grid-cols-4 gap-4 w-full justify-center items-center mb-4">
        {Object.entries(uptime).map(([label, value], index) => (
          <div key={index} className="bg-gray-800 p-5 rounded text-center shadow-md flex flex-col justify-center items-center">
            <div className="text-3xl font-bold text-white">{String(value).padStart(2, '0')}</div>
            <div className="text-xs opacity-70 text-gray-300">{label.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function SystemMonitorDashboard() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [utilizationData, setUtilizationData] = useState<ChartData>({
    labels: Array(20).fill(''),
    datasets: [
      { label: 'Processor', data: [], borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.5)', hidden: false },
      { label: 'Memory', data: [], borderColor: 'rgb(239, 68, 68)', backgroundColor: 'rgba(239, 68, 68, 0.5)', hidden: false },
      { label: 'Storage', data: [], borderColor: 'rgb(16, 185, 129)', backgroundColor: 'rgba(16, 185, 129, 0.5)', hidden: true }, // Hidden by default
    ],
  });

  useEffect(() => {
    const updateSystemInfo = async () => {
      const response = await fetch('/api/system-info');
      const info: SystemInfo = await response.json();
      setSystemInfo(info);

      // Update chart data for processor, memory, and storage
      setUtilizationData((prev) => ({
        labels: [...prev.labels.slice(-19), ''],
        datasets: prev.datasets.map((dataset, index) => ({
          ...dataset,
          data: [
            ...dataset.data.slice(-19),
            index === 0 ? info.processor.usage :
            index === 1 ? info.memory.usage :
            info.storage[0]?.usage ?? 0,
          ],
        })),
      }));
    };

    updateSystemInfo();
    
    // Set an update interval every 1 second
    const interval = setInterval(updateSystemInfo, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return { days, hours, minutes, seconds: remainingSeconds };
  };

  if (!systemInfo) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl text-gray-300">Loading...</div>
      </div>
    );
  }

  const uptime = formatUptime(systemInfo.uptime);

  return (
    <div className="h-screen bg-gray-800 flex items-center justify-center">
      <div className="container max-w-6xl mx-auto px-6 md:px-10 py-4">
        {/* Top section with Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-8 mb-8">
          <InfoCard title="Processor" info={systemInfo.processor} color="rgb(59, 130, 246)" />
          <InfoCard title="Memory" info={systemInfo.memory} color="rgb(239, 68, 68)" />
          <StorageCardWithTabs storageData={systemInfo.storage} />
        </div>

        {/* Bottom section with WARD and Utilization chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
          <WARD uptime={uptime} />
          <UtilizationChart utilizationData={utilizationData} />
        </div>
      </div>
    </div>
  );
}