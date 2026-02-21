

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sprout, 
  Calendar, 
  LayoutDashboard, 
  Settings, 
  Plus, 
  ChevronRight, 
  Search, 
  Filter, 
  MoreVertical, 
  Droplets, 
  Thermometer, 
  Sun, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  Camera, 
  Image as ImageIcon,
  Notebook,
  History,
  Trash2,
  Pencil,
  Save,
  X,
  Target,
  Trophy,
  ExternalLink,
  Bell,
  Activity,
  ArrowRight,
  User,
  LogOut,
  Moon,
  Database,
  Share2,
  Check,
  Undo2,
  Send,
  Sparkles,
  Bot,
  MessageSquare,
  Mic,
  BrainCircuit,
  Zap,
  Link as LinkIcon
} from 'lucide-react';
import { 
  Garden, 
  Plant, 
  LifecycleStage, 
  ViewState, 
  GardenNote, 
  Reminder, 
  Notification, 
  UserProfile,
  ChatMessage,
  AIAnalysisResult,
  GrowthInsights
} from './types';
import * as aiService from './services/geminiService';

// --- UI Components ---

// Fix: Added onClick prop to Card component to handle click events used in various views
const Card = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", type = "button", disabled = false }: any) => {
  const variants: any = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-100",
    coffee: "bg-[#6F4E37] text-white hover:bg-[#5D4037] shadow-md shadow-amber-100",
  };
  return (
    <button 
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg h-full sm:h-auto sm:rounded-3xl shadow-2xl flex flex-col max-h-full sm:max-h-[90vh] animate-fade-in overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow pb-24 sm:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [profile, setProfile] = useState<UserProfile>({ id: '1', name: 'Grow Master', avatarColor: 'emerald' });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  const [isAddGardenOpen, setIsAddGardenOpen] = useState(false);
  const [isAddPlantOpen, setIsAddPlantOpen] = useState(false);
  const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);
  const [inspectedPlant, setInspectedPlant] = useState<Plant | null>(null);
  const [isEditingPlantDate, setIsEditingPlantDate] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // AI State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [growthInsights, setGrowthInsights] = useState<Record<string, GrowthInsights>>({});
  const [isFetchingInsights, setIsFetchingInsights] = useState(false);
  const [quickLogText, setQuickLogText] = useState("");
  const [isProcessingLog, setIsProcessingLog] = useState(false);

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem('hydrogrow_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setGardens(data.gardens || []);
        setReminders(data.reminders || []);
      } catch (e) { console.error("Data restoration failed", e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hydrogrow_data', JSON.stringify({ gardens, reminders }));
  }, [gardens, reminders]);

  // Derived data
  const stats = useMemo(() => {
    const totalPlants = gardens.reduce((acc, g) => acc + g.plants.length, 0);
    const activeGardens = gardens.length;
    const harvests = gardens.flatMap(g => g.plants.flatMap(p => p.harvests));
    const totalYield = harvests.reduce((acc, h) => acc + h.amount, 0);
    const upcomingReminders = reminders.filter(r => !r.completed).length;
    
    return { totalPlants, activeGardens, totalYield, upcomingReminders };
  }, [gardens, reminders]);

  const handleAddGarden = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newGarden: Garden = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      type: formData.get('type') as any,
      startedDate: new Date().toISOString(),
      plants: [],
      notes: []
    };
    setGardens([...gardens, newGarden]);
    setIsAddGardenOpen(false);
  };

  const handleAddPlant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGardenId) return;
    
    const formData = new FormData(e.currentTarget);
    const newPlant: Plant = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      variety: formData.get('variety') as string,
      plantedDate: formData.get('plantedDate') as string || new Date().toISOString(),
      stage: 'Germination',
      harvests: [],
      notes: [],
      phasePhotos: {}
    };

    setGardens(gardens.map(g => 
      g.id === selectedGardenId 
        ? { ...g, plants: [...g.plants, newPlant] }
        : g
    ));
    setIsAddPlantOpen(false);
  };

  const handleUpdatePlant = (plantId: string, updates: Partial<Plant>) => {
    setGardens(prev => prev.map(g => ({
      ...g,
      plants: g.plants.map(p => p.id === plantId ? { ...p, ...updates } : p)
    })));
    
    if (inspectedPlant && inspectedPlant.id === plantId) {
      setInspectedPlant({ ...inspectedPlant, ...updates });
    }
  };

  const handleAnalyzePlant = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const result = await aiService.analyzePlantHealth(imageBase64);
      setAiAnalysis(result);
    } catch (error) {
      console.error("AI Analysis failed", error);
      alert("Failed to analyze plant health. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetInsights = async (garden: Garden) => {
    setIsFetchingInsights(true);
    try {
      const insights = await aiService.getGrowthInsights(garden);
      setGrowthInsights(prev => ({ ...prev, [garden.id]: insights }));
    } catch (error) {
      console.error("Failed to get insights", error);
    } finally {
      setIsFetchingInsights(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);
    
    try {
      const responseText = await aiService.getTroubleshootingAdvice(text, gardens);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat failed", error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleQuickLog = async () => {
    if (!quickLogText.trim()) return;
    setIsProcessingLog(true);
    try {
      const result = await aiService.processNaturalLanguageLog(quickLogText);
      
      // Add log entry to selected garden if possible
      if (selectedGardenId) {
        const newNote: GardenNote = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          content: result.logEntry || quickLogText
        };
        setGardens(prev => prev.map(g => 
          g.id === selectedGardenId 
            ? { ...g, notes: [newNote, ...g.notes] }
            : g
        ));
      }

      // Add suggested reminders
      if (result.suggestedReminders) {
        const newReminders: Reminder[] = result.suggestedReminders.map((r: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          title: r.title,
          date: new Date().toISOString(),
          completed: false,
          priority: r.priority || 'medium'
        }));
        setReminders(prev => [...prev, ...newReminders]);
      }

      setQuickLogText("");
      alert("AI processed your log and updated your garden data!");
    } catch (error) {
      console.error("Quick log failed", error);
    } finally {
      setIsProcessingLog(false);
    }
  };

  const handleSavePlantDate = (newDate: string) => {
    if (!inspectedPlant) return;
    handleUpdatePlant(inspectedPlant.id, { plantedDate: newDate });
    setIsEditingPlantDate(false);
  };

  const deletePlant = (plantId: string) => {
    if (!confirm("Are you sure you want to delete this specimen? All data will be lost.")) return;
    setGardens(prev => prev.map(g => ({
      ...g,
      plants: g.plants.filter(p => p.id !== plantId)
    })));
    setInspectedPlant(null);
  };

  // --- Views ---

  const AssistantView = () => {
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      messagesEndRef.scrollTo({ behavior: 'smooth', top: messagesEndRef.current?.scrollHeight });
    }, [chatMessages]);

    return (
      <div className="animate-fade-in flex flex-col h-[calc(100dvh-160px)] md:h-[calc(100vh-180px)] max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <BrainCircuit className="text-emerald-600" /> Grow Assistant
            </h1>
            <p className="text-slate-400 text-xs md:sm font-medium">AI-powered troubleshooting and advice</p>
          </div>
          <Button variant="secondary" onClick={() => setChatMessages([])} className="text-[10px] md:text-xs px-2 py-1 md:px-4 md:py-2">
            <Trash2 size={14} /> <span className="hidden sm:inline">Clear Chat</span>
          </Button>
        </div>

        <Card className="flex-grow flex flex-col overflow-hidden border-none shadow-xl bg-white relative">
          <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar" ref={messagesEndRef}>
            {chatMessages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60 py-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                  <Bot size={28} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm md:text-base">How can I help your garden today?</p>
                  <p className="text-[10px] md:text-xs text-slate-400 max-w-xs mx-auto mt-1">Ask about nutrient deficiencies, pH levels, or harvest timing.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md px-4">
                  {[
                    "Why are my leaves turning yellow?",
                    "What's the ideal pH for lettuce?",
                    "How do I spot spider mites?",
                    "When should I harvest my basil?"
                  ].map(q => (
                    <button 
                      key={q}
                      onClick={() => handleSendMessage(q)}
                      className="p-3 text-left text-[10px] md:text-xs font-bold text-slate-600 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-all border border-slate-100"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] md:max-w-[80%] p-3 md:p-4 rounded-2xl ${msg.role === 'user' ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                  <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-[8px] md:text-[9px] mt-2 font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-emerald-200' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 md:p-4 bg-slate-50 border-t border-slate-100">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); setInput(""); }} className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the Grow Assistant..." 
                className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2.5 md:py-3 text-xs md:text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
              <Button type="submit" disabled={isChatLoading || !input.trim()} className="px-4 md:px-6">
                <Send size={18} />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    );
  };

  const DashboardView = () => (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Garden Overview</h1>
          <p className="text-slate-400 text-sm font-medium">Welcome back, {profile.name}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-emerald-600 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
            {profile.name[0]}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Plants', value: stats.totalPlants, icon: Sprout, color: 'emerald' },
          { label: 'Gardens', value: stats.activeGardens, icon: LayoutDashboard, color: 'blue' },
          { label: 'Reminders', value: stats.upcomingReminders, icon: Clock, color: 'amber' },
          { label: 'Total Yield', value: `${stats.totalYield}g`, icon: Trophy, color: 'purple' },
        ].map((stat, i) => (
          <Card key={i} className="p-4 border-none shadow-sm bg-white hover:shadow-md transition-shadow cursor-default">
            <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center bg-${stat.color}-50 text-${stat.color}-600`}>
              <stat.icon size={20} />
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-xl font-black text-slate-800 tracking-tight">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* AI Quick Log */}
      <Card className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-none shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
              <Sparkles size={20} className="text-emerald-100" />
            </div>
            <h2 className="text-lg font-black">AI Quick Log</h2>
          </div>
          <p className="text-emerald-100 text-xs mb-4 max-w-md">Just type what's happening. AI will parse pH, EC, and create reminders automatically.</p>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={quickLogText}
              onChange={(e) => setQuickLogText(e.target.value)}
              placeholder="e.g., pH is 6.5, added 5ml bloom nutes, reservoir looks low"
              className="flex-grow bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-sm placeholder:text-emerald-200/50 outline-none focus:bg-white/20 transition-all"
            />
            <Button 
              onClick={handleQuickLog} 
              disabled={isProcessingLog || !quickLogText.trim()}
              className="bg-white text-emerald-700 hover:bg-emerald-50 border-none"
            >
              {isProcessingLog ? <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></div> : <Zap size={18} />}
            </Button>
          </div>
        </div>
        <BrainCircuit className="absolute -bottom-6 -right-6 text-white/10" size={120} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">Quick Access</h2>
            <button onClick={() => setView('gardens')} className="text-emerald-600 text-xs font-bold flex items-center gap-1 hover:underline">
              View All <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {gardens.slice(0, 4).map(garden => (
              <Card key={garden.id} className="p-4 hover:border-emerald-200 transition-colors group cursor-pointer" onClick={() => { setView('gardens'); setSelectedGardenId(garden.id); }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{garden.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{garden.type} System</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <ChevronRight size={16} />
                  </div>
                </div>
                <div className="flex -space-x-2">
                  {garden.plants.slice(0, 3).map((p, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 overflow-hidden">
                      {p.phasePhotos?.Germination ? (
                        <img src={p.phasePhotos.Germination} alt="" className="w-full h-full object-cover" />
                      ) : p.name[0]}
                    </div>
                  ))}
                  {garden.plants.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                      +{garden.plants.length - 3}
                    </div>
                  )}
                  {garden.plants.length === 0 && <p className="text-[10px] text-slate-400 italic py-2 pl-2">No plants yet</p>}
                </div>
              </Card>
            ))}
            {gardens.length === 0 && (
              <div className="sm:col-span-2 py-12 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 bg-white/50">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                  <LayoutDashboard size={32} />
                </div>
                <p className="font-bold mb-4">You have no active gardens</p>
                <Button onClick={() => setIsAddGardenOpen(true)}>Create Your First Garden</Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-800">Reminders</h2>
            <button className="text-emerald-600 text-xs font-bold hover:underline" onClick={() => setView('calendar')}>Calendar</button>
          </div>
          <Card className="p-1 space-y-1">
            {reminders.length > 0 ? reminders.filter(r => !r.completed).slice(0, 5).map(reminder => (
              <div key={reminder.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl group transition-all">
                <button 
                  onClick={() => setReminders(reminders.map(r => r.id === reminder.id ? {...r, completed: true} : r))}
                  className="w-5 h-5 rounded-md border-2 border-slate-200 flex items-center justify-center group-hover:border-emerald-400"
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-sm opacity-0 group-hover:opacity-20"></div>
                </button>
                <div className="flex-grow">
                  <p className="text-xs font-bold text-slate-700">{reminder.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium capitalize">{reminder.priority} Priority</p>
                </div>
                <div className="text-[10px] font-bold text-slate-300">Today</div>
              </div>
            )) : (
              <div className="py-8 px-4 text-center">
                <p className="text-xs text-slate-400 font-medium">All caught up! No active maintenance tasks.</p>
              </div>
            )}
            <div className="p-3 border-t border-slate-50">
              <Button variant="secondary" className="w-full text-xs py-2" onClick={() => setView('calendar')}>
                <Plus size={14} /> Add Task
              </Button>
            </div>
          </Card>

          <Card className="bg-emerald-900 p-6 text-white overflow-hidden relative border-none">
            <div className="relative z-10">
              <h3 className="font-black text-lg mb-1 leading-tight">Master the Growth</h3>
              <p className="text-emerald-300 text-[11px] mb-4 font-medium">Keep your systems healthy with daily logging and nutrient checks.</p>
              <Button variant="secondary" className="bg-emerald-400/20 border-none text-white hover:bg-emerald-400/30 backdrop-blur-sm text-xs">
                Learn Hydropnics
              </Button>
            </div>
            <Droplets className="absolute -bottom-4 -right-4 text-emerald-800 opacity-50 rotate-12" size={100} strokeWidth={1} />
          </Card>
        </div>
      </div>
    </div>
  );

  const GardensView = () => {
    const selectedGarden = gardens.find(g => g.id === selectedGardenId) || gardens[0];

    return (
      <div className="animate-fade-in space-y-6 pb-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Gardens & Specimens</h1>
            <p className="text-slate-400 text-xs md:sm font-medium">Manage your growing environments</p>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <Button onClick={() => setIsAddGardenOpen(true)} variant="secondary" className="whitespace-nowrap text-xs md:text-sm">
              <Plus size={18} /> New System
            </Button>
            <Button onClick={() => {
              if (gardens.length === 0) {
                alert("Please create a garden first");
                setIsAddGardenOpen(true);
              } else {
                setSelectedGardenId(selectedGarden?.id || gardens[0]?.id);
                setIsAddPlantOpen(true);
              }
            }} className="whitespace-nowrap text-xs md:text-sm">
              <Sprout size={18} /> Add Specimen
            </Button>
          </div>
        </div>

        {gardens.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            {/* Sidebar Navigation */}
            <div className="md:col-span-4 lg:col-span-3 space-y-2 overflow-x-auto md:overflow-visible flex md:flex-col gap-2 md:gap-2 no-scrollbar pb-2 md:pb-0">
              <h3 className="hidden md:block text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Your Systems</h3>
              {gardens.map(g => (
                <button 
                  key={g.id}
                  onClick={() => setSelectedGardenId(g.id)}
                  className={`flex-shrink-0 md:w-full flex items-center gap-3 p-2 md:p-3 rounded-2xl transition-all ${selectedGardenId === g.id ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100' : 'text-slate-500 hover:bg-slate-50 border border-transparent'}`}
                >
                  <div className={`p-2 rounded-xl ${selectedGardenId === g.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {g.type === 'Indoor' ? <LayoutDashboard size={18} /> : <Sun size={18} />}
                  </div>
                  <div className="text-left overflow-hidden">
                    <p className="text-[10px] md:text-xs font-bold truncate leading-tight">{g.name}</p>
                    <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-wider opacity-60">{g.plants.length} Plants</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="md:col-span-8 lg:col-span-9 space-y-6 md:space-y-8">
              {selectedGarden ? (
                <>
                  <Card className="border-none shadow-md overflow-visible relative">
                    <div className="absolute -top-4 -right-4 p-3 bg-white border border-slate-100 rounded-2xl shadow-xl flex gap-2">
                       <button className="p-2 text-slate-400 hover:text-slate-600"><Settings size={14} /></button>
                       <button className="p-2 text-rose-400 hover:text-rose-600" onClick={() => {
                         if(confirm(`Delete "${selectedGarden.name}" and all specimens?`)) {
                           setGardens(gardens.filter(g => g.id !== selectedGarden.id));
                           setSelectedGardenId(null);
                         }
                       }}><Trash2 size={14} /></button>
                    </div>
                    <div className="p-6 md:p-8 lg:p-10 bg-gradient-to-br from-emerald-50 to-white">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="bg-emerald-100 text-emerald-700 text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                          {selectedGarden.type} Hydro
                        </span>
                        <span className="text-slate-300 text-[10px] md:text-xs font-medium">Started {new Date(selectedGarden.startedDate).toLocaleDateString()}</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">{selectedGarden.name}</h2>
                      
                      {/* AI Insights Section */}
                      <div className="mt-6">
                        {growthInsights[selectedGarden.id] ? (
                          <div className="bg-white/60 backdrop-blur-md border border-emerald-100 rounded-2xl p-4 animate-fade-in">
                            <div className="flex items-center gap-2 mb-3">
                              <Sparkles size={16} className="text-emerald-600" />
                              <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">AI Growth Insights</h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Targets</p>
                                <p className="text-xs font-bold text-slate-700">pH: {growthInsights[selectedGarden.id].phTarget} | EC: {growthInsights[selectedGarden.id].ecTarget}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Harvest Window</p>
                                <p className="text-xs font-bold text-slate-700">{growthInsights[selectedGarden.id].harvestPrediction}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nutrient Advice</p>
                                <p className="text-xs font-bold text-slate-700 truncate">{growthInsights[selectedGarden.id].nutrientAdvice}</p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-emerald-50 flex gap-2 overflow-x-auto no-scrollbar">
                              {growthInsights[selectedGarden.id].generalTips.map((tip, i) => (
                                <span key={i} className="whitespace-nowrap bg-emerald-50 text-emerald-700 text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-lg border border-emerald-100">
                                  {tip}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleGetInsights(selectedGarden)}
                            disabled={isFetchingInsights}
                            className="w-full py-3 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-all disabled:opacity-50"
                          >
                            {isFetchingInsights ? (
                              <div className="w-4 h-4 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <Sparkles size={14} /> <span className="text-[10px] md:text-xs">Generate AI Growth Insights</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 md:gap-6 mt-8">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                          <div className="flex items-center gap-2 text-emerald-600 font-bold">
                            <Activity size={16} />
                            <span className="text-xs md:text-sm">Healthy / Active</span>
                          </div>
                        </div>
                        <div className="hidden sm:block w-px h-10 bg-slate-200"></div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                          <p className="text-xs md:text-sm font-bold text-slate-800">{selectedGarden.plants.length} Specimens</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 p-4 bg-white flex justify-between items-center rounded-b-2xl">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logs & Data Points: {selectedGarden.notes.length}</p>
                       <Button variant="ghost" className="text-xs h-8 px-3">View Full Log</Button>
                    </div>
                  </Card>

                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-black text-slate-800">Current Specimens</h3>
                      <div className="flex gap-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                          <input type="text" placeholder="Search plants..." className="pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 transition-all w-32 md:w-48" />
                        </div>
                        <button className="p-2 bg-slate-100 text-slate-500 rounded-xl"><Filter size={16} /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {selectedGarden.plants.map(p => (
                        <Card key={p.id} className="group hover:shadow-xl transition-all duration-300 border-slate-100 flex flex-col cursor-pointer" onClick={() => setInspectedPlant(p)}>
                          <div className="aspect-[4/3] bg-slate-50 relative overflow-hidden">
                            {p.phasePhotos?.[p.stage] ? (
                              <img src={p.phasePhotos[p.stage]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 group-hover:text-emerald-200 transition-colors">
                                <Sprout size={48} strokeWidth={1} />
                                <p className="text-[9px] font-black uppercase mt-2 tracking-widest">No Active Capture</p>
                              </div>
                            )}
                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[9px] font-black text-slate-700 uppercase shadow-sm border border-white/50">
                              {p.stage}
                            </div>
                          </div>
                          <div className="p-5 flex-grow">
                            <h4 className="font-black text-slate-800 text-base mb-1 group-hover:text-emerald-700 transition-colors">{p.name}</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-4">{p.variety || 'Standard Variety'}</p>
                            
                            <div className="space-y-3">
                              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-emerald-500 rounded-full" 
                                  style={{ width: `${p.stage === 'Harvested' ? 100 : p.stage === 'Flowering' ? 75 : p.stage === 'Vegetative' ? 40 : 15}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                <span>Age: {Math.floor((new Date().getTime() - new Date(p.plantedDate).getTime()) / (1000 * 3600 * 24))}d</span>
                                <span>{p.notes.length} Notes</span>
                              </div>
                            </div>
                          </div>
                          <div className="px-5 py-4 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center group-hover:bg-emerald-50/50 transition-colors">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Inspect Data</span>
                            <ArrowRight size={14} className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Card>
                      ))}
                      
                      <button 
                        onClick={() => setIsAddPlantOpen(true)}
                        className="aspect-[4/3] sm:aspect-auto sm:min-h-[250px] border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50/30 transition-all group"
                      >
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
                          <Plus size={24} />
                        </div>
                        <p className="font-bold text-sm">Add New Specimen</p>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
                  <p className="text-slate-400 font-medium">Select a garden from the sidebar to begin</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 bg-white rounded-3xl border border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
              <LayoutDashboard size={40} />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">Initialize Your Garden</h2>
            <p className="text-slate-400 text-center max-w-sm mb-8 text-sm leading-relaxed">Create your first growing environment to start tracking your specimens and system data points.</p>
            <Button onClick={() => setIsAddGardenOpen(true)} className="px-8 py-3">Create System</Button>
          </div>
        )}

        {/* Plant Inspection Modal */}
        <Modal 
          isOpen={!!inspectedPlant} 
          onClose={() => { setInspectedPlant(null); setIsEditingPlantDate(false); }}
          title="Specimen Inspection"
        >
          {inspectedPlant && (
            <div className="space-y-8 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-slate-800 truncate pr-6">{inspectedPlant.name}</h3>
                  <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider">{inspectedPlant.variety || 'Indeterminate Variety'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => deletePlant(inspectedPlant.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 md:p-4 bg-slate-50 border-none">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Growth Stage</p>
                  <select 
                    value={inspectedPlant.stage}
                    onChange={(e) => handleUpdatePlant(inspectedPlant.id, { stage: e.target.value as any })}
                    className="w-full bg-transparent border-none p-0 text-sm font-bold text-emerald-600 focus:ring-0 cursor-pointer"
                  >
                    {['Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Harvested'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </Card>
                <Card className="p-3 md:p-4 bg-slate-50 border-none">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Planting Data</p>
                  {isEditingPlantDate ? (
                    <div className="flex items-center gap-1">
                      <input 
                        type="date" 
                        defaultValue={inspectedPlant.plantedDate.split('T')[0]}
                        onChange={(e) => handleSavePlantDate(new Date(e.target.value).toISOString())}
                        className="w-full bg-white border border-emerald-200 rounded px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 outline-none focus:ring-1 focus:ring-emerald-400"
                        onBlur={() => setIsEditingPlantDate(false)}
                        autoFocus
                      />
                      <button onClick={() => setIsEditingPlantDate(false)} className="text-slate-400 hover:text-slate-600"><X size={12} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-1 group">
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-bold text-slate-800">
                          {Math.floor((new Date().getTime() - new Date(inspectedPlant.plantedDate).getTime()) / (1000 * 3600 * 24))}d
                        </p>
                        <span className="text-[9px] text-slate-400">old</span>
                      </div>
                      <button 
                        onClick={() => setIsEditingPlantDate(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white border border-slate-200 rounded text-slate-400 hover:text-emerald-600"
                        title="Edit seed date"
                      >
                        <Pencil size={10} />
                      </button>
                    </div>
                  )}
                </Card>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Lifecycle Gallery</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Snap key changes</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Germination', 'Vegetative', 'Flowering', 'Harvested'].map((stage: any) => (
                    <div key={stage} className="space-y-1">
                      <button 
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e: any) => {
                            const file = e.target.files[0];
                            const reader = new FileReader();
                            reader.onload = (re) => {
                              const base64 = re.target?.result as string;
                              handleUpdatePlant(inspectedPlant.id, {
                                phasePhotos: { ...inspectedPlant.phasePhotos, [stage]: base64 }
                              });
                            };
                            reader.readAsDataURL(file);
                          };
                          input.click();
                        }}
                        className={`w-full aspect-square rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden group relative ${inspectedPlant.phasePhotos?.[stage] ? 'border-emerald-100' : 'border-slate-100 hover:border-emerald-200'}`}
                      >
                        {inspectedPlant.phasePhotos?.[stage] ? (
                          <>
                            <img src={inspectedPlant.phasePhotos[stage]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAnalyzePlant(inspectedPlant.phasePhotos![stage]!);
                              }}
                              className="absolute bottom-2 right-2 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                              title="AI Health Scan"
                            >
                              <Sparkles size={14} />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center text-slate-300">
                            {/* Fixed: Removed invalid 'md:size' prop and replaced with Tailwind responsive classes */}
                            <ImageIcon className="w-8 h-8 md:w-12 md:h-12 mb-2 opacity-30" />
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest">Capture {stage}</p>
                          </div>
                        )}
                      </button>
                      <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest">{stage}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Analysis Result */}
              {(isAnalyzing || aiAnalysis) && (
                <Card className="p-5 bg-slate-900 text-white border-none shadow-xl animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-emerald-400" />
                      <h4 className="text-sm font-black uppercase tracking-wider">AI Health Diagnostic</h4>
                    </div>
                    {isAnalyzing && <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>}
                  </div>
                  
                  {aiAnalysis && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          aiAnalysis.healthStatus === 'Healthy' ? 'bg-emerald-500/20 text-emerald-400' :
                          aiAnalysis.healthStatus === 'Warning' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {aiAnalysis.healthStatus}
                        </div>
                        <p className="text-xs font-bold text-slate-300">Stage: {aiAnalysis.stageVerification || 'Unknown'}</p>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{aiAnalysis.diagnosis}</p>
                      <div className="space-y-2">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Recommendations</p>
                        <ul className="space-y-1">
                          {aiAnalysis.recommendations.map((rec, i) => (
                            <li key={i} className="text-[11px] flex items-start gap-2">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0 mt-0.5" />
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button 
                        variant="secondary" 
                        className="w-full bg-white/10 border-none text-white hover:bg-white/20 text-[10px] py-1.5"
                        onClick={() => {
                          const newNote: GardenNote = {
                            id: Date.now().toString(),
                            date: new Date().toISOString(),
                            content: `AI Health Scan: ${aiAnalysis.diagnosis}. Recommendations: ${aiAnalysis.recommendations.join(', ')}`
                          };
                          handleUpdatePlant(inspectedPlant.id, { notes: [newNote, ...inspectedPlant.notes] });
                          setAiAnalysis(null);
                        }}
                      >
                        Save Analysis to Logs
                      </Button>
                    </div>
                  )}
                </Card>
              )}

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Growth Logs</h4>
                  <button 
                    onClick={() => {
                      const content = prompt("Enter a log entry for this specimen:");
                      if (content) {
                        const newNote: GardenNote = { id: Date.now().toString(), date: new Date().toISOString(), content };
                        handleUpdatePlant(inspectedPlant.id, { notes: [newNote, ...inspectedPlant.notes] });
                      }
                    }}
                    className="text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg"
                  >
                    <Plus size={12} /> Add Log
                  </button>
                </div>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {inspectedPlant.notes.length > 0 ? inspectedPlant.notes.map(note => (
                    <div key={note.id} className="p-3 bg-slate-50 rounded-xl relative group">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">{new Date(note.date).toLocaleString()}</p>
                      <p className="text-xs text-slate-700 leading-relaxed pr-6">{note.content}</p>
                      <button 
                        onClick={() => handleUpdatePlant(inspectedPlant.id, { notes: inspectedPlant.notes.filter(n => n.id !== note.id) })}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )) : (
                    <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <Notebook size={24} className="mx-auto text-slate-200 mb-2" />
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No data points yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="secondary" className="flex-grow" onClick={() => setInspectedPlant(null)}>Close Inspection</Button>
                <Button 
                   variant="secondary"
                   className="bg-slate-100 text-slate-600 border-none" 
                   onClick={() => {
                      const shareUrl = window.location.href;
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        setCopyFeedback("Link copied!");
                        setTimeout(() => setCopyFeedback(null), 3000);
                      });
                   }}
                >
                   <Share2 size={18} />
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  };

  const CalendarView = () => (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Maintenance</h1>
          <p className="text-slate-400 text-xs md:sm font-medium">Task schedule and system reminders</p>
        </div>
        <Button onClick={() => {
          const title = prompt("Reminder Title:");
          if (title) {
            setReminders([...reminders, {
              id: Date.now().toString(),
              title,
              date: new Date().toISOString(),
              completed: false,
              priority: 'medium'
            }]);
          }
        }} className="text-xs md:text-sm">
          <Plus size={18} /> Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-8 space-y-6">
           <Card className="p-4 md:p-8">
              <div className="flex flex-col sm:flex-row items-center justify-between mb-6 md:mb-8 gap-4">
                <h2 className="text-base md:text-lg font-black text-slate-800">Growth Calendar</h2>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronLeft size={20} /></button>
                  <p className="text-xs md:text-sm font-black text-slate-800 min-w-[100px] md:min-w-[128px] text-center">March 2024</p>
                  <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight size={20} /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 md:gap-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 md:pb-4">{day}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => (
                  <div key={i} className={`aspect-square md:aspect-auto md:h-24 p-1 md:p-2 rounded-lg md:rounded-2xl border transition-all ${i + 1 === 14 ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-slate-200'} cursor-pointer group`}>
                    <p className={`text-[10px] md:text-xs font-bold mb-1 md:mb-2 ${i + 1 === 14 ? 'text-emerald-700' : 'text-slate-400'}`}>{i + 1}</p>
                    <div className="hidden md:block space-y-1">
                      {i + 1 === 14 && (
                        <div className="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded shadow-sm flex items-center gap-1">
                          <Droplets size={8} /> Nutrients
                        </div>
                      )}
                      {i + 1 === 20 && (
                        <div className="px-1.5 py-0.5 bg-blue-500 text-white text-[9px] font-bold rounded shadow-sm flex items-center gap-1">
                          <CheckCircle2 size={8} /> PH Check
                        </div>
                      )}
                    </div>
                    {/* Mobile Indicators */}
                    <div className="md:hidden flex flex-wrap gap-0.5 justify-center">
                      {i + 1 === 14 && <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>}
                      {i + 1 === 20 && <div className="w-1 h-1 bg-blue-500 rounded-full"></div>}
                    </div>
                  </div>
                ))}
              </div>
           </Card>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Card className="p-5 md:p-6 bg-blue-900 text-white border-none">
                <Target size={24} className="mb-3 md:mb-4 text-blue-300" />
                <h3 className="text-sm md:text-base font-bold mb-1">Coming Up: Harvest Window</h3>
                <p className="text-blue-200 text-[10px] md:text-xs mb-4">"Cherry Tomatoes" in Urban Balcony system are reaching maturity in 4 days.</p>
                <Button variant="secondary" className="bg-blue-400/20 text-white border-none hover:bg-blue-400/30 text-[10px] md:text-xs py-1.5">Set Reminder</Button>
             </Card>
             <Card className="p-5 md:p-6 bg-slate-900 text-white border-none">
                <History size={24} className="mb-3 md:mb-4 text-slate-300" />
                <h3 className="text-sm md:text-base font-bold mb-1">System Log: Nutrient Change</h3>
                <p className="text-slate-400 text-[10px] md:text-xs mb-4">Last full water and nutrient flush completed 12 days ago.</p>
                <Button variant="secondary" className="bg-slate-400/20 text-white border-none hover:bg-slate-400/30 text-[10px] md:text-xs py-1.5">View System History</Button>
             </Card>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Active Tasks</h3>
           <div className="space-y-3">
              {reminders.map(r => (
                <Card key={r.id} className={`p-3 md:p-4 transition-all ${r.completed ? 'opacity-40 scale-95' : 'hover:shadow-md'}`}>
                  <div className="flex items-start gap-3">
                    <button 
                      onClick={() => setReminders(reminders.map(rem => rem.id === r.id ? {...rem, completed: !rem.completed} : rem))}
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${r.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 hover:border-emerald-400'}`}
                    >
                      {r.completed && <Check size={14} strokeWidth={3} />}
                    </button>
                    <div className="flex-grow min-w-0">
                      <p className={`text-xs font-bold truncate leading-tight ${r.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{r.title}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(r.date).toLocaleDateString()}</p>
                    </div>
                    <button 
                      onClick={() => setReminders(reminders.filter(rem => rem.id !== r.id))}
                      className="text-slate-300 hover:text-rose-500 p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </Card>
              ))}
              {reminders.length === 0 && (
                <div className="p-8 text-center bg-white border border-slate-100 rounded-3xl">
                  <p className="text-xs text-slate-300 font-bold uppercase tracking-widest">No active tasks</p>
                </div>
              )}
           </div>
           
           <Card className="p-5 border-emerald-100 bg-emerald-50/30">
              <h4 className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-3">Pro Growing Tip</h4>
              <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">Keep your nutrient solution between 18-22°C (65-72°F). Higher temps can lead to root rot and reduced oxygen absorption.</p>
           </Card>
        </div>
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6 md:space-y-8 pb-24">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">System Configuration</h1>
        <p className="text-slate-400 text-xs md:sm font-medium">Manage your profile and platform preferences</p>
      </div>

      <Card className="p-5 md:p-8 space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 pb-6 md:pb-8 border-b border-slate-100 text-center sm:text-left">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-emerald-600 flex items-center justify-center text-white text-2xl md:text-3xl font-black shadow-xl shadow-emerald-200">
            {profile.name[0]}
          </div>
          <div className="flex-grow">
            <h3 className="text-lg md:text-xl font-black text-slate-800 mb-1">{profile.name}</h3>
            <p className="text-slate-400 text-xs md:sm font-medium">hydro-pro-member#9281</p>
            <div className="flex justify-center sm:justify-start gap-2 mt-3">
              <Button variant="secondary" className="py-1 px-3 text-[10px]">Change Photo</Button>
              <Button variant="ghost" className="py-1 px-3 text-[10px]">Edit Name</Button>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-6">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Interface Settings</h4>
          <div className="space-y-1 md:space-y-2">
            {[
              { icon: Moon, label: 'Dark Mode', desc: 'Sync with system appearance', toggle: true, checked: false },
              { icon: Bell, label: 'Notifications', desc: 'Push alerts for system maintenance', toggle: true, checked: true },
              { icon: Database, label: 'Local Backup', desc: 'Keep redundant offline copies of your data', toggle: true, checked: true },
              { icon: User, label: 'Visibility', desc: 'Show garden stats to growing community', toggle: true, checked: false },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 md:p-4 hover:bg-slate-50 rounded-xl md:rounded-2xl transition-all cursor-pointer group">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="p-2 md:p-2.5 bg-slate-100 text-slate-400 rounded-lg md:rounded-xl group-hover:bg-white group-hover:shadow-sm group-hover:text-emerald-600 transition-all">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-bold text-slate-700">{item.label}</p>
                    <p className="text-[9px] md:text-[10px] text-slate-400 font-medium">{item.desc}</p>
                  </div>
                </div>
                <div className={`w-8 h-4 md:w-10 md:h-5 rounded-full transition-all relative ${item.checked ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-0.5 md:top-1 w-3 h-3 bg-white rounded-full transition-all ${item.checked ? 'right-0.5 md:right-1' : 'left-0.5 md:left-1'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 md:pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
           <Button variant="danger" className="w-full sm:w-auto px-6 text-xs">Delete All Garden Data</Button>
           <Button variant="coffee" className="w-full sm:w-auto px-6 text-xs" onClick={() => window.open('https://paypal.me/hydrogrow', '_blank')}>Support HydroGrow Pro</Button>
        </div>
      </Card>

      <div className="flex flex-col items-center gap-2 text-slate-300">
        <Sprout size={24} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em]">HydroGrow Pro v2.4.0-Stable</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-10 max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-6">
      {/* Dynamic View Header/Wrapper */}
      <main className="pb-10">
        {view === 'dashboard' && <DashboardView />}
        {view === 'gardens' && <GardensView />}
        {view === 'assistant' && <AssistantView />}
        {view === 'calendar' && <CalendarView />}
        {view === 'settings' && <SettingsView />}
      </main>

      {/* Persistent Navigation Bar (Mobile/Tablet) */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 md:left-1/2 md:-translate-x-1/2 md:max-w-md lg:max-w-lg landscape:bottom-2">
        <Card className="rounded-[2.5rem] shadow-2xl p-1.5 md:p-2.5 flex justify-between bg-white/95 backdrop-blur-xl border-white/50 ring-1 ring-slate-900/5">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
            { id: 'gardens', icon: Sprout, label: 'Gardens' },
            { id: 'assistant', icon: Bot, label: 'AI Help' },
            { id: 'calendar', icon: Calendar, label: 'Tasks' },
            { id: 'settings', icon: Settings, label: 'Setup' },
          ].map((nav) => (
            <button
              key={nav.id}
              onClick={() => setView(nav.id as any)}
              className={`flex-grow flex flex-col items-center justify-center p-2 md:p-3 rounded-[2rem] transition-all relative ${view === nav.id ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <nav.icon size={20} className="md:w-[22px] md:h-[22px]" strokeWidth={view === nav.id ? 2.5 : 2} />
              <span className={`text-[8px] md:text-[9px] font-black uppercase mt-1 tracking-widest ${view === nav.id ? 'opacity-100' : 'opacity-0 hidden sm:block'}`}>{nav.label}</span>
              {view === nav.id && <div className="absolute -top-1 w-1 h-1 bg-emerald-600 rounded-full"></div>}
            </button>
          ))}
        </Card>
      </nav>

      {/* Global Modals */}
      <Modal isOpen={isAddGardenOpen} onClose={() => setIsAddGardenOpen(false)} title="System Initialization">
        <form onSubmit={handleAddGarden} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Garden Name</label>
              <input name="name" required placeholder="e.g., Balcony Hydroponics" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">System Type</label>
              <select name="type" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none">
                <option value="Indoor">Indoor System</option>
                <option value="Outdoor">Outdoor / Green House</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full py-4 text-base font-black">Initialize System</Button>
        </form>
      </Modal>

      <Modal isOpen={isAddPlantOpen} onClose={() => setIsAddPlantOpen(false)} title="Add New Specimen">
        <form onSubmit={handleAddPlant} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Specimen Name</label>
              <input name="name" required placeholder="e.g., Cherry Tomato #1" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Variety (Optional)</label>
              <input name="variety" placeholder="e.g., Roma / Heirloom" className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Seeded Date</label>
              <input name="plantedDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 border-slate-100 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none" />
            </div>
          </div>
          <Button type="submit" className="w-full py-4 text-base font-black">Add to {gardens.find(g => g.id === selectedGardenId)?.name || 'System'}</Button>
        </form>
      </Modal>

      {copyFeedback && (
        <div className="fixed bottom-24 md:top-6 right-1/2 translate-x-1/2 md:translate-x-0 md:right-6 bg-slate-800 text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-fade-in z-[300]">
          <Check size={16} className="text-emerald-400" />
          <span className="font-bold text-[11px] whitespace-nowrap">{copyFeedback}</span>
        </div>
      )}
    </div>
  );
}
