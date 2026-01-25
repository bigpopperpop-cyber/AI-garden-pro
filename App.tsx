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
  TrendingUp,
  MessageSquare,
  Send,
  Activity,
  Printer,
  FileSpreadsheet,
  Heart,
  ShieldCheck,
  Repeat,
  Upload,
  Laptop,
  BarChart3,
  History,
  ClipboardList,
  Share2,
  Link as LinkIcon,
  Copy,
  Check,
  Globe,
  Coffee,
  HelpCircle,
  RefreshCcw,
  Save,
  FileUp
} from 'lucide-react';
import { ViewState, Garden, Notification, GardenType, Plant, LifecycleStage, GardenNote } from './types.ts';

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
    coffee: "bg-[#6F4E37] text-white hover:bg-[#5D4037] shadow-md shadow-amber-100",
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

// --- Dashboard View ---

const DashboardView = ({ gardens, setView, onGardenSelect, onExportPDF, onExportExcel, onShareApp }: any) => {
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
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-emerald-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
        <Leaf className="absolute -bottom-6 -right-6 w-32 h-32 text-emerald-500/20 rotate-12" />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-black mb-2 tracking-tight">Growth Dashboard</h2>
              <p className="text-emerald-50/90 font-medium italic text-lg opacity-80">Track your growing journey effortlessly.</p>
            </div>
            <button 
              onClick={onShareApp}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all border border-white/10 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
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
              <Printer size={18} /><span>PDF Report</span>
            </Button>
            <Button onClick={onExportExcel} variant="outline" className="w-full py-4 bg-white border-emerald-100 text-emerald-600">
              <FileSpreadsheet size={18} /><span>Export CSV</span>
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
                          style={{ width: `${(count / (totalPlants || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 w-16 truncate">{stage}</span>
                      <span className="text-[10px] font-black text-white">{count}</span>
                    </div>
                  ))}
                  {totalPlants === 0 && <p className="text-xs text-slate-500 italic">No data yet.</p>}
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
              {latestNotes.length === 0 && <p className="text-slate-400 text-center py-6 text-sm">No recent activity.</p>}
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800">Your Gardens</h3>
              <button onClick={() => setView('gardens')} className="text-emerald-600 text-xs font-black uppercase hover:underline">Manage All</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              {gardens.length === 0 && (
                <div className="col-span-2 text-center py-12 text-slate-400">
                  No gardens found. Start by creating one!
                </div>
              )}
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
      const saved = localStorage.getItem('hydro_gardens_core');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return [];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [isPlantDetailOpen, setIsPlantDetailOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<Garden[] | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  
  const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [editingGarden, setEditingGarden] = useState<Garden | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedGarden = gardens.find(g => g.id === selectedGardenId);
  const inspectedPlant = selectedGarden?.plants.find(p => p.id === selectedPlantId);

  useEffect(() => {
    localStorage.setItem('hydro_gardens_core', JSON.stringify(gardens));
  }, [gardens]);

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
      } catch (err) { console.error(err); }
    }
  }, []);

  const handleGardenSelect = (id: string) => {
    setSelectedGardenId(id);
    setView('gardens');
  };

  const handleShareWorkspace = () => {
    try {
      const json = JSON.stringify(gardens);
      const encoded = btoa(encodeURIComponent(json));
      const shareUrl = `${window.location.origin}${window.location.pathname}?workspace=${encoded}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopyFeedback("Workspace link copied!");
        setTimeout(() => setCopyFeedback(null), 3000);
      });
    } catch (err) { alert("Workspace too large to share via URL."); }
  };

  const handleShareApp = () => {
    const appUrl = `${window.location.origin}${window.location.pathname}`;
    navigator.clipboard.writeText(appUrl).then(() => {
      setCopyFeedback("App link copied!");
      setTimeout(() => setCopyFeedback(null), 3000);
    });
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const summaryHtml = `<html><body style="font-family:sans-serif"><h1>HydroGrow Report</h1>${gardens.map(g => `<h2>${g.name} (${g.type})</h2><ul>${g.plants.map(p => `<li>${p.name} - Stage: ${p.stage}</li>`).join('')}</ul>`).join('')}</body></html>`;
    printWindow.document.write(summaryHtml);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportExcel = () => {
    const csvContent = "Garden,Plant,PlantedDate,Stage\n" + gardens.flatMap(g => g.plants.map(p => `${g.name},${p.name},${p.plantedDate},${p.stage}`)).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "garden_export.csv";
    link.click();
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
      setGardens(prev => [...prev, { id: Date.now().toString(), name, type, startedDate, plants: [], notes: [] }]);
    }
    setIsModalOpen(false);
    setEditingGarden(null);
  };

  const savePlant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGardenId) return;
    const f = e.currentTarget;
    const name = (f.elements.namedItem('pname') as HTMLInputElement).value;
    const plantedDate = (f.elements.namedItem('pdate') as HTMLInputElement).value;
    
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g, plants: [...g.plants, { id: Date.now().toString(), name, plantedDate, stage: 'Germination', harvests: [], notes: [] }]
    } : g));
    setIsPlantModalOpen(false);
  };

  const addPlantNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGardenId || !selectedPlantId || !newNoteText.trim()) return;
    const newNote = { id: Date.now().toString(), date: new Date().toLocaleString(), content: newNoteText.trim() };
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g, plants: g.plants.map(p => p.id === selectedPlantId ? { ...p, notes: [newNote, ...p.notes] } : p)
    } : g));
    setNewNoteText('');
  };

  const updatePlantStage = (stage: LifecycleStage) => {
    if (!selectedGardenId || !selectedPlantId) return;
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g, plants: g.plants.map(p => p.id === selectedPlantId ? { ...p, stage } : p)
    } : g));
  };

  const deletePlant = (plantId: string) => {
    if (!selectedGardenId || !confirm("Delete specimen?")) return;
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g, plants: g.plants.filter(p => p.id !== plantId)
    } : g));
    setIsPlantDetailOpen(false);
  };

  const handleResetApp = () => {
    if (confirm("Wait! This will delete ALL your gardens and data from this browser. Are you sure you want a fresh start?")) {
      setGardens([]);
      localStorage.removeItem('hydro_gardens_core');
      setView('dashboard');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <input type="file" ref={fileInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            try { setGardens(JSON.parse(ev.target?.result as string)); } catch (err) { alert("Import failed."); }
          };
          reader.readAsText(file);
        }
      }} accept=".json" className="hidden" />

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
            { id: 'settings', icon: Settings, label: 'Settings' }
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
          </div>
        </header>

        {view === 'dashboard' && <DashboardView gardens={gardens} setView={setView} onGardenSelect={handleGardenSelect} onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} onShareApp={handleShareApp} />}

        {view === 'gardens' && !selectedGarden && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gardens.map(g => (
              <Card key={g.id} className="relative group cursor-pointer hover:border-emerald-200 transition-all" onClick={() => handleGardenSelect(g.id)}>
                <div className={`w-12 h-12 mb-4 rounded-2xl flex items-center justify-center ${g.type === 'Indoor' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                  {g.type === 'Indoor' ? <Home size={24} /> : <Sun size={24} />}
                </div>
                <h3 className="text-xl font-bold text-slate-800">{g.name}</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{g.plants?.length || 0} Specimens • {g.type}</p>
                <button onClick={(e) => { e.stopPropagation(); setEditingGarden(g); setIsModalOpen(true); }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-emerald-600"><Settings size={16}/></button>
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
            <button onClick={() => setSelectedGardenId(null)} className="flex items-center text-slate-400 hover:text-emerald-600 font-bold group">
              <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Gardens
            </button>
            
            <div className="max-w-4xl mx-auto space-y-8">
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
                              <p className="text-xs text-slate-400 font-bold uppercase">Age: {calculateAge(p.plantedDate)} Days</p>
                            </div>
                          </div>
                          <button onClick={() => { setSelectedPlantId(p.id); setIsPlantDetailOpen(true); }} className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg"><ExternalLink size={18} /></button>
                        </div>
                        <div className="mt-4 flex gap-4">
                           <div className="px-3 py-1 bg-white rounded-lg border text-[10px] font-black uppercase text-emerald-600">{p.stage}</div>
                        </div>
                      </div>
                    ))}
                    {selectedGarden.plants.length === 0 && (
                      <div className="text-center py-10 text-slate-400">No specimens tracked yet.</div>
                    )}
                  </div>
                </Card>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-4xl mx-auto py-10 space-y-8 animate-in slide-in-from-bottom-6">
            {/* --- Privacy Notice --- */}
            <Card className="p-8 border-l-8 border-l-emerald-500 bg-emerald-50/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">Local & Private</h3>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">No Cloud Required</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                HydroGrow Pro is "local-first." This means all your garden notes and data are saved <strong>only</strong> in this specific browser on this device. We never see your data, and there's no login required!
              </p>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* --- Share Section --- */}
              <Card className="p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Share2 size={24} className="text-blue-500" />
                  <h3 className="text-xl font-black">Share Garden</h3>
                </div>
                <p className="text-sm text-slate-500 mb-6 flex-1">
                  Want to show off your setup? Create a special link that lets someone else import your current garden layout.
                </p>
                <Button onClick={handleShareWorkspace} variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                  <LinkIcon size={18} /><span>Copy Share Link</span>
                </Button>
              </Card>

              {/* --- Backup Section --- */}
              <Card className="p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Save size={24} className="text-emerald-600" />
                  <h3 className="text-xl font-black">Safety Backup</h3>
                </div>
                <p className="text-sm text-slate-500 mb-6 flex-1">
                  It's a good idea to save your progress to a file occasionally. You can use this file to move your data to a new computer.
                </p>
                <div className="space-y-3">
                  <Button variant="secondary" className="w-full flex justify-between px-4" onClick={() => {
                    const blob = new Blob([JSON.stringify(gardens)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "my_hydro_backup.json";
                    a.click();
                  }}>
                    <span>Download File</span><Download size={18} />
                  </Button>
                  <Button variant="outline" className="w-full flex justify-between px-4" onClick={() => fileInputRef.current?.click()}>
                    <span>Load from File</span><FileUp size={18} />
                  </Button>
                </div>
              </Card>

              {/* --- Fresh Start Section --- */}
              <Card className="p-8 flex flex-col bg-slate-50/50">
                <div className="flex items-center gap-3 mb-4">
                  <RefreshCcw size={24} className="text-slate-400" />
                  <h3 className="text-xl font-black text-slate-600">Fresh Start</h3>
                </div>
                <p className="text-sm text-slate-500 mb-6 flex-1">
                  Want to start over completely? This button clears all your data. Use with caution!
                </p>
                <Button variant="danger" className="w-full" onClick={handleResetApp}>
                  <Trash2 size={18} /><span>Clear Everything</span>
                </Button>
              </Card>
              
              {/* --- Donation Card --- */}
              <Card className="p-8 bg-amber-50/30 border-2 border-amber-100 md:col-span-2">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center shrink-0">
                    <Coffee size={32} />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-slate-800 mb-1">Support the Developer</h3>
                    <p className="text-sm text-slate-500 mb-4">If you find this tool helpful, consider donating a cup of coffee to support future updates and gizmos!</p>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <Button variant="coffee" onClick={() => window.open('https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=gizmooo@yahoo.com&item_name=Support+HydroGrow+Pro', '_blank')}>
                         Donate via PayPal
                      </Button>
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <Copy size={12}/> gizmooo@yahoo.com
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-3xl font-black mb-10">{editingGarden ? 'Edit Garden' : 'New Garden'}</h3>
              <form onSubmit={saveGarden} className="space-y-6">
                 <input name="gname" defaultValue={editingGarden?.name} placeholder="Garden Name" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                 <select name="gtype" defaultValue={editingGarden?.type || 'Indoor'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none"><option value="Indoor">Indoor</option><option value="Outdoor">Outdoor</option></select>
                 <input name="gdate" type="date" defaultValue={editingGarden?.startedDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none" />
                 <Button type="submit" className="w-full py-5">Confirm</Button>
                 <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-bold py-2">Cancel</button>
              </form>
           </div>
        </div>
      )}

      {isPlantModalOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-3xl font-black mb-10">Add Specimen</h3>
              <form onSubmit={savePlant} className="space-y-6">
                 <input name="pname" placeholder="Name (e.g. Basil)" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                 <input name="pdate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none" />
                 <Button type="submit" className="w-full py-5">Save Specimen</Button>
                 <button type="button" onClick={() => setIsPlantModalOpen(false)} className="w-full text-slate-400 font-bold py-2">Cancel</button>
              </form>
           </div>
        </div>
      )}

      {isPlantDetailOpen && inspectedPlant && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[3.5rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto p-10 relative animate-in zoom-in-95">
              <button onClick={() => setIsPlantDetailOpen(false)} className="absolute top-6 right-6 p-3 hover:text-rose-500"><X size={24}/></button>
              <h3 className="text-4xl font-black text-slate-800 mb-8">{inspectedPlant.name}</h3>
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Lifecycle Stage</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {['Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Harvested'].map(s => (
                        <button key={s} onClick={() => updatePlantStage(s as LifecycleStage)} className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${inspectedPlant.stage === s ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border hover:border-emerald-200'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-center">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Age</p>
                    <p className="text-3xl font-black text-slate-700">{calculateAge(inspectedPlant.plantedDate)} Days</p>
                    <p className="text-xs text-slate-400 mt-1">Planted on {inspectedPlant.plantedDate}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="font-black text-lg flex items-center gap-2"><ClipboardList size={20} className="text-emerald-600" /> Care Logs</h4>
                  <form onSubmit={addPlantNote} className="flex gap-2">
                    <input value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} placeholder="Log feeding, PH, or progress..." className="flex-1 p-4 bg-slate-50 border rounded-2xl outline-none focus:border-emerald-500" />
                    <Button type="submit"><Send size={18}/></Button>
                  </form>
                  <div className="space-y-3">
                    {inspectedPlant.notes.map(n => (
                      <div key={n.id} className="p-5 border border-slate-100 bg-white rounded-[2rem] text-sm">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-black text-[9px] uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{n.date}</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed font-medium">"{n.content}"</p>
                      </div>
                    ))}
                    {inspectedPlant.notes.length === 0 && <p className="text-center py-6 text-slate-300 italic">No logs recorded.</p>}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex justify-between">
                   <button onClick={() => deletePlant(inspectedPlant.id)} className="text-rose-400 hover:text-rose-600 font-black text-xs uppercase flex items-center gap-2"><Trash2 size={16}/> Delete Specimen</button>
                   <Button onClick={() => setIsPlantDetailOpen(false)}>Close Details</Button>
                </div>
              </div>
           </div>
        </div>
      )}

      {isImportModalOpen && pendingImportData && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-10 shadow-2xl text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8"><LinkIcon size={40} /></div>
              <h3 className="text-3xl font-black mb-4">Import Shared Data?</h3>
              <p className="text-slate-500 mb-10">Found {pendingImportData.length} gardens in the URL. Would you like to merge or replace your current workspace?</p>
              <div className="space-y-4">
                 <Button onClick={() => { setGardens(prev => [...prev, ...pendingImportData]); setIsImportModalOpen(false); }} className="w-full py-4">Merge Workspace</Button>
                 <Button onClick={() => { setGardens(pendingImportData); setIsImportModalOpen(false); }} variant="secondary" className="w-full py-4">Replace All</Button>
                 <button onClick={() => setIsImportModalOpen(false)} className="text-slate-300 font-bold py-2">Discard</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
