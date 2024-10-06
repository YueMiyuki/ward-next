"use client"

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
import { ChevronLeft, ChevronRight, Thermometer, BarChart2 } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

interface ProcessorInfo {
  usage: number;
  model: string;
  cores: number;
  speed: string;
  temperature: number;
}

interface MemoryInfo {
  usage: number;
  available: number;
  total: number;
  model: string[];
}

interface StorageInfo {
  usage: number;
  total: number;
  free: number;
}

interface GpuInfo {
  usage: number;
  model: string;
  temperature: number;
  vram: number;
  vramUsed: number;
}

interface SystemInfo {
  processor: ProcessorInfo;
  memory: MemoryInfo;
  storage: StorageInfo[];
  uptime: number;
  gpu: GpuInfo | null;
}

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

const InfoCard = ({ title, info, color, showTemperature = false }: { title: string; info: ProcessorInfo | MemoryInfo; color: string; showTemperature?: boolean }) => {
  const [showTemp, setShowTemp] = useState(showTemperature);

  const toggleTemp = () => setShowTemp((prev) => !prev);

  let usageDisplay = '';
  if ('usage' in info) {
    usageDisplay = info.usage.toString().padStart(3, '0');
  }
  
  const availableAmount = 'available' in info ? info.available.toString() : '';

  const temperature = 'temperature' in info && info.temperature ? `${info.temperature}°C` : null;

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 w-full h-full relative animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold" style={{ color }}>{title}</h2>
        {showTemperature && (
          <button
            onClick={toggleTemp}
            className="p-2 bg-gray-700 text-white rounded-full transition transform hover:bg-gray-600 hover:scale-105"
          >
            {showTemp ? <BarChart2 size={16} /> : <Thermometer size={16} />}
          </button>
        )}
      </div>

      {'model' in info && title === 'Processor' && (
        <p className="text-xs mb-2 opacity-70 text-gray-300">{info.model}</p>
      )}

      {title === 'Memory' && Array.isArray(info.model) && (
        <p className="text-xs mb-2 opacity-70 text-gray-300">
          {Array.from(new Set(info.model)).join(', ')} 
        </p>
      )}

      <div className="text-4xl font-bold mb-1" style={{ color }}>
        {showTemp ? temperature : (
          <>
            {renderUsageWithDimming(usageDisplay)}
            <span>%</span>
          </>
        )}
      </div>

      <p className="text-xs mb-3 opacity-70 text-gray-300">{showTemp ? 'Temperature' : `${title.toLowerCase()} usage`}</p>

      <div className="grid grid-cols-2 gap-2 text-center text-gray-300">
        
        {'cores' in info && 'speed' in info && (
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
        )}

        {'total' in info && 'available' in info && (
          <>
            <div>
              <p className="text-sm font-semibold">{availableAmount} GB</p>
              <p className="text-xs opacity-70">Available</p>
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

const GPUCard = ({ gpu }: { gpu: GpuInfo }) => {
  const [showTemp, setShowTemp] = useState(false);

  const toggleTemp = () => setShowTemp((prev) => !prev);
  const usageDisplay = gpu.usage.toString().padStart(3, '0');

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 w-full h-full relative animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-purple-400">GPU</h2>
        <button
          onClick={toggleTemp}
          className="p-2 bg-gray-700 text-white rounded-full transition transform hover:bg-gray-600 hover:scale-105"
        >
          {showTemp ? <BarChart2 size={16} /> : <Thermometer size={16} />}
        </button>
      </div>

      <p className="text-xs mb-2 opacity-70 text-gray-300">{gpu.model}</p>
      <div className="text-4xl font-bold mb-1 text-purple-400">
        {!showTemp ? (
          <>
            {renderUsageWithDimming(usageDisplay)}
            <span>%</span>
          </>
        ) : `${gpu.temperature}°C`}
      </div>
      <p className="text-xs mb-3 opacity-70">{showTemp ? 'GPU Temperature' : 'GPU Usage'}</p>
      <div className="grid grid-cols-2 gap-2 text-center text-gray-300">
        <div>
          <p className="text-sm font-semibold">{gpu.vramUsed} GB</p>
          <p className="text-xs opacity-70">VRAM Used</p>
        </div>
        <div>
          <p className="text-sm font-semibold">{gpu.vram} GB</p>
          <p className="text-xs opacity-70">Total VRAM</p>
        </div>
      </div>
    </div>
  );
};

const StorageCardWithTabs = ({ storageData }: { storageData: StorageInfo[] }) => {
  const [activeTab, setActiveTab] = useState(0);
  const changeTab = (direction: number) => {
    setActiveTab((prev) => (prev + direction + storageData.length) % storageData.length);
  };

  const storage = storageData[activeTab];
  const freePercentage = storage.total ? Math.round((storage.free / storage.total) * 100) : 0;
  const usage = storage.usage !== undefined ? storage.usage.toString().padStart(3, '0') : '000';

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 w-full h-full relative animate-fadeIn">
      <h2 className="text-lg font-semibold mb-2 text-green-400">Storage</h2>

      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <button
          onClick={() => changeTab(-1)}
          className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition transform hover:scale-105"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <button
          onClick={() => changeTab(1)}
          className="p-2 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition transform hover:scale-105"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="text-center text-gray-300">
        <p className="text-xs mb-2 opacity-70">{storage.total} GB Total</p>
        <div className="text-4xl font-bold mb-1 text-green-400">
          {renderUsageWithDimming(usage)}
          <span>%</span>
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

const UtilizationChart = ({ utilizationData, temperatureData }: { utilizationData: ChartData; temperatureData: ChartData }) => {
  const [isTempView, setIsTempView] = useState(false);

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 h-full min-h-[200px] flex flex-col justify-center items-center animate-fadeIn">
      <div className="flex justify-between items-center w-full mb-2">
        <h2 className="text-lg font-semibold text-white">% {isTempView ? 'Temperature' : 'Utilization'}</h2>
        <button
          onClick={() => setIsTempView(!isTempView)}
          className="p-2 bg-gray-700 text-white rounded-full transition transform hover:bg-gray-600 hover:scale-105"
        >
          {isTempView ? <BarChart2 size={16} /> : <Thermometer size={16} />}
        </button>
      </div>

      <div style={{ height: '90px', width: '100%' }}>
        <Line
          data={isTempView ? temperatureData : utilizationData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: !isTempView,
                max: isTempView ? undefined : 100,
                ticks: {
                  stepSize: isTempView ? undefined : 10,
                  maxTicksLimit: 11
                }
              },
              x: { display: false }
            },
            plugins: {
              legend: { position: 'top', labels: { usePointStyle: true, pointStyle: 'line' } }
            }
          }}
        />
      </div>
    </div>
  );
};

const WARD = ({ uptime }: { uptime: { days: number; hours: number; minutes: number; seconds: number } }) => {
  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-4 w-full h-full min-h-[200px] flex flex-col justify-center items-center text-center animate-fadeIn">
      <h2 className="text-lg font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
        W.A.R.D
      </h2>

      <div className="grid grid-cols-4 gap-4 w-full justify-center items-center mb-2">
        {Object.entries(uptime).map(([label, value], index) => (
          <div key={index} className="bg-gray-800 p-3 rounded text-center shadow-md flex flex-col justify-center items-center">
            <div className="text-2xl font-bold text-white">{String(value).padStart(2, '0')}</div>
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
      { label: 'Storage', data: [], borderColor: 'rgb(16, 185, 129)', backgroundColor: 'rgba(16, 185, 129, 0.5)', hidden: true },
    ],
  });

  const [temperatureData, setTemperatureData] = useState<ChartData>({
    labels: Array(20).fill(''),
    datasets: [
      { label: 'Processor Temperature', data: [], borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.5)' },
    ],
  });

  useEffect(() => {
    const updateSystemInfo = async () => {
      const response = await fetch('/api/system-info');
      const info: SystemInfo = await response.json();
      setSystemInfo(info);

      setUtilizationData((prev) => {
        const updatedDatasets = prev.datasets.map((dataset) => {
          if (dataset.label === 'GPU') {
            return { ...dataset, data: [...dataset.data.slice(-19), info.gpu?.usage ?? 0] };
          } else {
            return dataset.label === 'Processor'
              ? { ...dataset, data: [...dataset.data.slice(-19), info.processor.usage] }
              : dataset.label === 'Memory'
              ? { ...dataset, data: [...dataset.data.slice(-19), info.memory.usage] }
              : { ...dataset, data: [...dataset.data.slice(-19), info.storage[0]?.usage ?? 0] };
          }
        });

        if (info.gpu && !prev.datasets.some((dataset) => dataset.label === 'GPU')) {
          updatedDatasets.push({
            label: 'GPU',
            data: new Array(20).fill(0).concat(info.gpu.usage),
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.5)',
          });
        }

        return { labels: [...prev.labels.slice(-19), ''], datasets: updatedDatasets };
      });

      setTemperatureData((prev) => {
        const updatedDatasets = prev.datasets.map((dataset) => {
          if (dataset.label === 'GPU Temperature') {
            return { ...dataset, data: [...dataset.data.slice(-19), info.gpu?.temperature ?? 0] };
          } else {
            return { ...dataset, data: [...dataset.data.slice(-19), info.processor.temperature] };
          }
        });

        if (info.gpu && !prev.datasets.some((dataset) => dataset.label === 'GPU Temperature')) {
          updatedDatasets.push({
            label: 'GPU Temperature',
            data: new Array(20).fill(0).concat(info.gpu.temperature),
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.5)',
          });
        }

        return { labels: [...prev.labels.slice(-19), ''], datasets: updatedDatasets };
      });
    };

    updateSystemInfo();

    const interval = setInterval(updateSystemInfo, 1000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="text-2xl text-gray-300 animate-pulse">Loading...</div>
      </div>
    );
  }

  const uptime = formatUptime(systemInfo.uptime);
  const showGpuCard = systemInfo.gpu !== null;

  return (
    <div className="h-screen bg-gray-800 flex items-center justify-center">
      <div className="container max-w-6xl mx-auto px-6 md:px-10 py-4 animate-fadeIn">
        <div className={`grid grid-cols-1 ${showGpuCard ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-x-6 gap-y-6 mb-6`}>
          <InfoCard title="Processor" info={systemInfo.processor} color="rgb(59, 130, 246)" showTemperature />
          <InfoCard title="Memory" info={systemInfo.memory} color="rgb(239, 68, 68)" />
          {showGpuCard && <GPUCard gpu={systemInfo.gpu!} />}
          <StorageCardWithTabs storageData={systemInfo.storage} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          <WARD uptime={uptime} />
          <UtilizationChart utilizationData={utilizationData} temperatureData={temperatureData} />
        </div>
      </div>
    </div>
  );
}