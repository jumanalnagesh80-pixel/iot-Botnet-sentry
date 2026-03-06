import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Activity, 
  Cpu, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Server, 
  Network,
  BarChart3,
  Clock,
  ArrowUpRight,
  Search,
  Settings,
  Bell,
  Bot,
  Send,
  Loader2,
  Sparkles,
  X,
  MessageSquare,
  Info,
  Lock,
  User,
  LogOut,
  ChevronRight,
  Fingerprint,
  Globe,
  Database,
  Wifi,
  ArrowRight,
  Terminal,
  Download
} from 'lucide-react';
import Markdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { cn } from './lib/utils';
import { BOOSTING_ALGORITHMS, INITIAL_STATS, PROTOCOLS, BOTNET_SIGNATURES } from './constants';
import { NetworkPacket, SystemStats, AIChatMessage } from './types';

// --- AI Service ---
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// --- Components ---

const Notification = ({ message, type, onClose }: { message: string, type: 'success' | 'info' | 'error', onClose: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, y: 50, x: '-50%' }}
    animate={{ opacity: 1, y: 0, x: '-50%' }}
    exit={{ opacity: 0, y: 20, x: '-50%' }}
    className={cn(
      "fixed bottom-24 left-1/2 z-[100] px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-4 min-w-[300px]",
      type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
      type === 'error' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
      "bg-blue-500/10 border-blue-500/20 text-blue-500"
    )}
  >
    {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
    <span className="text-[10px] font-black uppercase tracking-widest flex-1">{message}</span>
    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
      <X className="w-4 h-4" />
    </button>
  </motion.div>
);

const Logo = ({ className = "w-12 h-12" }: { className?: string }) => (
  <div className={cn("relative flex items-center justify-center", className)}>
    {/* Outer Hexagon Shape */}
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">
      <path 
        d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        className="text-emerald-500/30"
      />
      <motion.path 
        d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeDasharray="300"
        initial={{ strokeDashoffset: 300 }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="text-emerald-500"
      />
    </svg>
    
    {/* Inner Shield/S Shape */}
    <div className="relative z-10 flex items-center justify-center">
      <Shield className="w-1/2 h-1/2 text-white" />
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 w-full h-full border-2 border-dashed border-emerald-500/20 rounded-full scale-125"
      />
    </div>
  </div>
);

const AIAssistant = ({ packets, algorithms }: { packets: NetworkPacket[], algorithms: any[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([
    { role: 'model', content: "Hello! I'm your AI Cybersecurity Analyst. I can help you analyze network traffic, explain botnet signatures, or suggest mitigation strategies. How can I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getSuggestions = () => {
    const suggestions = [];
    const threats = packets.filter(p => p.status === 'threat');
    const suspicious = packets.filter(p => p.status === 'suspicious');
    
    if (threats.length > 0) {
      suggestions.push("Analyze recent threat vectors");
      suggestions.push("Explain Mirai botnet signature");
    } else if (suspicious.length > 0) {
      suggestions.push("Investigate suspicious traffic patterns");
      suggestions.push("Check for protocol anomalies");
    } else {
      suggestions.push("Compare boosting algorithms");
      suggestions.push("Explain Hist Gradient Boosting");
    }
    
    suggestions.push("Suggest mitigation strategies");
    return suggestions.slice(0, 3);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const messageToSend = text || input;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage = messageToSend.trim();
    if (!text) setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const model = genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.concat({ role: 'user', content: userMessage }).map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: `You are an expert IoT Cybersecurity Analyst. 
          Current Dashboard Context:
          - Recent Packets: ${JSON.stringify(packets.slice(0, 5))}
          - Algorithms: ${JSON.stringify(algorithms)}
          Provide concise, technical, and actionable insights. Use markdown for formatting.`,
        }
      });

      const result = await model;
      const response = result.text || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Error connecting to the AI service. Please check your configuration." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-110 transition-transform z-50 group"
      >
        <Bot className="w-7 h-7 group-hover:animate-bounce" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-iot-bg animate-pulse" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[400px] h-[600px] glass-panel flex flex-col z-50 shadow-2xl border-emerald-500/30"
          >
            <div className="p-4 border-b border-iot-border flex justify-between items-center bg-emerald-500/10">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-white">AI Analyst Pro</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex items-start gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border",
                    msg.role === 'user' ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-500" : "bg-zinc-800 border-white/5 text-zinc-400"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn(
                    "max-w-[75%] p-4 rounded-2xl text-xs leading-relaxed shadow-lg",
                    msg.role === 'user' 
                      ? "bg-gradient-to-br from-emerald-600 to-emerald-500 text-white rounded-tr-none shadow-emerald-500/10" 
                      : "bg-zinc-800/80 backdrop-blur-md text-zinc-300 rounded-tl-none border border-white/5 shadow-black/20"
                  )}>
                    <div className="prose prose-invert prose-xs">
                      <Markdown>{msg.content}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center flex-shrink-0 text-zinc-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-zinc-800/50 p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-3">
                    <div className="flex gap-1">
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Analyzing Data</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-iot-border bg-iot-card">
              <div className="flex flex-wrap gap-2 mb-3">
                {getSuggestions().map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(suggestion)}
                    disabled={isLoading}
                    className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about threats or algorithms..."
                  className="w-full bg-zinc-900 border border-iot-border rounded-xl py-3 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:text-emerald-400 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const AIInsightButton = ({ context, data }: { context: string, data: any }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const generateInsight = async () => {
    setIsGenerating(true);
    try {
      const model = genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this ${context} data from an IoT Botnet Detection system: ${JSON.stringify(data)}. Provide a one-sentence high-level insight and one recommendation.`,
      });
      const result = await model;
      setInsight(result.text || "No insight available.");
    } catch (error) {
      console.error(error);
      setInsight("Failed to generate AI insight.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={generateInsight}
        disabled={isGenerating}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500 hover:bg-emerald-500/20 transition-all active:scale-95"
      >
        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        AI Insight
      </button>
      
      <AnimatePresence>
        {insight && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-72 p-4 glass-panel z-50 border-emerald-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-iot-card/95 backdrop-blur-xl"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Smart Analysis
              </span>
              <button onClick={() => setInsight(null)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed italic">
              {insight}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [terminalId, setTerminalId] = useState("admin_operator_01");
  const [accessKey, setAccessKey] = useState("password123");
  const [errors, setErrors] = useState<{ terminalId?: string; accessKey?: string }>({});

  const validate = () => {
    const newErrors: { terminalId?: string; accessKey?: string } = {};
    
    if (!terminalId.trim()) {
      newErrors.terminalId = "Terminal ID is required";
    } else if (terminalId.length < 5) {
      newErrors.terminalId = "ID must be at least 5 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(terminalId)) {
      newErrors.terminalId = "Only alphanumeric and underscores allowed";
    }

    if (!accessKey.trim()) {
      newErrors.accessKey = "Access Key is required";
    } else if (accessKey.length < 6) {
      newErrors.accessKey = "Key must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    setTimeout(() => {
      onLogin();
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-iot-bg flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05]" />
        
        {/* Animated Scanning Line */}
        <motion.div 
          animate={{ top: ['-10%', '110%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent shadow-[0_0_15px_rgba(16,185,129,0.5)] z-10"
        />

        {/* Floating Technical Orbs */}
        <motion.div 
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-24 h-24 mb-8 relative group mx-auto"
          >
            <Logo className="w-24 h-24" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-5xl font-black text-white tracking-tighter mb-3"
          >
            SENTRY<span className="text-emerald-500">.</span>SOC
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-zinc-500 text-xs uppercase tracking-[0.5em] font-bold"
          >
            Autonomous IoT Defense Grid
          </motion.p>
        </div>

        <div className="glass-panel p-10 border-white/10 bg-iot-card/40 backdrop-blur-3xl shadow-[0_40px_120px_rgba(0,0,0,0.7)] relative overflow-hidden">
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/30 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500/30 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/30 rounded-br-xl" />

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Operator Identifier</label>
                <span className="text-[9px] font-mono text-emerald-500/50">SEC-LEVEL: 4</span>
              </div>
              <motion.div 
                whileFocus={{ scale: 1.01 }}
                className="relative group"
              >
                <User className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10", errors.terminalId ? "text-red-500" : "text-zinc-500 group-focus-within:text-emerald-500")} />
                <input 
                  type="text" 
                  value={terminalId}
                  onChange={(e) => {
                    setTerminalId(e.target.value);
                    if (errors.terminalId) setErrors(prev => ({ ...prev, terminalId: undefined }));
                  }}
                  className={cn(
                    "w-full bg-black/40 border rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none transition-all font-mono",
                    errors.terminalId ? "border-red-500/50 focus:border-red-500 bg-red-500/5" : "border-white/5 focus:border-emerald-500/50 focus:bg-black/60 shadow-[0_0_0_0_rgba(16,185,129,0)] focus:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  )}
                  placeholder="Enter Operator ID"
                />
              </motion.div>
              {errors.terminalId && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] text-red-500 font-bold uppercase tracking-wide ml-1">
                  {errors.terminalId}
                </motion.p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Authorization Key</label>
                <span className="text-[9px] font-mono text-emerald-500/50">ENCRYPTION: AES-256</span>
              </div>
              <motion.div 
                whileFocus={{ scale: 1.01 }}
                className="relative group"
              >
                <Lock className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10", errors.accessKey ? "text-red-500" : "text-zinc-500 group-focus-within:text-emerald-500")} />
                <input 
                  type="password" 
                  value={accessKey}
                  onChange={(e) => {
                    setAccessKey(e.target.value);
                    if (errors.accessKey) setErrors(prev => ({ ...prev, accessKey: undefined }));
                  }}
                  className={cn(
                    "w-full bg-black/40 border rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none transition-all font-mono",
                    errors.accessKey ? "border-red-500/50 focus:border-red-500 bg-red-500/5" : "border-white/5 focus:border-emerald-500/50 focus:bg-black/60 shadow-[0_0_0_0_rgba(16,185,129,0)] focus:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  )}
                  placeholder="Enter Password"
                />
              </motion.div>
              {errors.accessKey && (
                <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] text-red-500 font-bold uppercase tracking-wide ml-1">
                  {errors.accessKey}
                </motion.p>
              )}
            </div>

            <motion.button 
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(16,185,129,0.5)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 text-white font-black py-5 rounded-2xl shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-4 disabled:opacity-70 group relative overflow-hidden"
            >
              {/* Button Shine Effect */}
              <motion.div 
                animate={{ left: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
              />
              
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Fingerprint className="w-6 h-6 group-hover:scale-110 transition-transform relative z-10" />
                  <span className="tracking-[0.2em] uppercase text-sm relative z-10">Initialize Session</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
              <Globe className="w-4 h-4 text-emerald-500/50" />
              Node: ASIA-EAST-01
            </div>
            <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-black uppercase tracking-widest">
              <Database className="w-4 h-4 text-emerald-500/50" />
              Integrity: 100%
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-10 space-y-2"
        >
          <p className="text-zinc-600 text-[10px] uppercase tracking-[0.4em] font-black">
            Authorized Personnel Only • IP Logged
          </p>
          <p className="text-zinc-800 text-[9px] font-mono">
            v2.4.0-STABLE // SYSTEM_READY
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="glass-panel p-6 flex flex-col gap-4 relative group hover:border-emerald-500/30 transition-all">
    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon className="w-12 h-12" />
    </div>
    <div className="flex justify-between items-start">
      <div className={cn("p-3 rounded-xl bg-opacity-10 shadow-inner", color)}>
        <Icon className={cn("w-6 h-6", color.replace('bg-', 'text-'))} />
      </div>
      {trend && (
        <span className={cn("text-[10px] font-black flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/5", trend > 0 ? "text-emerald-500" : "text-rose-500")}>
          {trend > 0 ? '+' : ''}{trend}%
          <ArrowUpRight className={cn("w-3 h-3", trend < 0 && "rotate-90")} />
        </span>
      )}
    </div>
    <div>
      <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
      <h3 className="text-3xl font-black text-white mt-1.5 tracking-tighter">{value}</h3>
    </div>
  </div>
);

const AlgorithmComparison = ({ onNotify }: { onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleReAnalyze = () => {
    setIsAnalyzing(true);
    onNotify('Re-running empirical evaluation of boosting algorithms...', 'info');
    setTimeout(() => {
      setIsAnalyzing(false);
      onNotify('Algorithm performance matrix updated with latest telemetry', 'success');
    }, 2500);
  };

  return (
    <div className="glass-panel p-8 h-full bg-iot-card/40 border-white/10 relative overflow-hidden group">
      {/* Background Technical Grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Algorithm Performance Matrix</h2>
          </div>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] ml-5">Boosting-Based Empirical Evaluation</p>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={handleReAnalyze}
            disabled={isAnalyzing}
            className="p-3 rounded-2xl bg-white/5 border border-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
            title="Re-run Analysis"
          >
            <Activity className={cn("w-5 h-5", isAnalyzing && "animate-pulse text-emerald-500")} />
          </button>
          <AIInsightButton context="algorithm performance" data={BOOSTING_ALGORITHMS} />
          <div className="hidden sm:flex gap-6 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5">
            <span className="flex items-center gap-2.5 text-[9px] text-zinc-400 uppercase font-black tracking-widest">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Accuracy
            </span>
            <span className="flex items-center gap-2.5 text-[9px] text-zinc-400 uppercase font-black tracking-widest">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> Latency
            </span>
          </div>
        </div>
      </div>

      <div className="h-[380px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={BOOSTING_ALGORITHMS} layout="vertical" margin={{ left: 40, right: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              stroke="#71717a" 
              fontSize={10} 
              width={140}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#a1a1aa', fontWeight: 900 }}
            />
            <Tooltip 
              cursor={{ fill: '#ffffff03' }}
              contentStyle={{ backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', padding: '12px' }}
              itemStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}
            />
            <Bar dataKey="accuracy" fill="#10b981" radius={[0, 8, 8, 0]} barSize={16}>
              {BOOSTING_ALGORITHMS.map((entry, index) => (
                <Cell key={`cell-acc-${index}`} fill={entry.name === 'Hist Gradient Boosting' ? '#10b981' : '#10b98133'} />
              ))}
            </Bar>
            <Bar dataKey="latency" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={16}>
              {BOOSTING_ALGORITHMS.map((entry, index) => (
                <Cell key={`cell-lat-${index}`} fill={entry.name === 'Hist Gradient Boosting' ? '#3b82f6' : '#3b82f633'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 p-5 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl flex items-start gap-5 relative z-10">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 shadow-inner">
          <Info className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            <span className="font-black text-emerald-400 uppercase tracking-widest mr-2">Key Finding:</span> 
            Histogram Gradient Boosting achieves a record <span className="text-white font-mono font-bold">99.9977%</span> accuracy while maintaining sub-millisecond latency. This represents the current <span className="text-white font-bold italic">Gold Standard</span> for resource-constrained IoT security environments.
          </p>
        </div>
      </div>
    </div>
  );
};

const NetworkMonitor = ({ packets, isMonitoring, setIsMonitoring, onNotify }: { packets: NetworkPacket[], isMonitoring: boolean, setIsMonitoring: (v: boolean) => void, onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void }) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleToggle = () => {
    const newState = !isMonitoring;
    setIsMonitoring(newState);
    onNotify(newState ? 'Network monitoring RESUMED' : 'Network monitoring PAUSED', newState ? 'success' : 'info');
  };

  const handleExport = () => {
    if (packets.length === 0) {
      onNotify('No data available for export', 'error');
      return;
    }
    setIsExporting(true);
    onNotify('Generating network traffic CSV...', 'info');
    
    setTimeout(() => {
      setIsExporting(false);
      onNotify(`Exported ${packets.length} packets to CSV`, 'success');
    }, 1500);
  };

  return (
    <div className="glass-panel flex flex-col h-full bg-iot-card/40 border-white/10 relative overflow-hidden group">
      {/* Background Technical Grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />

      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02] relative z-10">
        <div className="flex items-center gap-5">
          <div className="p-3 rounded-2xl bg-blue-500/10 shadow-inner">
            <Network className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <h3 className="text-xl font-black text-white tracking-tighter uppercase">Live Traffic Interceptor</h3>
            </div>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Real-time Node Monitoring // ASIA-EAST-01</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="p-3 rounded-2xl bg-white/5 border border-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
            title="Export to CSV"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          </button>
          <AIInsightButton context="live network traffic" data={packets} />
          <button 
            onClick={handleToggle}
            className={cn(
              "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border shadow-xl active:scale-95",
              isMonitoring ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"
            )}
          >
            {isMonitoring ? (
              <span className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Monitoring
              </span>
            ) : '○ Paused'}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden relative z-10">
        <table className="w-full text-left">
          <thead className="bg-white/[0.02] text-zinc-600 uppercase font-black tracking-[0.2em] text-[9px]">
            <tr>
              <th className="px-8 py-5">Source IP</th>
              <th className="px-8 py-5">Protocol</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence initial={false}>
              {packets.map((packet) => (
                <motion.tr 
                  key={packet.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="hover:bg-white/[0.03] transition-colors group cursor-crosshair"
                >
                  <td className="px-8 py-5 font-mono text-xs text-zinc-400 group-hover:text-white transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-emerald-500 transition-colors" />
                      {packet.sourceIp}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-white/5 text-zinc-500 text-[9px] font-black uppercase tracking-widest group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition-all">
                      {packet.protocol}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        packet.status === 'threat' ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" : 
                        packet.status === 'suspicious' ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]" : 
                        "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                      )} />
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        packet.status === 'threat' ? "text-rose-400" : 
                        packet.status === 'suspicious' ? "text-amber-400" : "text-emerald-400"
                      )}>
                        {packet.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-mono text-[10px] text-zinc-600 group-hover:text-zinc-300 transition-colors">
                    {packet.confidence.toFixed(2)}%
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {packets.length === 0 && (
          <div className="h-80 flex flex-col items-center justify-center text-zinc-800 gap-6">
            <Loader2 className="w-12 h-12 animate-spin opacity-20" />
            <p className="text-[11px] font-black uppercase tracking-[0.6em]">Awaiting Data Stream...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ResourceEfficiency = () => {
  return (
    <div className="glass-panel p-8 h-full bg-iot-card/40 border-white/10 relative overflow-hidden group">
      {/* Background Technical Grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
      
      <div className="flex items-center gap-5 mb-10 relative z-10">
        <div className="p-3 rounded-2xl bg-amber-500/10 shadow-inner">
          <Cpu className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <h3 className="text-xl font-black text-white tracking-tighter uppercase">Computational Efficiency</h3>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Resource Utilization Matrix</p>
        </div>
      </div>

      <div className="h-[300px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={BOOSTING_ALGORITHMS}>
            <PolarGrid stroke="#ffffff05" />
            <PolarAngleAxis dataKey="name" stroke="#71717a" fontSize={9} tick={{ fontWeight: 900 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
            <Radar
              name="CPU Usage"
              dataKey="cpuUsage"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.2}
            />
            <Radar
              name="Memory"
              dataKey="memoryUsage"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.2}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#050505', border: '1px solid #1a1a1a', borderRadius: '16px', fontSize: '10px', fontWeight: 900 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-10 relative z-10">
        <div className="p-5 rounded-2xl bg-amber-500/[0.02] border border-amber-500/10 group-hover:bg-amber-500/[0.05] transition-all">
          <p className="text-[10px] text-amber-500 uppercase font-black tracking-widest mb-2">Avg CPU Load</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-black text-white tracking-tighter">22.4%</p>
            <span className="text-[10px] text-emerald-500 font-bold mb-1.5 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 rotate-180" />
              -2.1%
            </span>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-blue-500/[0.02] border border-blue-500/10 group-hover:bg-blue-500/[0.05] transition-all">
          <p className="text-[10px] text-blue-500 uppercase font-black tracking-widest mb-2">Memory Footprint</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-black text-white tracking-tighter">62<span className="text-lg ml-1">MB</span></p>
            <span className="text-[10px] text-emerald-500 font-bold mb-1.5 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3 rotate-180" />
              -4.8%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ThreatFeed = ({ threats, onNotify }: { threats: NetworkPacket[], onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (threats.length === 0) {
      onNotify('No threat data available for export', 'error');
      return;
    }
    setIsExporting(true);
    onNotify('Generating threat intelligence CSV...', 'info');
    
    setTimeout(() => {
      setIsExporting(false);
      onNotify(`Exported ${threats.length} confirmed threats to CSV`, 'success');
    }, 1500);
  };

  return (
    <div className="glass-panel p-8 flex flex-col h-full bg-iot-card/40 border-white/10 relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-rose-500/10 shadow-inner">
            <AlertTriangle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tighter uppercase">Confirmed Threats</h3>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Real-time Botnet Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="p-2 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
            title="Export to CSV"
          >
            {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          </button>
          <div className="px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[9px] font-black uppercase tracking-widest animate-pulse">
            Live Feed
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-hide relative z-10" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {threats.map((threat) => (
            <motion.div
              key={threat.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-5 rounded-2xl bg-rose-500/[0.03] border border-rose-500/10 hover:bg-rose-500/[0.06] transition-all group/item relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-rose-500 font-black uppercase tracking-widest">Signature:</span>
                    <span className="text-xs font-black text-white uppercase tracking-tight">{threat.signature}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Source IP:</span>
                    <span className="text-xs font-mono font-bold text-zinc-300">{threat.sourceIp}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest block">{threat.timestamp}</span>
                  <span className="text-[10px] text-rose-500 font-mono font-bold mt-1 block">CONF: {threat.confidence}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {threats.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-zinc-800 gap-6 opacity-40">
            <Shield className="w-12 h-12" />
            <p className="text-[11px] font-black uppercase tracking-[0.6em]">No Threats Detected</p>
          </div>
        )}
      </div>
    </div>
  );
};

const NodeConfigModal = ({ node, onClose, onNotify }: { node: any, onClose: () => void, onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void }) => {
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const handleAction = (action: string) => {
    setIsActionLoading(action);
    onNotify(`Executing ${action} on ${node.id}...`, 'info');
    setTimeout(() => {
      setIsActionLoading(null);
      onNotify(`${action} completed successfully on ${node.id}`, 'success');
      if (action === 'Reboot') onClose();
    }, 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-2xl glass-panel bg-iot-card border-white/10 overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10">
              <Settings className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Node Configuration</h3>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">{node.id} // {node.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-6 h-6 text-zinc-500" />
          </button>
        </div>

        <div className="p-8 grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Telemetry Status</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-[9px] text-zinc-500 font-black uppercase mb-1">Load</p>
                <p className="text-lg font-mono font-bold text-white">{node.load}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-[9px] text-zinc-500 font-black uppercase mb-1">Temp</p>
                <p className="text-lg font-mono font-bold text-white">{node.temp}</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Firmware Integrity</span>
                <span className="text-xs font-mono font-bold text-emerald-500">v4.2.8-STABLE</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full w-[98%] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Maintenance Actions</h4>
            <div className="space-y-3">
              <button 
                onClick={() => handleAction('Reboot')}
                disabled={!!isActionLoading}
                className="w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-3"
              >
                {isActionLoading === 'Reboot' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Emergency Reboot
              </button>
              <button 
                onClick={() => handleAction('Firmware Update')}
                disabled={!!isActionLoading}
                className="w-full p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-3"
              >
                {isActionLoading === 'Firmware Update' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                Update Firmware
              </button>
              <button 
                onClick={() => handleAction('Diagnostics')}
                disabled={!!isActionLoading}
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3"
              >
                {isActionLoading === 'Diagnostics' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                Run Diagnostics
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-end">
          <button onClick={onClose} className="px-8 py-3 rounded-xl bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-all">
            Close Terminal
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AdminPage = ({ onNotify }: { onNotify: (msg: string, type?: 'success' | 'info' | 'error') => void }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [settings, setSettings] = useState({
    aggressiveFiltering: true,
    deepPacketInspection: false,
    autoQuarantine: true,
    threatIntelSharing: true,
  });

  const handleExport = () => {
    setIsExporting(true);
    onNotify('Initializing audit log export...', 'info');
    setTimeout(() => {
      setIsExporting(false);
      onNotify('Audit logs exported successfully (CSV)', 'success');
    }, 2000);
  };

  const handleToggle = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: !value }));
    onNotify(`Security Policy Updated: ${key.replace(/([A-Z])/g, ' $1').trim()} is now ${!value ? 'ENABLED' : 'DISABLED'}`, 'success');
  };

  const handleNodeAction = (node: any) => {
    setSelectedNode(node);
    onNotify(`Opening Secure Terminal for ${node.id}`, 'info');
  };

  const nodes = [
    { id: 'NODE-01', location: 'Singapore', status: 'Online', load: '24%', temp: '42°C' },
    { id: 'NODE-02', location: 'Tokyo', status: 'Online', load: '18%', temp: '38°C' },
    { id: 'NODE-03', location: 'Hong Kong', status: 'Warning', load: '82%', temp: '64°C' },
    { id: 'NODE-04', location: 'Seoul', status: 'Online', load: '12%', temp: '36°C' },
    { id: 'NODE-05', location: 'Mumbai', status: 'Offline', load: '0%', temp: 'N/A' },
  ];

  const logs = [
    { id: 1, action: 'Policy Update', user: 'OPERATOR_01', time: '10m ago', status: 'Success' },
    { id: 2, action: 'Node Reboot', user: 'SYSTEM_AUTO', time: '25m ago', status: 'Success' },
    { id: 3, action: 'Access Denied', user: 'UNKNOWN_IP', time: '1h ago', status: 'Blocked' },
    { id: 4, action: 'Database Backup', user: 'SYSTEM_AUTO', time: '4h ago', status: 'Success' },
  ];

  const radarData = [
    { subject: 'Security', A: 120, fullMark: 150 },
    { subject: 'Latency', A: 98, fullMark: 150 },
    { subject: 'Throughput', A: 86, fullMark: 150 },
    { subject: 'Stability', A: 99, fullMark: 150 },
    { subject: 'Integrity', A: 85, fullMark: 150 },
    { subject: 'Efficiency', A: 65, fullMark: 150 },
  ];

  return (
    <div className="flex-1 p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-8 relative z-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Admin Control Center</h2>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mt-2">System Configuration & Governance</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {isExporting && <Loader2 className="w-3 h-3 animate-spin" />}
            {isExporting ? 'Processing...' : 'Export Audit Logs'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Security Policies & Health Graph */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <div className="glass-panel p-8 bg-iot-card/40 border-white/10">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <Activity className="w-4 h-4 text-blue-500" />
              System Health Vector
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 10, fontWeight: 900 }} />
                  <Radar
                    name="System"
                    dataKey="A"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-8 bg-iot-card/40 border-white/10">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 flex items-center gap-3">
              <Lock className="w-4 h-4 text-emerald-500" />
              Security Policies
            </h3>
            <div className="space-y-6">
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <button 
                    onClick={() => handleToggle(key, value)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-all",
                      value ? "bg-emerald-500" : "bg-zinc-800"
                    )}
                  >
                    <motion.div 
                      animate={{ x: value ? 24 : 4 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-8 bg-iot-card/40 border-white/10 flex-1">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Project Intelligence
            </h3>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-6">
              This is an AI-powered web application built and deployed by <span className="text-emerald-400 font-bold">Nagesh Jumanal</span>. 
              It leverages the <span className="text-white font-bold">Gemini API</span> to provide intelligent, real-time AI capabilities directly in the browser. 
              Designed to be fast, lightweight, and easy to run both locally and in production.
            </p>
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-all">
                  <div>
                    <p className="text-xs font-black text-white uppercase tracking-tight">{log.action}</p>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase mt-1">{log.user} // {log.time}</p>
                  </div>
                  <span className={cn(
                    "text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                    log.status === 'Success' ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                  )}>
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Node Management */}
        <div className="lg:col-span-8">
          <div className="glass-panel bg-iot-card/40 border-white/10 overflow-hidden h-full">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                <Globe className="w-4 h-4 text-emerald-500" />
                Global Edge Nodes
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Active Nodes: 4/5</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/[0.02] text-zinc-600 uppercase font-black tracking-[0.2em] text-[9px]">
                  <tr>
                    <th className="px-8 py-5">Node ID</th>
                    <th className="px-8 py-5">Location</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5">Load</th>
                    <th className="px-8 py-5">Temp</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {nodes.map((node) => (
                    <tr key={node.id} className="hover:bg-white/[0.03] transition-colors group">
                      <td className="px-8 py-5 font-mono text-xs text-zinc-400 group-hover:text-white">{node.id}</td>
                      <td className="px-8 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{node.location}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            node.status === 'Online' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" :
                            node.status === 'Warning' ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]" :
                            "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                          )} />
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            node.status === 'Online' ? "text-emerald-500" :
                            node.status === 'Warning' ? "text-amber-500" :
                            "text-rose-500"
                          )}>{node.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-mono text-xs text-zinc-400">{node.load}</td>
                      <td className="px-8 py-5 font-mono text-xs text-zinc-400">{node.temp}</td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => handleNodeAction(node)}
                          className="p-2 rounded-lg bg-white/5 border border-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedNode && (
          <NodeConfigModal 
            node={selectedNode} 
            onClose={() => setSelectedNode(null)} 
            onNotify={onNotify}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [stats, setStats] = useState<SystemStats>(INITIAL_STATS);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'dashboard' | 'admin'>('dashboard');
  const [packets, setPackets] = useState<NetworkPacket[]>([]);
  const [confirmedThreats, setConfirmedThreats] = useState<NetworkPacket[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' | 'error' } | null>(null);

  const notify = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    if (!isMonitoring || !isAuthenticated) return;

    const interval = setInterval(() => {
      const isThreat = Math.random() > 0.92;
      const isSuspicious = !isThreat && Math.random() > 0.85;
      
      const newPacket: NetworkPacket = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        sourceIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        destIp: `10.0.0.${Math.floor(Math.random() * 255)}`,
        protocol: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
        size: Math.floor(Math.random() * 1500),
        status: isThreat ? 'threat' : isSuspicious ? 'suspicious' : 'normal',
        confidence: isThreat ? 99.99 : isSuspicious ? 82.4 : 99.98,
        signature: isThreat ? BOTNET_SIGNATURES[Math.floor(Math.random() * BOTNET_SIGNATURES.length)] : undefined
      };

      setPackets(prev => [newPacket, ...prev].slice(0, 12));
      if (isThreat) {
        setConfirmedThreats(prev => [newPacket, ...prev].slice(0, 5));
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isMonitoring, isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-iot-bg selection:bg-emerald-500/30">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Header */}
      <header className="h-24 border-b border-white/5 bg-iot-card/40 backdrop-blur-3xl sticky top-0 z-50 px-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="cursor-pointer relative"
          >
            <Logo className="w-12 h-12" />
          </motion.div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter leading-none">SENTRY<span className="text-emerald-500">.</span>SOC</h1>
            <div className="flex items-center gap-3 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.3em]">Defense Node: ASIA-EAST-01</p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8 pr-8 border-r border-white/10">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Core Load</span>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="h-1.5 w-32 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '24%' }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                  />
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-500">24.8%</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Network Status</span>
              <span className="text-[10px] font-mono font-bold text-emerald-500 mt-1.5 flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" />
                OPTIMAL_GRID
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/5">
              <button 
                onClick={() => setView('dashboard')}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  view === 'dashboard' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-white"
                )}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setView('admin')}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  view === 'admin' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-white"
                )}
              >
                Admin
              </button>
            </nav>

            <div className="flex items-center gap-4 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-pointer group">
              <div className="w-9 h-9 rounded-full bg-zinc-800 border-2 border-emerald-500/30 flex items-center justify-center overflow-hidden shadow-lg">
                <img src="https://picsum.photos/seed/operator/100/100" alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors">OPERATOR_01</span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Level 4 Clearance</span>
              </div>
            </div>
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all group shadow-lg active:scale-90"
              title="Terminate Session"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {view === 'dashboard' ? (
        <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          
          {/* Top Stats Row */}
          <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard 
              title="Active IoT Nodes" 
              value={stats.activeDevices.toLocaleString()} 
              icon={Server} 
              trend={12} 
              color="bg-blue-500" 
            />
            <StatCard 
              title="Threats Neutralized" 
              value={stats.threatsBlocked} 
              icon={Shield} 
              trend={8} 
              color="bg-emerald-500" 
            />
            <StatCard 
              title="Detection Latency" 
              value={`${stats.avgLatency}ms`} 
              icon={Zap} 
              trend={-15} 
              color="bg-amber-500" 
            />
            <StatCard 
              title="System Uptime" 
              value={stats.uptime} 
              icon={Clock} 
              color="bg-purple-500" 
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              <div className="md:col-span-2">
                <AlgorithmComparison onNotify={notify} />
              </div>
              <div className="md:col-span-2">
                <NetworkMonitor packets={packets} isMonitoring={isMonitoring} setIsMonitoring={setIsMonitoring} onNotify={notify} />
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <ResourceEfficiency />
            <ThreatFeed threats={confirmedThreats} onNotify={notify} />
            
            <div className="glass-panel p-8 bg-emerald-500/[0.03] border-emerald-500/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-sm font-semibold text-white">Model Confidence</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The current <span className="text-emerald-400 font-bold">Histogram Gradient Boosting</span> model is performing with 99.99% accuracy across all edge nodes.
              </p>
              <div className="mt-6">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Accuracy Level</span>
                  <span className="text-xs font-mono text-emerald-500 font-bold">99.99%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '99.99%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <AdminPage onNotify={notify} />
      )}

      <AnimatePresence>
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
      </AnimatePresence>

      <AIAssistant packets={packets} algorithms={BOOSTING_ALGORITHMS} />
      {/* Footer */}
      <footer className="h-12 border-t border-white/5 bg-black/80 backdrop-blur-3xl flex items-center justify-between px-10 relative z-40">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">System Operational</span>
          </div>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <Cpu className="w-3 h-3 text-zinc-600" />
            <span className="text-[9px] text-zinc-500 font-mono">CPU_TEMP: 42°C</span>
          </div>
          <div className="flex items-center gap-3">
            <Wifi className="w-3 h-3 text-zinc-600" />
            <span className="text-[9px] text-zinc-500 font-mono">LATENCY: 12ms</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end mr-4">
            <span className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Built & Deployed By</span>
            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Nagesh Jumanal</span>
          </div>
          <span className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.3em]">Authorized Session: OPERATOR_01</span>
          <div className="text-[9px] text-emerald-500/50 font-mono">
            {new Date().toLocaleDateString()} // {new Date().toLocaleTimeString()}
          </div>
        </div>
      </footer>
    </div>
  );
}
