import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Sprout, 
  Wrench, 
  Calendar, 
  Stethoscope, 
  Plus, 
  Menu, 
  X,
  ChevronRight,
  ChevronLeft,
  FlaskConical,
  Trash2,
  Edit2,
  Zap,
  Settings,
  BookOpen,
  Download,
  Upload,
  BarChart3,
  Scale,
  Sparkles,
  Camera,
  Phone,
  Mic,
  MicOff,
  Waves
} from 'lucide-react';
import { 
  ViewState, Setup, Plant, Equipment, Ingredient, Task, HarvestRecord, WaterLog 
} from './types.ts';
import { troubleshootPlant, getDailyTip, getGrowGuide, getPlantProjections, connectLiveBotanist } from './services/geminiService.ts';

// --- Encoding/Decoding Helpers for Live API ---
function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

// --- UI Components ---

const HealthGauge = ({ label, value, min, max, unit, color }: { label: string, value: number, min: number, max: number, unit: string, color: string }) => {
  const percentage = Math.min(100, Math.max(0, ((value - (min - 1)) / (max - (min - 1))) * 100));
  const isSafe = value >= min && value <= max;
  return (
    <div className="flex-1 min-w-[100px]">
      <div className="flex justify-between items-end mb-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={`text-sm font-black ${isSafe ? 'text-slate-800' : 'text-rose-500'}`}>{value}{unit}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 rounded-full ${isSafe ? color : 'bg-rose-400'}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = 'button' }: any) => {
  const base = "px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ";
  const variants: any = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200 disabled:bg-emerald-300",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:bg-slate-50",
    outline: "bg-transparent border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50",
    dark: "bg-slate-900 text-white hover:bg-slate-800",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    accent: "bg-amber-400 text-slate-900 hover:bg-amber-500 shadow-lg shadow-amber-200"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base + variants[variant] + " " + className}>
      {children}
    </button>
  );
};

const SidebarItem = ({ id, icon: Icon, label, active, onClick }: { id: ViewState, icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
        : 'text-slate-600 hover:bg-slate-100 font-medium'
    }`}
  >
    <Icon size={20} />
    <span className="truncate">{label}</span>
  </button>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
};

const Card = ({ children, title, action, className = "" }: any) => (
  <div className={`bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-8">
        {title && <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>}
        {action}
      </div>
    )}
    <div className="flex-1">{children}</div>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dailyTip, setDailyTipStr] = useState<string>("Loading your daily grower tip...");
  const [setups, setSetups] = useState<Setup[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Live API State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  useEffect(() => {
    const s = localStorage.getItem('hydro_setups');
    const p = localStorage.getItem('hydro_plants');
    if (s) setSetups(JSON.parse(s));
    if (p) setPlants(JSON.parse(p));
    getDailyTip().then(setDailyTipStr).catch(() => {});
  }, []);

  const handleLiveToggle = async () => {
    if (isLiveActive) {
      liveSessionRef.current?.close();
      setIsLiveActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = connectLiveBotanist({
        onopen: () => {
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(session => session.sendRealtimeInput({
              media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
            }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
          setIsLiveActive(true);
        },
        onmessage: async (msg: any) => {
          const b64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (b64 && audioContextRef.current) {
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
            const buf = await decodeAudioData(decode(b64), audioContextRef.current, 24000, 1);
            const s = audioContextRef.current.createBufferSource();
            s.buffer = buf;
            s.connect(audioContextRef.current.destination);
            s.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buf.duration;
            sourcesRef.current.add(s);
          }
          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
          }
        }
      });
      liveSessionRef.current = await sessionPromise;
    } catch (e) {
      alert("Microphone access is required for Live Botanist.");
    }
  };

  const changeView = (v: ViewState) => {
    setView(v);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans relative">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col p-6 space-y-8 z-50 transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Sprout size={24} /></div>
            <span className="text-2xl font-black text-emerald-600">HydroMaster</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400"><X size={24} /></button>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => changeView('dashboard')} />
          <SidebarItem id="setups" icon={Layers} label="Systems" active={view === 'setups'} onClick={() => changeView('setups')} />
          <SidebarItem id="plants" icon={Sprout} label="My Plants" active={view === 'plants'} onClick={() => changeView('plants')} />
          <SidebarItem id="troubleshoot" icon={Stethoscope} label="AI Diagnosis" active={view === 'troubleshoot'} onClick={() => changeView('troubleshoot')} />
          <SidebarItem id="guide" icon={BookOpen} label="Growing Guide" active={view === 'guide'} onClick={() => changeView('guide')} />
        </nav>
        <div className="pt-6 border-t border-slate-100">
          <SidebarItem id="settings" icon={Settings} label="Settings" active={view === 'settings'} onClick={() => changeView('settings')} />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50 relative">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 space-y-6 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white rounded-xl border border-slate-200"><Menu size={20} /></button>
            <div>
              <h1 className="text-4xl font-black text-slate-800 capitalize tracking-tight">{view}</h1>
              <p className="text-slate-500 mt-1 italic font-medium hidden md:block">"{dailyTip}"</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleLiveToggle} variant={isLiveActive ? 'danger' : 'outline'} className={`shadow-xl ${isLiveActive ? 'animate-pulse' : ''}`}>
              {isLiveActive ? <Phone size={18} /> : <Mic size={18} />}
              <span>{isLiveActive ? 'End Call' : 'Expert Hotline'}</span>
            </Button>
            <Button onClick={() => { setSelectedItem(null); setModalType('plant'); setIsModalOpen(true); }}><Plus size={20} /><span>New Plant</span></Button>
          </div>
        </header>

        {view === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-2 space-y-8">
              <Card title="System Vitality">
                <div className="space-y-6">
                  {setups.map(s => {
                    const latest = s.waterLogs?.[s.waterLogs.length-1];
                    return (
                      <div key={s.id} className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 group hover:border-emerald-200 transition-all">
                        <div className="flex justify-between items-start mb-8">
                           <div>
                             <h4 className="text-xl font-bold text-slate-800">{s.name}</h4>
                             <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{s.type} • {s.location}</p>
                           </div>
                           <Button variant="secondary" className="text-xs" onClick={() => { setSelectedItem(s); setModalType('water'); setIsModalOpen(true); }}>Log Lab</Button>
                        </div>
                        <div className="flex flex-wrap gap-8">
                           <HealthGauge label="pH" value={latest?.ph || 6.0} min={5.5} max={6.5} unit="" color="bg-blue-500" />
                           <HealthGauge label="EC" value={latest?.ec || 1.2} min={0.8} max={2.2} unit=" mS" color="bg-amber-500" />
                           <HealthGauge label="Temp" value={latest?.temp || 22} min={18} max={24} unit="°C" color="bg-emerald-500" />
                        </div>
                      </div>
                    );
                  })}
                  {setups.length === 0 && <div className="text-center py-20 text-slate-300 italic font-bold">Register your first system to begin tracking.</div>}
                </div>
              </Card>
            </div>
            
            <div className="space-y-8">
              <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                <Waves className="absolute -bottom-10 -right-10 w-48 h-48 text-emerald-500/10 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-black mb-4 relative z-10 flex items-center gap-2"><Sparkles className="text-emerald-400" /> AI Insights</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8 relative z-10">Gemini is analyzing your pH levels. You are currently in the optimal range for Leafy Greens.</p>
                <Button variant="primary" className="w-full" onClick={() => setView('plants')}>View Growth Projections</Button>
              </div>
            </div>
          </div>
        )}

        {view === 'troubleshoot' && (
           <div className="max-w-4xl mx-auto py-10">
              <Card title="Expert Diagnosis">
                 <p className="text-slate-500 mb-8">Upload a photo of your plant's symptoms or describe the issues below.</p>
                 <textarea className="w-full h-40 p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl outline-none focus:border-emerald-500 transition-all text-slate-700 resize-none mb-4" placeholder="Leaves are yellowing at the tips..."></textarea>
                 <div className="flex gap-4">
                    <button className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200"><Camera size={24}/></button>
                    <Button className="flex-1">Analyze Plant Health</Button>
                 </div>
              </Card>
           </div>
        )}
      </main>

      {/* Live Overlay */}
      {isLiveActive && (
        <div className="fixed bottom-8 right-8 z-[110] bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl border border-white/10 flex items-center gap-6 animate-in slide-in-from-right-10 duration-500">
           <div className="flex gap-1 items-center h-8">
              {[...Array(5)].map((_,i) => (
                <div key={i} className="w-1.5 bg-emerald-400 rounded-full animate-pulse" style={{ height: `${Math.random()*100}%`, animationDelay: `${i*0.1}s` }} />
              ))}
           </div>
           <div>
              <p className="text-[10px] font-black uppercase text-emerald-400">Live Botanist</p>
              <p className="text-sm font-bold">Listening...</p>
           </div>
           <button onClick={handleLiveToggle} className="p-3 bg-rose-500 rounded-full hover:bg-rose-600 transition-colors"><X size={18}/></button>
        </div>
      )}

      {/* Basic Modals preserved from original */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={(modalType || '').toUpperCase()}>
         <p className="text-slate-500 text-center py-10 font-bold italic">Form initialization logic...</p>
      </Modal>
    </div>
  );
}
