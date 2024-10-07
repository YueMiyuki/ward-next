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
import { ChevronLeft, ChevronRight, Thermometer, BarChart2, Sun, Moon } from 'lucide-react';
import {
  ProcessorInfo,
  MemoryInfo,
  GpuInfo,
  StorageInfo,
  SystemInfo,
  ChartData,
  ThemeToggleProps
} from '@/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-200 z-10"
    >
      {isDark ? <Sun size={24} /> : <Moon size={24} />}
    </button>
  )
}

const renderUsageWithDimming = (usage: string) => {
  const chars = usage.split('')
  let leadingZero = true
  return chars.map((char, index) => {
    if (leadingZero && char === '0') {
      return (
        <span key={index} className="text-gray-400 dark:text-gray-500">
          {char}
        </span>
      )
    } else {
      leadingZero = false
      return <span key={index}>{char}</span>
    }
  })
}

const InfoCard = ({ title, info, color, showTemperature = false }: { title: string; info: ProcessorInfo | MemoryInfo; color: string; showTemperature?: boolean }) => {
  const [showTemp, setShowTemp] = useState(false)

  const toggleTemp = () => setShowTemp((prev) => !prev)

  let usageDisplay = ''
  if ('usage' in info) {
    usageDisplay = info.usage.toString().padStart(3, '0')
  }
  
  const availableAmount = 'available' in info ? info.available.toString() : ''

  const temperature = 'temperature' in info && info.temperature ? `${info.temperature}°C` : null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full h-full relative animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200" style={{ color }}>{title}</h2>
        {showTemperature && (
          <button
            onClick={toggleTemp}
            className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full transition transform hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105"
          >
            {showTemp ? <BarChart2 size={16} /> : <Thermometer size={16} />}
          </button>
        )}
      </div>

      {'model' in info && title === 'Processor' && (
        <p className="text-xs mb-2 opacity-70 text-gray-600 dark:text-gray-400">{info.model}</p>
      )}

      {title === 'Memory' && Array.isArray(info.model) && (
        <p className="text-xs mb-2 opacity-70 text-gray-600 dark:text-gray-400">
          {Array.from(new Set(info.model)).join(', ')} 
        </p>
      )}

      <div className="text-4xl font-bold mb-1 text-gray-800 dark:text-gray-200" style={{ color }}>
        {showTemp && showTemperature ? temperature : (
          <>
            {renderUsageWithDimming(usageDisplay)}
            <span>%</span>
          </>
        )}
      </div>

      <p className="text-xs mb-3 opacity-70 text-gray-600 dark:text-gray-400">{showTemp && showTemperature ? 'Temperature' : `${title} Usage`}</p>

      <div className="grid grid-cols-2 gap-2 text-center text-gray-800 dark:text-gray-200">
        
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
  )
}

const GPUCard = ({ gpu }: { gpu: GpuInfo }) => {
  const [showTemp, setShowTemp] = useState(false)

  const toggleTemp = () => setShowTemp((prev) => !prev)
  const usageDisplay = gpu.usage.toString().padStart(3, '0')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full h-full relative animate-fadeIn">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-purple-600 dark:text-purple-400">GPU</h2>
        <button
          onClick={toggleTemp}
          className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full transition transform hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105"
        >
          {showTemp ? <BarChart2 size={16} /> : <Thermometer size={16} />}
        </button>
      </div>

      <p className="text-xs mb-2 opacity-70 text-gray-600 dark:text-gray-400">{gpu.model}</p>
      <div className="text-4xl font-bold mb-1 text-purple-600 dark:text-purple-400">
        {!showTemp ? (
          <>
            {renderUsageWithDimming(usageDisplay)}
            <span>%</span>
          </>
        ) : `${gpu.temperature}°C`}
      </div>
      <p className="text-xs mb-3 opacity-70 text-gray-600 dark:text-gray-400">{showTemp ? 'GPU Temperature' : 'GPU Usage'}</p>
      <div className="grid grid-cols-2 gap-2 text-center text-gray-800 dark:text-gray-200">
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
  )
}

const StorageCardWithTabs = ({ storageData }: { storageData: StorageInfo[] }) => {
  const [activeTab, setActiveTab] = useState(0)
  const changeTab = (direction: number) => {
    setActiveTab((prev) => (prev + direction + storageData.length) % storageData.length)
  }

  const storage = storageData[activeTab]
  const freePercentage = storage.total ? Math.round((storage.free / storage.total) * 100) : 0
  const usage = storage.usage !== undefined ? storage.usage.toString().padStart(3, '0') : '000'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full h-full relative animate-fadeIn">
      <h2 className="text-lg font-semibold mb-2 text-green-600 dark:text-green-400">Storage</h2>

      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <button
          onClick={() => changeTab(-1)}
          className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition transform hover:scale-105"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
        <button
          onClick={() => changeTab(1)}
          className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition transform hover:scale-105"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="text-center text-gray-800 dark:text-gray-200">
        <p className="text-xs mb-2 opacity-70">{storage.total} GB Total</p>
        <div className="text-4xl font-bold mb-1 text-green-600 dark:text-green-400">
          {renderUsageWithDimming(usage)}
          <span>%</span>
        </div>
        <p className="text-xs mb-3 opacity-70">Storage Usage</p>

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
  )
}

const UtilizationChart = ({ utilizationData, temperatureData }: { utilizationData: ChartData; temperatureData: ChartData }) => {
  const [isTempView, setIsTempView] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 h-full min-h-[200px] flex flex-col justify-center items-center animate-fadeIn">
      <div className="flex justify-between items-center w-full mb-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">% {isTempView ? 'Temperature' : 'Utilization'}</h2>
        <button
          onClick={() => setIsTempView(!isTempView)}
          className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full transition transform hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105"
        >
          {isTempView ? <BarChart2 size={16} /> : <Thermometer size={16} />}
        </button>
      </div>

      <div style={{ height: '100%', width: '100%' }}>
        <Line
          data={isTempView ? temperatureData : utilizationData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                min: 0,
                max: 100,
                ticks: {
                  stepSize: 10,
                  maxTicksLimit: 11,
                  color: 'rgb(156, 163, 175)',
                },
                grid: {
                  color: 'rgba(156, 163, 175, 0.4)',
                  lineWidth: 1.5,
                }
              },
              x: {
                display: false,
                grid: {
                  color: 'rgba(156, 163, 175, 0.4)',
                  lineWidth: 1.5,
                }
              }
            },
            plugins: {
              legend: { 
                position: 'top',
                labels: { 
                  usePointStyle: true,
                  pointStyle: 'line',
                  color: 'rgb(156, 163, 175)',
                }
              }
            }
          }}
        />
      </div>
    </div>
  )
}

const WARD = ({ uptime }: { uptime: { days: number; hours: number; minutes: number; seconds: number } }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-full h-full min-h-[200px] flex flex-col justify-center items-center text-center animate-fadeIn">
      <h2 className="text-lg font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
        W.A.R.D
      </h2>

      <div className="grid grid-cols-4 gap-4 w-full justify-center items-center mb-2">
        {Object.entries(uptime).map(([label, value], index) => (
          <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-center shadow-md flex flex-col justify-center items-center">
            <div className="text-2xl font-bol
d text-gray-800 dark:text-gray-200">{String(value).padStart(2, '0')}</div>
            <div className="text-xs opacity-70 text-gray-600 dark:text-gray-400">{label.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const LoadingScreen = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div className={`flex flex-col items-center justify-center h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      <div className={`w-16 h-16 mb-4 border-t-4 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'} rounded-full animate-spin`}></div>
      <div className={`text-2xl ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} font-semibold mb-2 transition-colors duration-300`}>Loading System Info</div>
      <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
        <span className="inline-block animate-bounce">.</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
        <span className="inline-block animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
      </div>
    </div>
  )
}

export default function SystemMonitorDashboard() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [utilizationData, setUtilizationData] = useState<ChartData>({
    labels: Array(20).fill(''),
    datasets: [
      { label: 'Processor', data: [], borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.5)', hidden: false },
      { label: 'Memory', data: [], borderColor: 'rgb(239, 68, 68)', backgroundColor: 'rgba(239, 68, 68, 0.5)', hidden: false },
      { label: 'Storage', data: [], borderColor: 'rgb(16, 185, 129)', backgroundColor: 'rgba(16, 185, 129, 0.5)', hidden: true },
    ],
  })

  const [temperatureData, setTemperatureData] = useState<ChartData>({
    labels: Array(20).fill(''),
    datasets: [
      { label: 'Processor Temperature', data: [], borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.5)' },
    ],
  })

  useEffect(() => {
    const updateSystemInfo = async () => {
      const response = await fetch('/api/system-info')
      const info: SystemInfo = await response.json()
      setSystemInfo(info)

      setUtilizationData((prev) => {
        const updatedDatasets = prev.datasets.map((dataset) => {
          if (dataset.label === 'GPU') {
            return { ...dataset, data: [...dataset.data.slice(-19), info.gpu?.usage ?? 0] }
          } else {
            return dataset.label === 'Processor'
              ? { ...dataset, data: [...dataset.data.slice(-19), info.processor.usage] }
              : dataset.label === 'Memory'
              ? { ...dataset, data: [...dataset.data.slice(-19), info.memory.usage] }
              : { ...dataset, data: [...dataset.data.slice(-19), info.storage[0]?.usage ?? 0] }
          }
        })

        if (info.gpu && !prev.datasets.some((dataset) => dataset.label === 'GPU')) {
          updatedDatasets.push({
            label: 'GPU',
            data: new Array(20).fill(0).concat(info.gpu.usage),
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.5)',
          })
        }

        return { labels: [...prev.labels.slice(-19), ''], datasets: updatedDatasets }
      })

      setTemperatureData((prev) => {
        const updatedDatasets = prev.datasets.map((dataset) => {
          if (dataset.label === 'GPU Temperature') {
            return { ...dataset, data: [...dataset.data.slice(-19), info.gpu?.temperature ?? 0] }
          } else {
            return { ...dataset, data: [...dataset.data.slice(-19), info.processor.temperature] }
          }
        })

        if (info.gpu && !prev.datasets.some((dataset) => dataset.label === 'GPU Temperature')) {
          updatedDatasets.push({
            label: 'GPU Temperature',
            data: new Array(20).fill(0).concat(info.gpu.temperature),
            borderColor: 'rgb(139, 92, 246)',
            backgroundColor: 'rgba(139, 92, 246, 0.5)',
          })
        }

        return { labels: [...prev.labels.slice(-19), ''], datasets: updatedDatasets }
      })
    }

    updateSystemInfo()

    const interval = setInterval(updateSystemInfo, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add('dark')
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev
      localStorage.setItem('theme', newTheme ? 'dark' : 'light')
      if (newTheme) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return newTheme
    })
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24))
    const hours = Math.floor((seconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = Math.floor(seconds % 60)

    return { days, hours, minutes, seconds: remainingSeconds }
  }

  if (!systemInfo) {
    return <LoadingScreen isDarkMode={isDarkMode} />
  }

  const uptime = formatUptime(systemInfo.uptime)
  const showGpuCard = systemInfo.gpu !== null

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} transition-colors duration-300 flex justify-center items-center`}>
      <ThemeToggle isDark={isDarkMode} toggleTheme={toggleTheme} />
      <div className="container max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
        <div className={`grid grid-cols-1 ${showGpuCard ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-4 mb-4`}>
          <InfoCard title="Processor" info={systemInfo.processor} color={isDarkMode ? "rgb(59, 130, 246)" : "rgb(37, 99, 235)"} showTemperature />
          <InfoCard title="Memory" info={systemInfo.memory} color={isDarkMode ? "rgb(239, 68, 68)" : "rgb(220, 38, 38)"} />
          {showGpuCard && <GPUCard gpu={systemInfo.gpu!} />}
          <StorageCardWithTabs storageData={systemInfo.storage} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WARD uptime={uptime} />
          <UtilizationChart utilizationData={utilizationData} temperatureData={temperatureData} />
        </div>
      </div>
    </div>
  )
}