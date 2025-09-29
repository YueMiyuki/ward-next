"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ChevronLeft,
  ChevronRight,
  Thermometer,
  Activity,
  Sun,
  Moon,
  Cpu,
  HardDrive,
  MemoryStick,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartDataPoint } from "@/types/chart-data-point";

interface ProcessorInfo {
  model: string;
  usage: number;
  cores: number;
  speed: string;
  temperature: number;
}

interface MemoryInfo {
  model: string[];
  usage: number;
  total: number;
  available: number;
}

interface GpuInfo {
  model: string;
  usage: number;
  temperature: number;
  vram: number;
  vramUsed: number;
}

interface StorageInfo {
  total: number;
  free: number;
  usage: number;
}

interface SystemStats {
  bootTime: string;
  processes: number;
  loadAverage: string[];
  networkStats: {
    bytesReceived: number;
    bytesSent: number;
  };
}

interface SystemInfo {
  processor: ProcessorInfo;
  memory: MemoryInfo;
  gpu: GpuInfo | null;
  storage: StorageInfo[];
  uptime: number;
  systemStats: SystemStats;
}

const ThemeToggle = ({
  isDark,
  toggleTheme,
}: {
  isDark: boolean;
  toggleTheme: () => void;
}) => {
  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="fixed top-6 right-6 z-50 bg-card/80 backdrop-blur-sm border-border hover:bg-accent/80 transition-all duration-300 animate-fade-in-up"
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300 rotate-0 scale-100" />
      )}
    </Button>
  );
};

const renderUsageWithDimming = (usage: string) => {
  const chars = usage.split("");
  let leadingZero = true;
  return chars.map((char, index) => {
    if (leadingZero && char === "0") {
      return (
        <span
          key={index}
          className="text-muted-foreground/40 transition-colors duration-200"
        >
          {char}
        </span>
      );
    } else {
      leadingZero = false;
      return (
        <span key={index} className="transition-colors duration-200">
          {char}
        </span>
      );
    }
  });
};

const InfoCard = ({
  title,
  info,
  icon: Icon,
  showTemperature = false,
}: {
  title: string;
  info: ProcessorInfo | MemoryInfo;
  icon: React.ElementType;
  showTemperature?: boolean;
}) => {
  const [showTemp, setShowTemp] = useState(false);

  const usageDisplay =
    "usage" in info ? info.usage.toString().padStart(3, "0") : "000";
  const availableAmount = "available" in info ? info.available.toString() : "";
  const temperature =
    "temperature" in info && info.temperature ? `${info.temperature}°C` : null;

  return (
    <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-2 border-border hover:border-primary/30 transition-all duration-500 animate-fade-in-up shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">
              {title}
            </CardTitle>
          </div>
          {showTemperature && (
            <Button
              onClick={() => setShowTemp(!showTemp)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-accent/50 transition-all duration-200"
            >
              {showTemp ? (
                <Activity className="h-4 w-4" />
              ) : (
                <Thermometer className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {"model" in info && title === "Processor" && (
          <CardDescription className="text-xs text-muted-foreground/80 truncate">
            {info.model}
          </CardDescription>
        )}

        {title === "Memory" && Array.isArray(info.model) && (
          <CardDescription className="text-xs text-muted-foreground/80 truncate">
            {Array.from(new Set(info.model)).join(", ")}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary mb-1 font-mono tracking-tight">
            {showTemp && showTemperature ? (
              temperature
            ) : (
              <>
                {renderUsageWithDimming(usageDisplay)}
                <span className="text-2xl text-muted-foreground">%</span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {showTemp && showTemperature ? "Temperature" : `${title} Usage`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {"cores" in info && "speed" in info && (
            <>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <p className="text-sm font-semibold text-foreground">
                  {info.cores}
                </p>
                <p className="text-xs text-muted-foreground">Cores</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <p className="text-sm font-semibold text-foreground">
                  {info.speed}
                </p>
                <p className="text-xs text-muted-foreground">Speed</p>
              </div>
            </>
          )}

          {"total" in info && "available" in info && (
            <>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <p className="text-sm font-semibold text-foreground">
                  {availableAmount} GB
                </p>
                <p className="text-xs text-muted-foreground">Available</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/30">
                <p className="text-sm font-semibold text-foreground">
                  {info.total} GB
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const GPUCard = ({ gpu }: { gpu: GpuInfo }) => {
  const [showTemp, setShowTemp] = useState(false);
  const usageDisplay = gpu.usage.toString().padStart(3, "0");

  return (
    <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-2 border-border hover:border-chart-4/30 transition-all duration-500 animate-fade-in-up shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-4/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-4/10 text-chart-4">
              <Zap className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">
              GPU
            </CardTitle>
          </div>
          <Button
            onClick={() => setShowTemp(!showTemp)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-accent/50 transition-all duration-200"
          >
            {showTemp ? (
              <Activity className="h-4 w-4" />
            ) : (
              <Thermometer className="h-4 w-4" />
            )}
          </Button>
        </div>

        <CardDescription className="text-xs text-muted-foreground/80 truncate">
          {gpu.model}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-chart-4 mb-1 font-mono tracking-tight">
            {!showTemp ? (
              <>
                {renderUsageWithDimming(usageDisplay)}
                <span className="text-2xl text-muted-foreground">%</span>
              </>
            ) : (
              `${gpu.temperature}°C`
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {showTemp ? "GPU Temperature" : "GPU Usage"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-sm font-semibold text-foreground">
              {gpu.vramUsed} GB
            </p>
            <p className="text-xs text-muted-foreground">VRAM Used</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-sm font-semibold text-foreground">
              {gpu.vram} GB
            </p>
            <p className="text-xs text-muted-foreground">Total VRAM</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StorageCardWithTabs = ({
  storageData,
}: {
  storageData: StorageInfo[];
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // Ensure the active tab stays within bounds if storage list size changes
  useEffect(() => {
    setActiveTab((prev) => {
      if (!storageData.length) return 0;
      return Math.min(prev, storageData.length - 1);
    });
  }, [storageData.length]);

  const changeTab = (direction: number) => {
    setActiveTab(
      (prev) => (prev + direction + storageData.length) % storageData.length,
    );
  };

  const storage = storageData[activeTab];
  const freePercentage = storage.total
    ? Math.round((storage.free / storage.total) * 100)
    : 0;
  const usage =
    storage.usage !== undefined
      ? storage.usage.toString().padStart(3, "0")
      : "000";

  return (
    <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-2 border-border hover:border-chart-5/30 transition-all duration-500 animate-fade-in-up shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-chart-5/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-chart-5/10 text-chart-5">
              <HardDrive className="h-4 w-4" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Storage
            </CardTitle>
          </div>

          {storageData.length > 1 && (
            <div className="flex items-center gap-1">
              <Button
                onClick={() => changeTab(-1)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-accent/50 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Badge variant="secondary" className="text-xs px-2">
                {activeTab + 1}/{storageData.length}
              </Badge>
              <Button
                onClick={() => changeTab(1)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-accent/50 transition-all duration-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <CardDescription className="text-xs text-muted-foreground/80">
          {storage.total} GB Total Capacity
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-chart-5 mb-1 font-mono tracking-tight">
            {renderUsageWithDimming(usage)}
            <span className="text-2xl text-muted-foreground">%</span>
          </div>
          <p className="text-xs text-muted-foreground">Storage Usage</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-sm font-semibold text-foreground">
              {freePercentage}%
            </p>
            <p className="text-xs text-muted-foreground">Free</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <p className="text-sm font-semibold text-foreground">
              {storage.total} GB
            </p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const UtilizationChart = ({ chartData }: { chartData: ChartDataPoint[] }) => {
  const [isTempView, setIsTempView] = useState(false);

  const chartConfig = {
    processor: {
      label: "Processor",
      color: "hsl(220, 70%, 50%)", // Blue
    },
    memory: {
      label: "Memory",
      color: "hsl(142, 76%, 36%)", // Green
    },
    storage: {
      label: "Storage",
      color: "hsl(262, 83%, 58%)", // Purple
    },
    gpu: {
      label: "GPU",
      color: "hsl(346, 87%, 43%)", // Red/Pink
    },
    processorTemp: {
      label: "CPU Temp",
      color: "hsl(220, 70%, 50%)", // Blue
    },
    gpuTemp: {
      label: "GPU Temp",
      color: "hsl(346, 87%, 43%)", // Red/Pink
    },
  };

  return (
    <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-2 border-border hover:border-primary/30 transition-all duration-500 animate-fade-in-up shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            {isTempView ? "Temperature Monitor" : "System Utilization"}
          </CardTitle>
          <Button
            onClick={() => setIsTempView(!isTempView)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-accent/50 transition-all duration-200"
          >
            {isTempView ? (
              <Activity className="h-4 w-4" />
            ) : (
              <Thermometer className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription className="text-xs text-muted-foreground/80">
          Real-time {isTempView ? "temperature" : "usage"} monitoring
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
            >
              <defs>
                <linearGradient
                  id="processorGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(220, 70%, 50%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(220, 70%, 50%)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient id="memoryGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(142, 76%, 36%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(142, 76%, 36%)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient id="gpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(346, 87%, 43%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(346, 87%, 43%)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
                <linearGradient
                  id="storageGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(262, 83%, 58%)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(262, 83%, 58%)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--muted-foreground))"
                strokeOpacity={0.6}
              />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                interval="preserveStartEnd"
                tickFormatter={(value) => {
                  try {
                    const [hours, minutes] = value.split(":");
                    return `${hours}:${minutes}`;
                  } catch {
                    return value;
                  }
                }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                domain={[0, isTempView ? 100 : 100]}
                tickFormatter={(value) => `${value}${isTempView ? "°C" : "%"}`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />

              {!isTempView ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="processor"
                    stroke="hsl(220, 70%, 50%)"
                    fill="url(#processorGradient)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(220, 70%, 50%)", strokeWidth: 2, r: 3 }}
                    activeDot={{
                      r: 5,
                      stroke: "hsl(220, 70%, 50%)",
                      strokeWidth: 2,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="hsl(142, 76%, 36%)"
                    fill="url(#memoryGradient)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(142, 76%, 36%)", strokeWidth: 2, r: 3 }}
                    activeDot={{
                      r: 5,
                      stroke: "hsl(142, 76%, 36%)",
                      strokeWidth: 2,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="storage"
                    stroke="hsl(262, 83%, 58%)"
                    fill="url(#storageGradient)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(262, 83%, 58%)", strokeWidth: 2, r: 3 }}
                    activeDot={{
                      r: 5,
                      stroke: "hsl(262, 83%, 58%)",
                      strokeWidth: 2,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="gpu"
                    stroke="hsl(346, 87%, 43%)"
                    fill="url(#gpuGradient)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(346, 87%, 43%)", strokeWidth: 2, r: 3 }}
                    activeDot={{
                      r: 5,
                      stroke: "hsl(346, 87%, 43%)",
                      strokeWidth: 2,
                    }}
                  />
                </>
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="processorTemp"
                    stroke="hsl(220, 70%, 50%)"
                    fill="url(#processorGradient)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(220, 70%, 50%)", strokeWidth: 2, r: 3 }}
                    activeDot={{
                      r: 5,
                      stroke: "hsl(220, 70%, 50%)",
                      strokeWidth: 2,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="gpuTemp"
                    stroke="hsl(346, 87%, 43%)"
                    fill="url(#gpuGradient)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(346, 87%, 43%)", strokeWidth: 2, r: 3 }}
                    activeDot={{
                      r: 5,
                      stroke: "hsl(346, 87%, 43%)",
                      strokeWidth: 2,
                    }}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

const UptimeDisplay = ({
  uptime,
  systemStats,
}: {
  uptime: { days: number; hours: number; minutes: number; seconds: number };
  systemStats: SystemStats;
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatBytes = (bytes: number) => {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const bootTime = new Date(systemStats.bootTime);
  const currentTimeString = currentTime.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <Card className="group relative overflow-hidden bg-card/50 backdrop-blur-sm border-2 border-border hover:border-primary/30 transition-all duration-500 animate-fade-in-up shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4 w-32 h-32 bg-primary rounded-full animate-pulse-slow"></div>
        <div
          className="absolute bottom-4 left-4 w-24 h-24 bg-chart-2 rounded-full animate-pulse-slow"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
            System Status
          </CardTitle>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-accent/50 transition-all duration-200"
          >
            <Activity className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs text-muted-foreground/80">
          {showDetails
            ? "System details and network stats"
            : "Uptime and current time"}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10">
        {!showDetails ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1 font-mono tracking-wider">
                {currentTimeString.split(":").map((part, index) => (
                  <span key={index}>
                    {part}
                    {index < 2 && (
                      <span className="animate-pulse text-muted-foreground mx-1">
                        :
                      </span>
                    )}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Current System Time
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {Object.entries(uptime).map(([label, value], index) => (
                <div
                  key={index}
                  className="text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200 group/item hover:scale-105"
                >
                  <div className="text-2xl font-bold text-foreground font-mono group-hover/item:text-primary transition-colors duration-200 animate-count-up">
                    {String(value).padStart(2, "0")}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center p-3 rounded-lg bg-muted/20 border border-muted">
              <p className="text-sm font-semibold text-foreground">
                Boot Time: {bootTime.toLocaleDateString()}{" "}
                {bootTime.toLocaleTimeString()}
              </p>
              <p className="text-xs text-muted-foreground">System started</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div className="text-xl font-bold text-chart-1 animate-pulse-glow">
                  {systemStats.processes}
                </div>
                <div className="text-xs text-muted-foreground">
                  Active Processes
                </div>
              </div>

              <div className="text-center p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                <div className="text-xl font-bold text-chart-2">
                  {systemStats.loadAverage[0]}
                </div>
                <div className="text-xs text-muted-foreground">
                  Load Average
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20 border border-muted">
                <span className="text-sm text-muted-foreground">
                  Network Received:
                </span>
                <span className="text-sm font-semibold text-chart-3 animate-shimmer">
                  {formatBytes(systemStats.networkStats.bytesReceived)}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20 border border-muted">
                <span className="text-sm text-muted-foreground">
                  Network Sent:
                </span>
                <span className="text-sm font-semibold text-chart-4 animate-shimmer">
                  {formatBytes(systemStats.networkStats.bytesSent)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {systemStats.loadAverage.map((load, index) => (
                <div
                  key={index}
                  className="text-center p-2 rounded-lg bg-muted/30"
                >
                  <div className="text-sm font-semibold text-foreground">
                    {load}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {["1m", "5m", "15m"][index]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const LoadingScreen = ({ isDarkMode }: { isDarkMode: boolean }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-border/30 border-t-primary rounded-full animate-spin"></div>
      </div>

      <div className="mt-8 text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground animate-fade-in-up">
          Loading System Monitor
        </h2>
        <div className="flex items-center justify-center space-x-1 text-muted-foreground">
          <span className="animate-bounce">●</span>
          <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
            ●
          </span>
          <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
            ●
          </span>
        </div>
      </div>
    </div>
  );
};

export default function SystemMonitorDashboard() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    const updateSystemInfo = async () => {
      try {
        const response = await fetch("/api/system-info");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const info: SystemInfo = await response.json();
        setSystemInfo(info);

        setChartData((prev) => {
          const now = new Date();
          const timeString = now.toISOString().split("T")[1].slice(0, 8); // HH:MM:SS format

          const newDataPoint: ChartDataPoint = {
            time: timeString,
            processor: info.processor.usage,
            memory: info.memory.usage,
            storage: info.storage[0]?.usage ?? 0,
            gpu: info.gpu?.usage,
            processorTemp: info.processor.temperature,
            gpuTemp: info.gpu?.temperature,
          };

          return [...prev.slice(-19), newDataPoint];
        });
      } catch (error) {
        console.log(error);
      }
    };

    updateSystemInfo();
    const interval = setInterval(updateSystemInfo, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      if (newTheme) {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      }
      return newTheme;
    });
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return { days, hours, minutes, seconds: remainingSeconds };
  };

  if (!systemInfo) {
    return <LoadingScreen isDarkMode={isDarkMode} />;
  }

  const uptime = formatUptime(systemInfo.uptime);
  const showGpuCard = systemInfo.gpu !== null;

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <ThemeToggle isDark={isDarkMode} toggleTheme={toggleTheme} />

      <div className="container max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 text-center space-y-2 animate-fade-in-up">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
            System Monitor
          </h1>
          <p className="text-muted-foreground">
            Real-time system performance monitoring
          </p>
        </div>

        <div
          className={`grid grid-cols-1 ${showGpuCard ? "lg:grid-cols-4" : "lg:grid-cols-3"} gap-6 mb-8`}
        >
          <InfoCard
            title="Processor"
            info={systemInfo.processor}
            icon={Cpu}
            showTemperature
          />
          <InfoCard
            title="Memory"
            info={systemInfo.memory}
            icon={MemoryStick}
          />
          {showGpuCard && <GPUCard gpu={systemInfo.gpu!} />}
          <StorageCardWithTabs storageData={systemInfo.storage} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UptimeDisplay uptime={uptime} systemStats={systemInfo.systemStats} />
          <UtilizationChart chartData={chartData} />
        </div>
      </div>
    </div>
  );
}
