
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  Stethoscope, 
  Settings, 
  Plus, 
  Bell, 
  X, 
  MessageSquare,
  Leaf,
  Calendar,
  Trash2,
  Clock,
  Info,
  ChevronRight,
  ChevronLeft,
  Sun,
  Home,
  Pencil,
  Sparkles,
  BarChart3,
  Weight,
  TrendingUp,
  Activity,
  Upload,
  Download,
  FileUp,
  ShieldCheck,
  Zap,
  HardDrive,
  Coffee,
  Heart,
  Share2,
  Copy,
  Check,
  History,
  Scale,
  ExternalLink,
  ChevronUp
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { ViewState, Garden, GardenNote, Notification, GardenType, Plant, LifecycleStage, HarvestRecord } from './types.ts';
import { getExpertAdvice, getDailyGrowerTip } from './services/geminiService.ts';

// --- Shared UI Components ---

const Card = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", type = "button", disabled = false }: any) => {
  const variants: any = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-100 disabled:opacity-50",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    outline: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
    amber: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100"
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

// --- Dashboard View ---

const DashboardView = ({ gardens, notifications, setView, onGardenSelect }: any) => {
  const [tip, setTip] = useState("Loading your daily tip...");
  
  useEffect(() => {
    getDailyGrowerTip().then(setTip);
  }, []);

  const totalPlants = gardens.reduce((acc: number, g: Garden) => acc + g.plants.length, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-emerald-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
        <Leaf className="absolute -bottom-6 -right-6 w-32 h-32 text-emerald-500/20 rotate-12" />
        <h2 className="text-3xl font-black mb-2 tracking-tight">Welcome, Grower!</h2>
        <p className="text-emerald-50/90 font-medium italic text-lg">"{tip}"</p>
        
        <div className="flex gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-emerald-200">Active Gardens</p>
            <p className="text-xl font-black">{gardens.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-emerald-200">Total Plants</p>
            <p className="text-xl font-black">{totalPlants}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800">Recent Gardens</h3>
            <button onClick={() => setView('gardens')} className="text-emerald-600 text-xs font-black uppercase hover:underline outline-none">View All</button>
          </div>
          <div className="space-y-4">
            {gardens.slice(0, 3).map((g: Garden) => (
              <button 
                key={g.id} 
                onClick={() => onGardenSelect(g.id)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all text-left outline-none group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${g.type === 'Indoor' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                    {g.type === 'Indoor' ? <Home size={18} /> : <Sun size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{g.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase">{g.plants.length} Plants</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </button>
            ))}
            {gardens.length === 0 && <p className="text-slate-400 text-center py-6">No gardens yet. Start one today!</p>}
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800">Alerts & Tips</h3>
            <Bell size={18} className="text-slate-300" />
          </div>
          <div className="space-y-4">
            {notifications.filter((n: any) => !n.read).slice(0, 3).map((n: Notification) => (
              <div key={n.id} className="flex items-start space-x-3 p-4 border-l-4 border-emerald-500 bg-emerald-50/30 rounded-r-2xl">
                <Clock size={16} className="text-emerald-600 mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500">{n.message}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-slate-400 text-center py-6 italic">You're all caught up!</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Reports View ---

const ReportsView = ({ gardens }: { gardens: Garden[] }) => {
  const lifecycleData = useMemo(() => {
    const counts: Record<LifecycleStage, number> = {
      'Germination': 0,
      'Vegetative': 0,
      'Flowering': 0,
      'Fruiting': 0,
      'Harvested': 0
    };
    gardens.forEach(g => {
      g.plants.forEach(p => {
        counts[p.stage]++;
      });
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [gardens]);

  const harvestData = useMemo(() => {
    const data: Record<string, number> = {};
    gardens.forEach(g => {
      g.plants.forEach(p => {
        const total = p.harvests.reduce((acc, h) => acc + h.amount, 0);
        if (total > 0) {
          data[p.name] = (data[p.name] || 0) + total;
        }
      });
    });
    return Object.entries(data).map(([name, amount]) => ({ name, amount }));
  }, [gardens]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#64748b'];
  const totalHarvest = harvestData.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <Activity size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-800">Lifecycle Distribution</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lifecycleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {lifecycleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Yield Comparison</h3>
              <p className="text-xs text-slate-400 font-bold uppercase">Total Grams Harvested: {totalHarvest}g</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={harvestData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-xl font-black text-slate-800 mb-6">Global Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-50 rounded-[2rem]">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Plants Seeded</p>
            <p className="text-3xl font-black text-slate-800">{gardens.reduce((acc, g) => acc + g.plants.length, 0)}</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-[2rem]">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Currently Fruiting</p>
            <p className="text-3xl font-black text-emerald-600">
              {gardens.reduce((acc, g) => acc + g.plants.filter(p => p.stage === 'Fruiting').length, 0)}
            </p>
          </div>
          <div className="p-6 bg-slate-50 rounded-[2rem]">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Total Notes</p>
            <p className="text-3xl font-black text-slate-800">{gardens.reduce((acc, g) => acc + g.notes.length, 0)}</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-[2rem]">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Active Systems</p>
            <p className="text-3xl font-black text-blue-600">{gardens.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [notifications] = useState<Notification[]>([
    { id: '1', title: 'pH Check Reminder', message: 'It has been 3 days since your last pH check.', date: new Date().toISOString(), read: false, type: 'maintenance' },
    { id: '2', title: 'Nutrient Tip', message: 'Lettuce grows best with a cooler water temperature.', date: new Date().toISOString(), read: false, type: 'tip' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isPlantDetailOpen, setIsPlantDetailOpen] = useState(false);
  
  const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [editingGarden, setEditingGarden] = useState<Garden | null>(null);
  const [editingPlant, setEditingPlant] = useState<{plant: Plant, gardenId: string} | null>(null);

  // AI Troubleshoot state
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string, data: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  // Sharing state
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hydro_gardens_final_v5');
    if (saved) setGardens(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('hydro_gardens_final_v5', JSON.stringify(gardens));
  }, [gardens]);

  const selectedGarden = gardens.find(g => g.id === selectedGardenId);
  const inspectedPlant = selectedGarden?.plants.find(p => p.id === selectedPlantId);

  const handleGardenSelect = (id: string) => {
    setSelectedGardenId(id);
    setView('gardens');
  };

  const saveGarden = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = (f.elements.namedItem('gname') as HTMLInputElement).value;
    const type = (f.elements.namedItem('gtype') as HTMLInputElement).value as GardenType;
    const startedDate = (f.elements.namedItem('gdate') as HTMLInputElement).value;
    const description = (f.elements.namedItem('gdesc') as HTMLTextAreaElement).value;

    if (editingGarden) {
      setGardens(gardens.map(g => g.id === editingGarden.id ? {
        ...g, name, type, startedDate, description
      } : g));
    } else {
      const newG: Garden = {
        id: Date.now().toString(),
        name, type, startedDate, description,
        plants: [],
        notes: []
      };
      setGardens([...gardens, newG]);
    }
    setIsModalOpen(false);
    setEditingGarden(null);
  };

  const savePlant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGardenId && !editingPlant) return;
    const f = e.currentTarget;
    const targetGardenId = editingPlant ? editingPlant.gardenId : selectedGardenId!;
    const name = (f.elements.namedItem('pname') as HTMLInputElement).value;
    const variety = (f.elements.namedItem('pvariety') as HTMLInputElement).value;
    const plantedDate = (f.elements.namedItem('pdate') as HTMLInputElement).value;

    if (editingPlant) {
      setGardens(gardens.map(g => g.id === targetGardenId ? {
        ...g,
        plants: g.plants.map(p => p.id === editingPlant.plant.id ? { ...p, name, variety, plantedDate } : p)
      } : g));
    } else {
      const newPlant: Plant = {
        id: Date.now().toString(),
        name, variety, plantedDate,
        stage: 'Germination',
        harvests: []
      };
      setGardens(gardens.map(g => g.id === targetGardenId ? {
        ...g,
        plants: [...g.plants, newPlant]
      } : g));
    }
    setIsPlantModalOpen(false);
    setEditingPlant(null);
    f.reset();
  };

  const updatePlantStage = (gardenId: string, plantId: string, stage: LifecycleStage) => {
    setGardens(gardens.map(g => g.id === gardenId ? {
      ...g,
      plants: g.plants.map(p => p.id === plantId ? { ...p, stage } : p)
    } : g));
  };

  const saveHarvest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGardenId || !selectedPlantId) return;
    const f = e.currentTarget;
    const amount = parseFloat((f.elements.namedItem('hamount') as HTMLInputElement).value);
    const date = (f.elements.namedItem('hdate') as HTMLInputElement).value;
    
    const newHarvest: HarvestRecord = {
      id: Date.now().toString(),
      date,
      amount,
      unit: 'grams'
    };

    setGardens(gardens.map(g => g.id === selectedGardenId ? {
      ...g,
      plants: g.plants.map(p => p.id === selectedPlantId ? {
        ...p,
        harvests: [newHarvest, ...p.harvests], // Newest first
        stage: 'Harvested'
      } : p)
    } : g));

    setIsHarvestModalOpen(false);
    // Keep detail modal open if we just logged from there
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedImage({
          url: URL.createObjectURL(file),
          data: base64String,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const addNote = (content: string) => {
    if (!selectedGardenId) return;
    setGardens(gardens.map(g => g.id === selectedGardenId ? {
      ...g,
      notes: [{ id: Date.now().toString(), date: new Date().toLocaleDateString(), content }, ...g.notes]
    } : g));
  };

  const deleteGarden = (id: string) => {
    if(confirm("Permanently delete this garden and all its data?")) {
      setGardens(gardens.filter(g => g.id !== id));
      setSelectedGardenId(null);
    }
  };

  const deletePlant = (gardenId: string, plantId: string) => {
    if(confirm("Remove this plant from your records?")) {
      setGardens(gardens.map(g => g.id === gardenId ? {
        ...g,
        plants: g.plants.filter(p => p.id !== plantId)
      } : g));
      if (selectedPlantId === plantId) setIsPlantDetailOpen(false);
    }
  };

  const handleAiTroubleshoot = async () => {
    if(!aiQuery && !selectedImage) return;
    setIsAiLoading(true);
    setAiResponse("");
    const advice = await getExpertAdvice(
      aiQuery || "Please analyze this plant image and tell me if it looks healthy.",
      selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined
    );
    setAiResponse(advice);
    setIsAiLoading(false);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(gardens, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hydro_helper_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const imported = JSON.parse(content);
          if (Array.isArray(imported)) {
            if (confirm("Importing this data will overwrite your current gardens. Continue?")) {
              setGardens(imported);
              alert("Data imported successfully!");
            }
          } else {
            alert("Invalid data format.");
          }
        } catch (err) {
          alert("Error reading file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const supportLink = "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=gizmooo@yahoo.com&item_name=Support%20HydroHelper%20Development&currency_code=USD";

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col p-4 md:p-6 space-y-8 z-50 transition-all shadow-sm">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Sprout size={24} />
          </div>
          <span className="text-xl font-black text-emerald-600 hidden md:block">HydroHelper</span>
        </div>

        <div className="flex-1 space-y-2">
          <button onClick={() => {setView('dashboard'); setSelectedGardenId(null)}} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all outline-none ${view === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <LayoutDashboard size={20} />
            <span className="font-bold hidden md:block">Dashboard</span>
          </button>
          <button onClick={() => {setView('gardens'); setSelectedGardenId(null)}} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all outline-none ${view === 'gardens' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Leaf size={20} />
            <span className="font-bold hidden md:block">Gardens</span>
          </button>
          <button onClick={() => {setView('reports'); setSelectedGardenId(null)}} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all outline-none ${view === 'reports' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <BarChart3 size={20} />
            <span className="font-bold hidden md:block">Insights</span>
          </button>
          <button onClick={() => {setView('troubleshoot'); setSelectedGardenId(null)}} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all outline-none ${view === 'troubleshoot' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Stethoscope size={20} />
            <span className="font-bold hidden md:block">AI Expert</span>
          </button>
        </div>

        <div className="space-y-2">
          <button onClick={handleShare} className="w-full flex items-center space-x-3 p-3 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all outline-none border border-transparent hover:border-emerald-100 relative group">
            {isCopied ? <Check size={20} className="text-emerald-500 animate-in zoom-in" /> : <Share2 size={20} />}
            <span className="font-bold hidden md:block">{isCopied ? 'Link Copied!' : 'Share Site'}</span>
          </button>
          <a href={supportLink} target="_blank" rel="noopener noreferrer" className="w-full flex items-center space-x-3 p-3 rounded-xl text-amber-600 hover:bg-amber-50 transition-all outline-none border border-transparent hover:border-amber-100">
            <Coffee size={20} />
            <span className="font-bold hidden md:block">Buy me a coffee</span>
          </a>
          <button onClick={() => {setView('settings'); setSelectedGardenId(null)}} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all outline-none ${view === 'settings' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Settings size={20} />
            <span className="font-bold hidden md:block">Settings</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight capitalize">
              {selectedGarden ? selectedGarden.name : view}
            </h1>
            <p className="text-slate-400 text-sm font-medium">Simplify your growing journey.</p>
          </div>
          {view === 'gardens' && !selectedGarden && (
            <Button onClick={() => { setEditingGarden(null); setIsModalOpen(true); }}>
              <Plus size={20} />
              <span className="hidden md:inline">Add Garden</span>
            </Button>
          )}
        </header>

        {view === 'dashboard' && <DashboardView gardens={gardens} notifications={notifications} setView={setView} onGardenSelect={handleGardenSelect} />}

        {view === 'reports' && <ReportsView gardens={gardens} />}

        {view === 'gardens' && !selectedGarden && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
            {gardens.map(g => (
              <div key={g.id} className="relative group">
                <button onClick={() => setSelectedGardenId(g.id)} className="w-full text-left outline-none h-full">
                  <Card className="hover:border-emerald-200 transition-all hover:translate-y-[-4px] h-full flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${g.type === 'Indoor' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                        {g.type === 'Indoor' ? <Home size={24} /> : <Sun size={24} />}
                      </div>
                      <span className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">
                        {g.plants.length} Plants
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{g.name}</h3>
                    <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">{g.type} Environment</p>
                    <p className="text-sm text-slate-500 line-clamp-2">{g.description || "No description set."}</p>
                  </Card>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingGarden(g); setIsModalOpen(true); }}
                  className="absolute bottom-6 right-6 p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 opacity-0 group-hover:opacity-100 transition-all outline-none"
                >
                  <Pencil size={16} />
                </button>
              </div>
            ))}
            <button onClick={() => { setEditingGarden(null); setIsModalOpen(true); }} className="border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-10 text-slate-300 hover:border-emerald-100 hover:text-emerald-300 transition-all outline-none">
              <Plus size={40} className="mb-2" />
              <span className="font-black uppercase tracking-widest text-xs">New Garden</span>
            </button>
          </div>
        )}

        {selectedGarden && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <button onClick={() => setSelectedGardenId(null)} className="flex items-center text-slate-400 hover:text-emerald-600 font-bold group outline-none">
                <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Gardens
              </button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => { setEditingGarden(selectedGarden); setIsModalOpen(true); }}>
                   <Pencil size={18}/>
                </Button>
                <Button variant="danger" onClick={() => deleteGarden(selectedGarden.id)}>
                   <Trash2 size={18}/>
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Plant Directory */}
                <Card>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800">Plant Directory</h3>
                    <Button onClick={() => { setEditingPlant(null); setIsPlantModalOpen(true); }} variant="outline" className="text-xs py-1.5 px-3">
                      <Plus size={16} /> <span>New Plant</span>
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {selectedGarden.plants.map(p => (
                      <div key={p.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 hover:shadow-md hover:border-emerald-100 transition-all group flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div className="flex items-center space-x-5 mb-4 md:mb-0">
                          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                             <Sprout size={28} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 text-lg leading-tight">{p.name}</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase">{p.variety || 'Heirloom'}</p>
                          </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-4 w-full md:w-auto">
                           <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex flex-col min-w-[100px]">
                              <span className="text-[10px] font-black uppercase text-slate-400 mb-0.5 tracking-widest">Phase</span>
                              <span className="text-xs font-black text-slate-700">{p.stage}</span>
                           </div>
                           <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col min-w-[80px]">
                              <span className="text-[10px] font-black uppercase text-emerald-600/60 mb-0.5 tracking-widest">Yield</span>
                              <span className="text-xs font-black text-emerald-700">{p.harvests.reduce((sum, h) => sum + h.amount, 0)}g</span>
                           </div>
                           
                           <div className="flex gap-2 ml-auto">
                              <button 
                                onClick={() => { setSelectedPlantId(p.id); setIsPlantDetailOpen(true); }}
                                className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:scale-110 transition-transform"
                                title="Inspect Plant Details"
                              >
                                <ExternalLink size={18} />
                              </button>
                              <button 
                                onClick={() => { setSelectedPlantId(p.id); setIsHarvestModalOpen(true); }}
                                className="p-3 bg-slate-100 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                title="Quick Harvest"
                              >
                                <Scale size={18} />
                              </button>
                           </div>
                        </div>
                      </div>
                    ))}
                    {selectedGarden.plants.length === 0 && (
                      <div className="text-center py-16 opacity-30 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                        <Sprout size={48} className="mx-auto mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">No plants logged in this garden.</p>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Journal */}
                <Card>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800">Garden Journal</h3>
                    <MessageSquare size={20} className="text-slate-300" />
                  </div>
                  <form onSubmit={e => {
                    e.preventDefault();
                    const input = (e.currentTarget.elements.namedItem('notecontent') as HTMLInputElement);
                    addNote(input.value);
                    input.value = '';
                  }} className="mb-8">
                    <div className="flex space-x-2">
                      <input name="notecontent" placeholder="Log an observation (e.g. pH adjusted to 6.0)..." className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:border-emerald-500 transition-all" required />
                      <Button type="submit">Post</Button>
                    </div>
                  </form>
                  <div className="space-y-6">
                    {selectedGarden.notes.map(note => (
                      <div key={note.id} className="p-5 bg-slate-50 rounded-[1.5rem] relative">
                        <span className="text-[10px] font-black text-emerald-600 uppercase mb-2 block">{note.date}</span>
                        <p className="text-slate-700 leading-relaxed">{note.content}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                 <Card className="bg-slate-900 text-white shadow-2xl">
                    <h4 className="font-black mb-6 flex items-center gap-2"><Calendar size={18}/> Overview</h4>
                    <div className="space-y-6">
                       <div className="p-4 bg-white/5 rounded-2xl">
                          <p className="text-[10px] text-slate-400 uppercase font-black mb-1 tracking-widest">Establishment Date</p>
                          <p className="font-bold text-lg">{selectedGarden.startedDate}</p>
                       </div>
                       <div className="p-4 bg-white/5 rounded-2xl">
                          <p className="text-[10px] text-slate-400 uppercase font-black mb-1 tracking-widest">Environment</p>
                          <p className="font-bold text-lg flex items-center gap-2">
                            {selectedGarden.type === 'Indoor' ? <Home size={16}/> : <Sun size={16}/>}
                            {selectedGarden.type}
                          </p>
                       </div>
                    </div>
                 </Card>

                 <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem]">
                    <h4 className="font-black text-emerald-800 mb-2">Need Help?</h4>
                    <p className="text-sm text-emerald-700 mb-6 leading-relaxed">Ask our AI botanist about symptoms or maintenance.</p>
                    <Button variant="outline" className="w-full bg-white shadow-sm" onClick={() => { setView('troubleshoot'); setSelectedGardenId(null); }}>Consult Botanist</Button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {view === 'troubleshoot' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
             <div className="text-center space-y-4 mb-12">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
                   <Stethoscope size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">Ask Botanist</h2>
                <p className="text-slate-500 font-medium text-lg">Send a photo and describe the symptoms.</p>
             </div>
             <Card className="p-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Attach Photo</label>
                     <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
                     {!selectedImage ? (
                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-8 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-slate-300 hover:border-emerald-200 hover:text-emerald-400 transition-all outline-none">
                           <Upload size={32} className="mb-2" />
                           <span className="font-bold text-sm">Upload Symptoms Photo</span>
                        </button>
                     ) : (
                        <div className="relative group">
                           <img src={selectedImage.url} alt="Plant Preview" className="w-full h-64 object-cover rounded-[2rem] shadow-md" />
                           <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <X size={20} />
                           </button>
                        </div>
                     )}
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Observations</label>
                     <textarea value={aiQuery} onChange={e => setAiQuery(e.target.value)} placeholder="E.g. Yellowing tips, brown spots on bottom leaves, checking pH daily..." className="w-full h-32 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:border-emerald-500 transition-all text-slate-700 resize-none leading-relaxed" />
                  </div>
                  <Button onClick={handleAiTroubleshoot} disabled={isAiLoading || (!aiQuery && !selectedImage)} className="w-full py-5 text-xl shadow-lg">
                    {isAiLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Diagnosing...</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        <span>Run Diagnosis</span>
                      </>
                    )}
                  </Button>
                </div>
             </Card>
             {aiResponse && (
               <Card className="border-emerald-200 bg-white shadow-xl animate-in slide-in-from-bottom-8">
                 <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg"><Sparkles size={20}/></div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Expert Plan</h3>
                 </div>
                 <div className="prose prose-emerald text-slate-700 leading-relaxed whitespace-pre-wrap text-lg">
                    {aiResponse}
                 </div>
               </Card>
             )}
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-xl mx-auto py-10 space-y-8 animate-in slide-in-from-bottom-6 duration-500">
             <Card className="p-10 text-center">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                   <Settings size={40} />
                </div>
                <h3 className="text-2xl font-black mb-4">Settings</h3>
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <Button variant="secondary" className="py-4" onClick={exportData}>
                         <Download size={18}/> <span>Export</span>
                      </Button>
                      <Button variant="secondary" className="py-4" onClick={() => importFileRef.current?.click()}>
                         <FileUp size={18}/> <span>Import</span>
                      </Button>
                      <input type="file" accept="application/json" className="hidden" ref={importFileRef} onChange={handleImportFile} />
                   </div>
                   <Button variant="danger" className="w-full py-4" onClick={() => { if(confirm("Wipe everything?")) { localStorage.clear(); window.location.reload(); } }}>
                      <Trash2 size={18}/> <span>Wipe Data</span>
                   </Button>
                </div>
             </Card>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Plant Inspection Modal */}
      {isPlantDetailOpen && inspectedPlant && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
              <div className="p-10 pb-6 flex justify-between items-start">
                 <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center shadow-lg shadow-emerald-100">
                       <Sprout size={40} />
                    </div>
                    <div>
                       <h3 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-2">{inspectedPlant.name}</h3>
                       <p className="text-lg text-slate-400 font-bold uppercase tracking-widest">{inspectedPlant.variety || 'Unknown Variety'}</p>
                    </div>
                 </div>
                 <button onClick={() => setIsPlantDetailOpen(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all outline-none">
                    <X size={32}/>
                 </button>
              </div>

              <div className="px-10 overflow-y-auto space-y-8 pb-10">
                 {/* Stats Bar */}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Planted On</p>
                       <p className="font-black text-slate-700">{inspectedPlant.plantedDate}</p>
                    </div>
                    <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                       <p className="text-[10px] font-black uppercase text-emerald-600 mb-2 tracking-widest">Growth Phase</p>
                       <div className="flex items-center space-x-2">
                          <span className="font-black text-emerald-700">{inspectedPlant.stage}</span>
                          <TrendingUp size={16} className="text-emerald-500" />
                       </div>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                       <p className="text-[10px] font-black uppercase text-blue-600 mb-2 tracking-widest">Total Yield</p>
                       <p className="font-black text-blue-700">{inspectedPlant.harvests.reduce((sum, h) => sum + h.amount, 0)}g</p>
                    </div>
                 </div>

                 {/* Lifecycle Updater */}
                 <div className="space-y-4">
                    <label className="text-xs font-black uppercase text-slate-400 tracking-widest">Update Lifecycle Phase</label>
                    <div className="flex flex-wrap gap-2">
                       {['Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Harvested'].map((stage) => (
                          <button 
                            key={stage}
                            onClick={() => updatePlantStage(selectedGardenId!, inspectedPlant.id, stage as LifecycleStage)}
                            className={`px-4 py-2 rounded-full text-xs font-black transition-all ${inspectedPlant.stage === stage ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          >
                             {stage}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Harvest History Section */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h4 className="text-xl font-black text-slate-800 flex items-center gap-2">
                          <History size={20} className="text-emerald-600" /> Harvest Records
                       </h4>
                       <Button variant="outline" className="text-xs py-1.5" onClick={() => setIsHarvestModalOpen(true)}>
                          <Scale size={16} /> <span>Add Record</span>
                       </Button>
                    </div>
                    
                    <div className="space-y-3">
                       {inspectedPlant.harvests.length > 0 ? (
                         inspectedPlant.harvests.map(h => (
                           <div key={h.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] group hover:bg-white hover:border-emerald-200 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                                    <Scale size={18} />
                                 </div>
                                 <div>
                                    <p className="font-black text-slate-700">{h.amount} {h.unit}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{h.date}</p>
                                 </div>
                              </div>
                              <button onClick={() => {
                                 setGardens(gardens.map(g => g.id === selectedGardenId ? {
                                    ...g, plants: g.plants.map(p => p.id === inspectedPlant.id ? {
                                       ...p, harvests: p.harvests.filter(hr => hr.id !== h.id)
                                    } : p)
                                 } : g));
                              }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all">
                                 <Trash2 size={16} />
                              </button>
                           </div>
                         ))
                       ) : (
                         <div className="text-center py-10 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 opacity-40">
                            <p className="text-xs font-black uppercase tracking-widest">No harvest data yet.</p>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
              
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between">
                 <Button variant="danger" onClick={() => deletePlant(selectedGardenId!, inspectedPlant.id)}>Remove Plant</Button>
                 <Button onClick={() => { setEditingPlant({ plant: inspectedPlant, gardenId: selectedGardenId! }); setIsPlantModalOpen(true); }}>Edit Profile</Button>
              </div>
           </div>
        </div>
      )}

      {/* Garden Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-slate-800 tracking-tight">{editingGarden ? 'Edit Garden' : 'New Garden'}</h3>
                 <button onClick={() => { setIsModalOpen(false); setEditingGarden(null); }} className="p-2 text-slate-300 hover:text-slate-600 outline-none"><X size={32}/></button>
              </div>
              <form onSubmit={saveGarden} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Garden Name</label>
                    <input name="gname" defaultValue={editingGarden?.name} placeholder="E.g. South Balcony" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Environment</label>
                       <select name="gtype" defaultValue={editingGarden?.type || 'Indoor'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold">
                          <option>Indoor</option>
                          <option>Outdoor</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Start Date</label>
                       <input name="gdate" type="date" defaultValue={editingGarden?.startedDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                    </div>
                 </div>
                 <Button type="submit" className="w-full py-5 text-xl shadow-lg mt-4">{editingGarden ? 'Update' : 'Initialize'}</Button>
              </form>
           </div>
        </div>
      )}

      {/* Plant Modal (Add/Edit) */}
      {isPlantModalOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-slate-800 tracking-tight">{editingPlant ? 'Edit Plant' : 'Log Plant'}</h3>
                 <button onClick={() => { setIsPlantModalOpen(false); setEditingPlant(null); }} className="p-2 text-slate-300 hover:text-slate-600 outline-none"><X size={32}/></button>
              </div>
              <form onSubmit={savePlant} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Plant Name</label>
                    <input name="pname" defaultValue={editingPlant?.plant.name} placeholder="E.g. Basil" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Variety</label>
                    <input name="pvariety" defaultValue={editingPlant?.plant.variety} placeholder="E.g. Thai Sweet" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Planted Date</label>
                    <input name="pdate" type="date" defaultValue={editingPlant?.plant.plantedDate || new Date().toISOString().split('T')[0]} required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                 </div>
                 <Button type="submit" className="w-full py-5 text-xl shadow-lg mt-4">Save Plant</Button>
              </form>
           </div>
        </div>
      )}

      {/* Harvest Modal */}
      {isHarvestModalOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-slate-800 tracking-tight">Record Harvest</h3>
                 <button onClick={() => { setIsHarvestModalOpen(false); }} className="p-2 text-slate-300 hover:text-slate-600 outline-none"><X size={32}/></button>
              </div>
              <form onSubmit={saveHarvest} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Amount (grams)</label>
                    <input name="hamount" type="number" step="0.1" placeholder="0.0" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 text-xl font-black" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Date</label>
                    <input name="hdate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                 </div>
                 <Button type="submit" className="w-full py-5 text-xl shadow-lg mt-4">Log Yield</Button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
