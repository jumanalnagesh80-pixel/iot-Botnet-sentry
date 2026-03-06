import { AlgorithmMetric } from './types';

export const BOOSTING_ALGORITHMS: AlgorithmMetric[] = [
  {
    name: 'Hist Gradient Boosting',
    accuracy: 99.9977,
    latency: 0.12,
    cpuUsage: 15,
    memoryUsage: 42,
  },
  {
    name: 'XGBoost',
    accuracy: 99.9842,
    latency: 0.45,
    cpuUsage: 28,
    memoryUsage: 85,
  },
  {
    name: 'LightGBM',
    accuracy: 99.9915,
    latency: 0.18,
    cpuUsage: 12,
    memoryUsage: 38,
  },
  {
    name: 'CatBoost',
    accuracy: 99.9890,
    latency: 0.85,
    cpuUsage: 35,
    memoryUsage: 120,
  },
  {
    name: 'AdaBoost',
    accuracy: 99.8520,
    latency: 1.20,
    cpuUsage: 22,
    memoryUsage: 25,
  },
];

export const PROTOCOLS = ['TCP', 'UDP', 'HTTP', 'MQTT'] as const;

export const BOTNET_SIGNATURES = [
  'Mirai Variant B', 
  'Mozi.Botnet', 
  'Gafgyt/Bashlite', 
  'Hajime P2P', 
  'Dark_Nexus', 
  'Emotet.IoT',
  'Tsunami.Bot',
  'Neko.Botnet'
];

export const INITIAL_STATS = {
  activeDevices: 1248,
  threatsBlocked: 142,
  avgLatency: 0.12,
  uptime: '14d 06h 22m',
};
