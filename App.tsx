import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  Settings, 
  Plus, 
  Bell, 
  X, 
  Leaf,
  Calendar,
  Trash2,
  Clock,
  ChevronRight,
  ChevronLeft,
  Sun,
  Home,
  ExternalLink,
  Download,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Loader2,
  MessageSquare,
  Send,
  Camera,
  Activity,
  FileText,
  Printer,
  FileSpreadsheet,
  HelpCircle,
  Heart,
  Info,
  ShieldCheck,
  Repeat,
  Upload,
  Smartphone,
  Laptop,
  BarChart3,
  History,
  ClipboardList,
  Share2,
  Link as LinkIcon,
  Copy,
  Check,
  Globe,
  Bot,
  Image as ImageIcon,
  Zap,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { ViewState, Garden, Notification, GardenType, Plant, LifecycleStage, GrowthProjection, GardenNote } from './types.ts';
import { predictGrowthTimeline, getSystemAnalysis } from './services/geminiService.ts';
import { GoogleGenAI } from "@google/genai";

// Define Gemini interfaces locally to avoid export issues
interface PartBlob {
  data: string;
  mimeType: string;
}

// --- Shared UI Components ---

const Card = ({ children, className = "", onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", type = "button", disabled = false }: any) => {
  const variants: any = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-100 disabled:opacity-50",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
  };
  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled} 
      className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// --- Helper Functions ---
const calculateAge = (date: string) => {
  const start = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
};

// --- Audio Helpers for Live API ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function createBlob(data: Float32Array): PartBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- Dashboard View ---

const DashboardView = ({ gardens, systemAnalysis, setView, onGardenSelect, onExportPDF, onExportExcel, onShareApp }: any) => {
  const allPlants = gardens.flatMap((g: Garden) => g.plants);
  const totalPlants = allPlants.length;
  
  const avgAge = totalPlants > 0 
    ? Math.round(allPlants.reduce((acc: number, p: Plant) => acc + calculateAge(p.plantedDate), 0) / totalPlants) 
    : 0;
  
  const stageCounts = allPlants.reduce((acc: any, p: Plant) => {
    acc[p.stage] = (acc[p.stage] || 0) + 1;
    return acc;
  }, {});

  const floweringCount = stageCounts['Flowering'] || 0;
  const germinationCount = stageCounts['Germination'] || 0;

  const latestNotes = gardens
    .flatMap((g: Garden) => g.plants.flatMap((p: Plant) => p.notes.map(n => ({ ...n, plantName: p.name }))))
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-emerald-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
        <Leaf className="absolute -bottom-6 -right-6 w-32 h-32 text-emerald-500/20 rotate-12" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black bg-emerald-500 text-white">
                G
             </div>
             <span className="font-bold text-emerald-100 uppercase tracking-widest text-[10px]">Grower Mode Active</span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-black mb-2 tracking-tight">Growth Dashboard</h2>
              <p className="text-emerald-50/90 font-medium italic text-lg opacity-80">"Track your growing Journey effortlessly."</p>
            </div>
            <button 
              onClick={onShareApp}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all border border-white/10 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
              title="Share App"
            >
              <Globe size={16} /> Share Tool
            </button>
          </div>
          
          <div className="flex gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl">
              <p className="text-[10px] font-black uppercase text-emerald-200">Gardens</p>
              <p className="text-2xl font-black">{gardens.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl">
              <p className="text-[10px] font-black uppercase text-emerald-200">Total Specimens</p>
              <p className="text-2xl font-black">{totalPlants}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Gemini System Analysis Card --- */}
      <Card className="bg-slate-900 border-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Zap size={120} className="text-emerald-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-400 border border-emerald-500/30 shrink-0">
            <Bot size={40} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Gemini AI</span>
              <h3 className="text-lg font-black text-white">System Insight Analysis</h3>
            </div>
            <p className="text-emerald-100/70 text-sm leading-relaxed max-w-2xl italic">
              {systemAnalysis ? `"${systemAnalysis}"` : "Initializing global garden health scan... Gemini is analyzing your current specimen directory."}
            </p>
          </div>
        </div>
      </Card>

      {/* --- Operations Summary Card --- */}
      <Card className="border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="text-emerald-600" size={24} />
              <h3 className="text-xl font-black text-slate-800">Operations Summary</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Status</p>
                <p className="text-lg font-black text-emerald-600">{totalPlants > 0 ? 'Active' : 'Standby'}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Flowering</p>
                <p className="text-lg font-black text-blue-600">{floweringCount}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">New Seeds</p>
                <p className="text-lg font-black text-amber-500">{germinationCount}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Avg Age</p>
                <p className="text-lg font-black text-slate-700">{avgAge}d</p>
              </div>
            </div>
          </div>
          <div className="lg:w-72 space-y-3">
            <Button onClick={onExportPDF} className="w-full py-4 shadow-xl">
              <Printer size={18} /><span>Generate PDF Report</span>
            </Button>
            <Button onClick={onExportExcel} variant="outline" className="w-full py-4 bg-white border-emerald-100 text-emerald-600">
              <FileSpreadsheet size={18} /><span>Export History (CSV)</span>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
          <Card className="bg-slate-900 text-white">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={20} className="text-emerald-400" />
              <h3 className="text-lg font-black uppercase tracking-tight">Growth Analytics</h3>
            </div>
            <div className="space-y-4">
              <div className="pt-2">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Phase Distribution</p>
                <div className="space-y-2">
                  {Object.entries(stageCounts).map(([stage, count]: any) => (
                    <div key={stage} className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${(count / totalPlants) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 w-16 truncate">{stage}</span>
                      <span className="text-[10px] font-black text-white">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <History size={18} className="text-emerald-600" /> Recent Activity
              </h3>
            </div>
            <div className="space-y-4">
              {latestNotes.map((note: any) => (
                <div key={note.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black text-emerald-600 uppercase truncate max-w-[120px]">{note.plantName}</span>
                    <span className="text-[9px] text-slate-400">{note.date.split(',')[0]}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed italic">"{note.content}"</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800">Your Gardens</h3>
              <button onClick={() => setView('gardens')} className="text-emerald-600 text-xs font-black uppercase hover:underline">Manage All</button>
            </div>
            <div className="space-y-4">
              {gardens.slice(0, 4).map((g: Garden) => (
                <button key={g.id} onClick={() => onGardenSelect(g.id)} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all text-left outline-none group">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${g.type === 'Indoor' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                      {g.type === 'Indoor' ? <Home size={18} /> : <Sun size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{g.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase">{g.plants?.length || 0} Specimens</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  
  const [gardens, setGardens] = useState<Garden[]>(() => {
    try {
      const saved = localStorage.getItem('hydro_gardens_single_user');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return [];
  });

  const [systemAnalysis, setSystemAnalysis] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [isPlantDetailOpen, setIsPlantDetailOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<Garden[] | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  
  const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [editingGarden, setEditingGarden] = useState<Garden | null>(null);
  const [plantDetailTab, setPlantDetailTab] = useState<'overview' | 'notes'>('overview');
  const [newNoteText, setNewNoteText] = useState('');

  // AI Assistant state
  const [assistantMessage, setAssistantMessage] = useState('');
  const [assistantResponse, setAssistantResponse] = useState<string | null>(null);
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [assistantImage, setAssistantImage] = useState<string | null>(null);
  const [isAssistantScanning, setIsAssistantScanning] = useState(false);

  // Gemini Live state
  const [isLiveActive, setIsLiveActive] = useState(false);
  const liveSessionRef = useRef<any>(null);
  const liveAudioContextRef = useRef<AudioContext | null>(null);
  const liveOutputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const assistantFileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedGarden = gardens.find(g => g.id === selectedGardenId);
  const inspectedPlant = selectedGarden?.plants.find(p => p.id === selectedPlantId);

  // Persistence & URL Import Handling
  useEffect(() => {
    localStorage.setItem('hydro_gardens_single_user', JSON.stringify(gardens));
    if (gardens.length > 0 && view === 'dashboard') {
      triggerSystemAnalysis();
    }
  }, [gardens]);

  const triggerSystemAnalysis = async () => {
    const analysis = await getSystemAnalysis(gardens);
    if (analysis) setSystemAnalysis(analysis);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('workspace');
    if (sharedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(sharedData)));
        if (Array.isArray(decoded)) {
          setPendingImportData(decoded);
          setIsImportModalOpen(true);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error("Failed to decode shared workspace:", err);
      }
    }
  }, []);

  const handleGardenSelect = (id: string) => {
    setSelectedGardenId(id);
    setView('gardens');
  };

  // --- Gemini Live Session Management ---
  const toggleLiveAssistant = async () => {
    if (isLiveActive) {
      // Shutdown session
      if (liveSessionRef.current) liveSessionRef.current.close();
      if (liveAudioContextRef.current) liveAudioContextRef.current.close();
      if (liveOutputAudioContextRef.current) liveOutputAudioContextRef.current.close();
      setIsLiveActive(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      liveAudioContextRef.current = inputCtx;
      liveOutputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: any) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach(s => s.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => console.error("Live AI Error:", e),
          onclose: () => setIsLiveActive(false),
        },
        config: {
          responseModalities: ['AUDIO' as any],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `You are an expert hydroponics and aquaponics voice assistant named Gemini. 
          Help the user manage their garden: "${selectedGarden?.name}". 
          The user has ${selectedGarden?.plants?.length || 0} plants.
          Keep responses concise and spoken-friendly.`
        }
      });

      sessionPromise.then(session => { liveSessionRef.current = session; });
      setIsLiveActive(true);
    } catch (err) {
      console.error(err);
      alert("Microphone access failed. Voice AI requires audio permissions.");
    }
  };

  const handleShareWorkspace = () => {
    try {
      const json = JSON.stringify(gardens);
      const encoded = btoa(encodeURIComponent(json));
      const shareUrl = `${window.location.origin}${window.location.pathname}?workspace=${encoded}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopyFeedback("Workspace link copied to clipboard!");
        setTimeout(() => setCopyFeedback(null), 3000);
      });
    } catch (err) {
      alert("Failed to generate share link.");
    }
  };

  const handleShareApp = () => {
    const appUrl = `${window.location.origin}${window.location.pathname}`;
    navigator.clipboard.writeText(appUrl).then(() => {
      setCopyFeedback("App link copied to clipboard!");
      setTimeout(() => setCopyFeedback(null), 3000);
    });
  };

  const handleImportWorkspace = (merge: boolean) => {
    if (!pendingImportData) return;
    if (merge) setGardens(prev => [...prev, ...pendingImportData]);
    else setGardens(pendingImportData);
    setIsImportModalOpen(false);
    setPendingImportData(null);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const summaryHtml = `<html><body><h1>Report</h1>${gardens.map(g => `<div>${g.name}</div>`).join('')}</body></html>`;
    printWindow.document.write(summaryHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportExcel = () => {
    const csvContent = "Garden Name,Plant Name\n" + gardens.flatMap(g => g.plants.map(p => `${g.name},${p.name}`)).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hydrogrow_report.csv";
    link.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setGardens(json);
      } catch (err) { alert("Import failed."); }
    };
    reader.readAsText(file);
  };

  const saveGarden = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = (f.elements.namedItem('gname') as HTMLInputElement).value;
    const type = (f.elements.namedItem('gtype') as HTMLSelectElement).value as GardenType;
    const startedDate = (f.elements.namedItem('gdate') as HTMLInputElement).value;

    if (editingGarden) {
      setGardens(prev => prev.map(g => g.id === editingGarden.id ? { ...g, name, type, startedDate } : g));
    } else {
      setGardens(prev => [...prev, { id: Date.now().toString(), name, type, startedDate, description: "", plants: [], notes: [] }]);
    }
    setIsModalOpen(false);
    setEditingGarden(null);
  };

  const savePlant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGardenId) return;
    const f = e.currentTarget;
    const name = (f.elements.namedItem('pname') as HTMLInputElement).value;
    const variety = (f.elements.namedItem('pvariety') as HTMLInputElement).value;
    const plantedDate = (f.elements.namedItem('pdate') as HTMLInputElement).value;
    setIsAiLoading(true);
    const projection = await predictGrowthTimeline(name, variety, plantedDate);
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g, plants: [...g.plants, { id: Date.now().toString(), name, variety, plantedDate, stage: 'Germination', harvests: [], projection: projection || undefined, notes: [] }]
    } : g));
    setIsAiLoading(false);
    setIsPlantModalOpen(false);
  };

  const addPlantNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGardenId || !selectedPlantId || !newNoteText.trim()) return;
    submitNote(newNoteText.trim());
    setNewNoteText('');
  };

  const submitNote = (content: string) => {
    const newNote = { id: Date.now().toString(), date: new Date().toLocaleString(), content };
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g, plants: g.plants.map(p => p.id === selectedPlantId ? { ...p, notes: [newNote, ...p.notes] } : p)
    } : g));
  };

  const handleAiScan = async () => {
    if (!selectedGardenId || !selectedPlantId) return;
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d')?.drawImage(video, 0, 0);
          const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
          stream.getTracks().forEach(track => track.stop());
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ inlineData: { data: base64Image, mimeType: 'image/jpeg' } }, { text: `Health scan for ${inspectedPlant?.name}.` }] }
          });
          submitNote(`🤖 Gemini Scan: ${response.text}`);
        }
      }
    } finally { setIsScanning(false); }
  };

  const handleAssistantAsk = async () => {
    if (!assistantMessage.trim() && !assistantImage) return;
    setIsAssistantLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const parts: any[] = [{ text: `Expert advice for ${selectedGarden?.name}. Q: ${assistantMessage}` }];
      if (assistantImage) parts.push({ inlineData: { data: assistantImage.split(',')[1], mimeType: 'image/jpeg' } });
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: { parts } });
      setAssistantResponse(response.text || "No response.");
    } finally { setIsAssistantLoading(false); }
  };

  const handleAssistantSnapPhoto = async () => {
    setIsAssistantScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d')?.drawImage(video, 0, 0);
          setAssistantImage(canvas.toDataURL('image/jpeg'));
          stream.getTracks().forEach(track => track.stop());
        }
      }
    } finally { setIsAssistantScanning(false); }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
      <input type="file" ref={fileInputRef} onChange={handleImportData} accept=".json" className="hidden" />
      <input type="file" ref={assistantFileInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setAssistantImage(ev.target?.result as string);
          reader.readAsDataURL(file);
        }
      }} accept="image/*" className="hidden" />

      {/* --- Sidebar --- */}
      <nav className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col p-4 md:p-6 space-y-8 z-50">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Sprout size={24} />
          </div>
          <span className="text-xl font-black text-emerald-600 hidden md:block tracking-tight">HydroGrow</span>
        </div>
        
        <div className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'gardens', icon: Leaf, label: 'Gardens' },
            { id: 'settings', icon: Settings, label: 'System' }
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id as ViewState); setSelectedGardenId(null); }} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${view === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
              <item.icon size={20} />
              <span className="font-bold hidden md:block">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-32 relative">
        {copyFeedback && (
          <div className="fixed top-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 z-[300]">
            <Check size={18} />
            <span className="font-bold">{copyFeedback}</span>
          </div>
        )}

        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight capitalize">{selectedGarden ? selectedGarden.name : view}</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Your Garden Assistant</p>
          </div>
        </header>

        {view === 'dashboard' && <DashboardView gardens={gardens} systemAnalysis={systemAnalysis} setView={setView} onGardenSelect={handleGardenSelect} onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} onShareApp={handleShareApp} />}

        {view === 'gardens' && !selectedGarden && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gardens.map(g => (
              <Card key={g.id} className="relative group cursor-pointer hover:border-emerald-200 transition-all" onClick={() => handleGardenSelect(g.id)}>
                <div className={`w-12 h-12 mb-4 rounded-2xl flex items-center justify-center ${g.type === 'Indoor' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                  {g.type === 'Indoor' ? <Home size={24} /> : <Sun size={24} />}
                </div>
                <h3 className="text-xl font-bold text-slate-800">{g.name}</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{g.plants?.length || 0} Specimens • {g.type}</p>
              </Card>
            ))}
            <button onClick={() => setIsModalOpen(true)} className="border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-10 text-slate-300 hover:border-emerald-100 transition-all">
              <Plus size={40} className="mb-2" />
              <span className="font-black uppercase tracking-widest text-xs">Establish Garden</span>
            </button>
          </div>
        )}

        {selectedGarden && (
          <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
              <button onClick={() => setSelectedGardenId(null)} className="flex items-center text-slate-400 hover:text-emerald-600 font-bold group">
                <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back
              </button>
              
              {/* --- Gemini Live Voice Toggle --- */}
              <button 
                onClick={toggleLiveAssistant}
                className={`flex items-center gap-3 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all shadow-lg ${isLiveActive ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-900 text-white hover:bg-emerald-600'}`}
              >
                {isLiveActive ? <><MicOff size={16}/> Stop Live Expert</> : <><Mic size={16}/> Talk to Gemini Live</>}
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800">Specimen Directory</h3>
                    <Button onClick={() => setIsPlantModalOpen(true)} variant="outline" className="text-xs py-1.5"><Plus size={16} /><span>Add Specimen</span></Button>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {selectedGarden.plants.map(p => (
                      <div key={p.id} className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 hover:border-emerald-200 transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-5">
                            <div className="w-14 h-14 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm"><Sprout size={28} /></div>
                            <div>
                              <h4 className="font-black text-slate-800 text-lg">{p.name}</h4>
                              <p className="text-xs text-slate-400 font-bold uppercase">{p.variety || 'Heirloom'}</p>
                            </div>
                          </div>
                          <button onClick={() => { setSelectedPlantId(p.id); setIsPlantDetailOpen(true); }} className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg"><ExternalLink size={18} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-100 overflow-hidden relative group">
                  <Zap className="absolute -top-4 -right-4 w-16 h-16 text-emerald-100 rotate-12" />
                  <div className="relative z-10">
                    <h4 className="font-black text-emerald-800 mb-4 flex items-center gap-2">
                      <Bot size={20} className="text-emerald-600" /> Gemini Garden Expert
                    </h4>
                    
                    <div className="space-y-4">
                      {assistantResponse && (
                        <div className="p-4 bg-white/80 rounded-2xl border border-emerald-100 text-xs text-slate-700 leading-relaxed shadow-sm">
                          <div className="font-black text-[9px] uppercase text-emerald-600 mb-1">AI Response</div>
                          {assistantResponse}
                        </div>
                      )}

                      <div className="space-y-2">
                        {assistantImage && (
                          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-2">
                            <img src={assistantImage} className="w-full h-full object-cover" />
                            <button onClick={() => setAssistantImage(null)} className="absolute top-2 right-2 p-1 bg-rose-500 text-white rounded-full"><X size={12} /></button>
                          </div>
                        )}
                        <textarea value={assistantMessage} onChange={(e) => setAssistantMessage(e.target.value)} placeholder="Ask anything..." className="w-full p-4 bg-white border border-emerald-100 rounded-2xl outline-none text-xs font-medium resize-none min-h-[100px]" />
                        <div className="flex gap-2">
                          <button onClick={() => assistantFileInputRef.current?.click()} className="p-3 bg-white text-emerald-600 rounded-xl border border-emerald-100 shadow-sm"><ImageIcon size={20} /></button>
                          <button onClick={handleAssistantSnapPhoto} disabled={isAssistantScanning} className="p-3 bg-white text-emerald-600 rounded-xl border border-emerald-100 shadow-sm"><Camera size={20} /></button>
                          <button onClick={handleAssistantAsk} disabled={isAssistantLoading} className="flex-1 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest">Ask Expert</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-4xl mx-auto py-10 space-y-8 animate-in slide-in-from-bottom-6">
            <Card className="p-8 border-l-8 border-l-emerald-500">
              <div className="flex items-center gap-4 mb-6">
                <ShieldCheck size={28} className="text-emerald-600" />
                <h3 className="text-xl font-black text-slate-800">Your Data is Private</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">All information is stored locally in your browser. AI features process context only when requested.</p>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-8">
                <Share2 size={24} className="text-emerald-600 mb-6" />
                <h3 className="text-xl font-black mb-4">Sharing</h3>
                <Button onClick={handleShareWorkspace} className="w-full">Copy Workspace Link</Button>
              </Card>
              <Card className="p-8">
                <Download size={24} className="text-emerald-600 mb-6" />
                <h3 className="text-xl font-black mb-4">Export</h3>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="w-full">Restore Database</Button>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Modals for Adding Gardens/Plants - Simplified */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10">
              <h3 className="text-3xl font-black mb-10">New Garden</h3>
              <form onSubmit={saveGarden} className="space-y-6">
                 <input name="gname" placeholder="Name" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                 <select name="gtype" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none"><option value="Indoor">Indoor</option><option value="Outdoor">Outdoor</option></select>
                 <input name="gdate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none" />
                 <Button type="submit" className="w-full py-5">Confirm Garden</Button>
              </form>
           </div>
        </div>
      )}

      {isPlantModalOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10">
              <h3 className="text-3xl font-black mb-10">Add Specimen</h3>
              <form onSubmit={savePlant} className="space-y-6">
                 <input name="pname" placeholder="E.g. Basil" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                 <input name="pvariety" placeholder="Variety" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                 <input name="pdate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none" />
                 <Button type="submit" className="w-full py-5" disabled={isAiLoading}>{isAiLoading ? 'Predicting Growth...' : 'Save Specimen'}</Button>
              </form>
           </div>
        </div>
      )}

      {isPlantDetailOpen && inspectedPlant && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[3.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-10 relative">
              <button onClick={() => setIsPlantDetailOpen(false)} className="absolute top-6 right-6 p-3"><X size={24}/></button>
              <h3 className="text-4xl font-black text-slate-800 mb-8">{inspectedPlant.name}</h3>
              <div className="space-y-8">
                <Card className="bg-slate-50">
                  <h4 className="font-black mb-4">Phase: {inspectedPlant.stage}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl">Planted: {inspectedPlant.plantedDate}</div>
                    <div className="p-4 bg-white rounded-2xl">Age: {calculateAge(inspectedPlant.plantedDate)} Days</div>
                  </div>
                </Card>
                <div className="space-y-4">
                  <h4 className="font-black text-lg">Care Logs</h4>
                  {inspectedPlant.notes.map(n => (
                    <div key={n.id} className="p-4 border-l-4 border-emerald-500 bg-emerald-50/20 rounded-r-2xl text-sm italic">"{n.content}" - {n.date}</div>
                  ))}
                  <button onClick={handleAiScan} className="w-full py-4 border-2 border-dashed border-emerald-200 text-emerald-600 font-black rounded-2xl">Gemini Health Scan</button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
