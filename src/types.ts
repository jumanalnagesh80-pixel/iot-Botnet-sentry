export interface AlgorithmMetric {
  name: string;
  accuracy: number;
  latency: number; // in ms
  cpuUsage: number; // percentage
  memoryUsage: number; // in MB
}

export interface NetworkPacket {
  id: string;
  timestamp: string;
  sourceIp: string;
  destIp: string;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'MQTT';
  size: number;
  status: 'normal' | 'suspicious' | 'threat';
  confidence: number;
  signature?: string;
}

export interface SystemStats {
  activeDevices: number;
  threatsBlocked: number;
  avgLatency: number;
  uptime: string;
}

export interface AIChatMessage {
  role: 'user' | 'model';
  content: string;
}
