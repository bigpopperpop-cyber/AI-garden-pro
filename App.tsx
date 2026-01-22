
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  Stethoscope, 
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
  Sparkles,
  Upload,
  Scale,
  ExternalLink,
  History,
  Download,
  Activity
} from 'lucide-react';
import { ViewState, Garden, Notification, GardenType, Plant, LifecycleStage } from './types.ts';
import { getExpertAdvice, getDailyGrowerTip } from './services/geminiService.ts';

// --- Shared UI Components ---

const Card = ({ children, className = "", onClick }: { children?: React.ReactNode, className?: string, onClick?: () => void }) => (
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
            <p className="text-[10px] font-black uppercase text-emerald-200">Total Specimens</p>
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
              <button key={g.id} onClick={() => onGardenSelect(g.id)} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all text-left outline-none group">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${g.type === 'Indoor' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                    {g.type === 'Indoor' ? <Home size={18} /> : <Sun size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{g.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase">{g.plants.length} Specimens</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </button>
            ))}
            {gardens.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm mb-4">No gardens logged yet.</p>
                <Button variant="outline" onClick={() => setView('gardens')}>Create First Garden</Button>
              </div>
            )}
          </div>
        </Card>
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-black text-slate-800">Alerts & Maintenance</h3>
            <Bell size={18} className="text-slate-300" />
          </div>
          <div className="space-y-4">
            {notifications.slice(0, 3).map((n: any) => (
              <div key={n.id} className="flex items-start space-x-3 p-4 border-l-4 border-emerald-500 bg-emerald-50/30 rounded-r-2xl">
                <Clock size={16} className="text-emerald-600 mt-1 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500">{n.message}</p>
                </div>
              </div>
            ))}
            {notifications.length === 0 && <p className="text-slate-400 text-center py-6">System normal. No active alerts.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [notifications] = useState<Notification[]>([
    { id: '1', title: 'pH Check Reminder', message: 'Suggested maintenance for your hydroponic reservoir.', date: new Date().toISOString(), read: false, type: 'maintenance' }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [isHarvestModalOpen, setIsHarvestModalOpen] = useState(false);
  const [isPlantDetailOpen, setIsPlantDetailOpen] = useState(false);
  
  const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [editingGarden, setEditingGarden] = useState<Garden | null>(null);

  // AI State
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string, data: string, mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('hydro_helper_v7');
    if (saved) setGardens(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('hydro_helper_v7', JSON.stringify(gardens));
  }, [gardens]);

  const selectedGarden = gardens.find(g => g.id === selectedGardenId);
  const inspectedPlant = selectedGarden?.plants.find(p => p.id === selectedPlantId);

  const calculateAge = (date: string) => {
    const start = new Date(date);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff < 0 ? 0 : diff;
  };

  const handleGardenSelect = (id: string) => {
    setSelectedGardenId(id);
    setView('gardens');
  };

  const handleAiTroubleshoot = async () => {
    if(!aiQuery && !selectedImage) return;
    setIsAiLoading(true);
    setAiResponse("");
    try {
      const advice = await getExpertAdvice(
        aiQuery || "Examine this plant and suggest care steps.",
        selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined
      );
      setAiResponse(advice);
    } catch (err: any) {
      setAiResponse(`The expert botanist is momentarily unreachable. Try again in a few seconds.`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const saveGarden = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name = (f.elements.namedItem('gname') as HTMLInputElement).value;
    const type = (f.elements.namedItem('gtype') as HTMLInputElement).value as GardenType;
    const startedDate = (f.elements.namedItem('gdate') as HTMLInputElement).value;
    const description = (f.elements.namedItem('gdesc') as HTMLTextAreaElement).value;

    if (editingGarden) {
      setGardens(gardens.map(g => g.id === editingGarden.id ? { ...g, name, type, startedDate, description } : g));
    } else {
      setGardens([...gardens, { id: Date.now().toString(), name, type, startedDate, description, plants: [], notes: [] }]);
    }
    setIsModalOpen(false);
    setEditingGarden(null);
  };

  const savePlant = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGardenId) return;
    const f = e.currentTarget;
    const name = (f.elements.namedItem('pname') as HTMLInputElement).value;
    const variety = (f.elements.namedItem('pvariety') as HTMLInputElement).value;
    const plantedDate = (f.elements.namedItem('pdate') as HTMLInputElement).value;

    setGardens(gardens.map(g => g.id === selectedGardenId ? {
      ...g, plants: [...g.plants, { id: Date.now().toString(), name, variety, plantedDate, stage: 'Germination', harvests: [] }]
    } : g));
    setIsPlantModalOpen(false);
  };

  const saveHarvest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGardenId || !selectedPlantId) return;
    const f = e.currentTarget;
    const amount = parseFloat((f.elements.namedItem('hamount') as HTMLInputElement).value);
    const date = (f.elements.namedItem('hdate') as HTMLInputElement).value;
    
    setGardens(gardens.map(g => g.id === selectedGardenId ? {
      ...g,
      plants: g.plants.map(p => p.id === selectedPlantId ? {
        ...p, harvests: [{ id: Date.now().toString(), date, amount, unit: 'g' }, ...p.harvests], stage: 'Harvested'
      } : p)
    } : g));
    setIsHarvestModalOpen(false);
  };

  const updateStage = (stage: LifecycleStage) => {
    if (!selectedGardenId || !selectedPlantId) return;
    setGardens(gardens.map(g => g.id === selectedGardenId ? {
      ...g, plants: g.plants.map(p => p.id === selectedPlantId ? { ...p, stage } : p)
    } : g));
  };

  const deletePlant = (pId: string) => {
    if(!selectedGardenId || !confirm("Permanently archive this specimen?")) return;
    setGardens(gardens.map(g => g.id === selectedGardenId ? {
      ...g, plants: g.plants.filter(p => p.id !== pId)
    } : g));
    setIsPlantDetailOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* --- Sidebar Navigation --- */}
      <nav className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col p-4 md:p-6 space-y-8 z-50">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Sprout size={24} />
          </div>
          <span className="text-xl font-black text-emerald-600 hidden md:block tracking-tight">HydroHelper</span>
        </div>
        <div className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'gardens', icon: Leaf, label: 'Gardens' },
            { id: 'troubleshoot', icon: Stethoscope, label: 'Ask Botanist' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id as ViewState); setSelectedGardenId(null); }} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${view === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
              <item.icon size={20} />
              <span className="font-bold hidden md:block">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-32">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight capitalize">{selectedGarden ? selectedGarden.name : view}</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              {selectedGarden ? `${selectedGarden.type} Setup` : 'Precision Growing Assistant'}
            </p>
          </div>
          {view === 'gardens' && !selectedGarden && (
            <Button onClick={() => { setEditingGarden(null); setIsModalOpen(true); }}><Plus size={20} /><span>New Garden</span></Button>
          )}
        </header>

        {view === 'dashboard' && <DashboardView gardens={gardens} notifications={notifications} setView={setView} onGardenSelect={handleGardenSelect} />}

        {view === 'gardens' && !selectedGarden && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
            {gardens.map(g => (
              <Card key={g.id} className="relative group cursor-pointer hover:border-emerald-200 transition-all" onClick={() => handleGardenSelect(g.id)}>
                <div className={`w-12 h-12 mb-4 rounded-2xl flex items-center justify-center ${g.type === 'Indoor' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                  {g.type === 'Indoor' ? <Home size={24} /> : <Sun size={24} />}
                </div>
                <h3 className="text-xl font-bold text-slate-800">{g.name}</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{g.plants.length} Specimens • {g.type}</p>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setEditingGarden(g); setIsModalOpen(true); }} className="p-2 text-slate-300 hover:text-emerald-600 transition-colors"><Settings size={16}/></button>
                </div>
              </Card>
            ))}
            <button onClick={() => { setEditingGarden(null); setIsModalOpen(true); }} className="border-4 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-10 text-slate-300 hover:border-emerald-100 hover:text-emerald-300 transition-all outline-none">
              <Plus size={40} className="mb-2" />
              <span className="font-black uppercase tracking-widest text-xs text-center">Establish Garden</span>
            </button>
          </div>
        )}

        {selectedGarden && (
          <div className="space-y-8 animate-in fade-in">
            <button onClick={() => setSelectedGardenId(null)} className="flex items-center text-slate-400 hover:text-emerald-600 font-bold outline-none group">
              <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Gardens
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800">Specimen Directory</h3>
                    <Button onClick={() => setIsPlantModalOpen(true)} variant="outline" className="text-xs py-1.5"><Plus size={16} /><span>Add Specimen</span></Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {selectedGarden.plants.map(p => (
                      <div key={p.id} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:border-emerald-200 transition-all group">
                        <div className="flex items-center space-x-5">
                          <div className="w-14 h-14 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                            <Sprout size={28} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 text-lg leading-tight">{p.name}</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase">{p.variety || 'Standard Breed'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                          <div className="px-4 py-2 bg-white rounded-xl text-center min-w-[110px]">
                            <span className="block text-[10px] text-slate-400 uppercase font-black">Current Phase</span>
                            <span className="text-xs font-black text-slate-700">{p.stage}</span>
                          </div>
                          <button onClick={() => { setSelectedPlantId(p.id); setIsPlantDetailOpen(true); }} className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-105 transition-transform" title="Manage Specimen">
                            <ExternalLink size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {selectedGarden.plants.length === 0 && (
                      <div className="text-center py-12 opacity-30 text-xs font-black uppercase tracking-widest border-2 border-dashed border-slate-200 rounded-[2.5rem]">No specimens logged yet</div>
                    )}
                  </div>
                </Card>
              </div>
              <Card className="bg-slate-900 text-white h-fit">
                <h4 className="font-black mb-6 flex items-center gap-2 border-b border-white/10 pb-4"><Calendar size={18}/> Garden Profile</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Established On</p>
                    <p className="font-bold text-emerald-400">{selectedGarden.startedDate}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl">
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">System Type</p>
                    <p className="font-bold">{selectedGarden.type}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {view === 'troubleshoot' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in">
            <div className="text-center space-y-4 mb-12">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm"><Stethoscope size={48} /></div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">Ask Botanist</h2>
              <p className="text-slate-500 font-medium">Expert AI analysis for plant symptoms. No setup required.</p>
            </div>
            <Card className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Symptom Documentation</label>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      const reader = new FileReader();
                      reader.onloadend = () => setSelectedImage({ url: URL.createObjectURL(f), data: (reader.result as string).split(',')[1], mimeType: f.type });
                      reader.readAsDataURL(f);
                    }
                  }} />
                  {!selectedImage ? (
                    <button onClick={() => fileInputRef.current?.click()} className="w-full py-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 hover:border-emerald-200 hover:text-emerald-400 transition-all outline-none">
                      <Upload size={40} className="mb-2" />
                      <span className="font-bold text-sm">Upload Photo for Analysis</span>
                    </button>
                  ) : (
                    <div className="relative group">
                      <img src={selectedImage.url} alt="Symptoms" className="w-full h-72 object-cover rounded-[2.5rem] shadow-inner" />
                      <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform"><X size={20} /></button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Observations</label>
                  <textarea value={aiQuery} onChange={e => setAiQuery(e.target.value)} placeholder="E.g. Yellowing tips, slow growth, or white spots..." className="w-full h-32 p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] outline-none focus:border-emerald-500 text-slate-700 resize-none leading-relaxed" />
                </div>
                <Button onClick={handleAiTroubleshoot} disabled={isAiLoading} className="w-full py-5 text-xl shadow-lg">
                  {isAiLoading ? <div className="flex items-center space-x-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Consulting Expert...</span></div> : <><Sparkles size={20} /><span>Consult Botanist</span></>}
                </Button>
              </div>
            </Card>
            {aiResponse && (
              <Card className="border-emerald-200 bg-white shadow-xl animate-in slide-in-from-bottom-8 p-10">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg"><Sparkles size={20}/></div>
                  <h3 className="text-xl font-black text-slate-800">Expert Botanist Report</h3>
                </div>
                <div className="prose prose-emerald text-slate-700 leading-relaxed whitespace-pre-wrap text-lg font-medium">{aiResponse}</div>
              </Card>
            )}
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-xl mx-auto py-10">
            <Card className="p-10 text-center">
              <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><Settings size={32} /></div>
              <h3 className="text-2xl font-black mb-8">Growth Settings</h3>
              <div className="space-y-4">
                <Button variant="secondary" className="w-full" onClick={() => {
                   const data = JSON.stringify(gardens, null, 2);
                   const blob = new Blob([data], { type: 'application/json' });
                   const url = URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.href = url;
                   a.download = `hydro-backup-${new Date().toISOString().split('T')[0]}.json`;
                   a.click();
                }}><Download size={18}/><span>Backup Growth Data</span></Button>
                <Button variant="danger" className="w-full" onClick={() => { if(confirm("This will permanently delete ALL specimen and garden data. Continue?")) { localStorage.clear(); window.location.reload(); } }}><Trash2 size={18}/><span>Wipe Local Records</span></Button>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Structured Plant Detail Modal */}
      {isPlantDetailOpen && inspectedPlant && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
              <div className="p-10 pb-6 flex justify-between items-start bg-slate-50/50">
                 <div className="flex items-center space-x-6">
                    <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-lg shadow-emerald-100">
                       <Sprout size={40} />
                    </div>
                    <div>
                       <h3 className="text-4xl font-black text-slate-800 tracking-tight leading-none mb-1">{inspectedPlant.name}</h3>
                       <div className="flex items-center gap-2">
                          <span className="text-lg text-slate-500 font-bold">{inspectedPlant.variety || 'Heirloom Variety'}</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-[10px] text-emerald-700 rounded-md font-black uppercase">Specimen</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setIsPlantDetailOpen(false)} className="p-3 bg-white text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm outline-none transition-all"><X size={32}/></button>
              </div>

              <div className="px-10 overflow-y-auto space-y-8 pb-10 pt-8">
                 {/* Specimen Dashboard Grid */}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center">
                       <Calendar size={20} className="text-slate-300 mx-auto mb-2" />
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Planted On</p>
                       <p className="font-black text-slate-700">{inspectedPlant.plantedDate}</p>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-[2.5rem] border border-blue-100 text-center">
                       <Clock size={20} className="text-blue-300 mx-auto mb-2" />
                       <p className="text-[10px] font-black uppercase text-blue-600 mb-1 tracking-widest">Specimen Age</p>
                       <p className="font-black text-blue-700">{calculateAge(inspectedPlant.plantedDate)} Days</p>
                    </div>
                    <div className="p-6 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 text-center">
                       <Scale size={20} className="text-emerald-300 mx-auto mb-2" />
                       <p className="text-[10px] font-black uppercase text-emerald-600 mb-1 tracking-widest">Lifetime Yield</p>
                       <p className="font-black text-emerald-700">{inspectedPlant.harvests.reduce((sum, h) => sum + h.amount, 0)}g</p>
                    </div>
                 </div>

                 {/* Growth Phase Tracker */}
                 <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Activity size={18} className="text-emerald-600" />
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Growth Phase Control</label>
                    </div>
                    <div className="flex flex-wrap gap-2 bg-slate-50 p-2 rounded-[2rem]">
                       {['Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Harvested'].map((s) => (
                          <button 
                            key={s} 
                            onClick={() => updateStage(s as LifecycleStage)}
                            className={`flex-1 min-w-[100px] px-4 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${inspectedPlant.stage === s ? 'bg-emerald-600 text-white shadow-md' : 'bg-transparent text-slate-400 hover:bg-white hover:text-slate-600'}`}
                          >
                             {s}
                          </button>
                       ))}
                    </div>
                 </div>

                 {/* Yield Ledger */}
                 <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                       <h4 className="text-xl font-black text-slate-800 flex items-center gap-2"><History size={24} className="text-emerald-600" /> Yield Ledger</h4>
                       <Button variant="outline" className="text-xs py-1.5" onClick={() => setIsHarvestModalOpen(true)}><Plus size={16} /><span>Log Yield</span></Button>
                    </div>
                    <div className="space-y-3">
                       {inspectedPlant.harvests.length > 0 ? inspectedPlant.harvests.map(h => (
                          <div key={h.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2.2rem] group hover:border-emerald-200 transition-all shadow-sm">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Scale size={20} /></div>
                                <div>
                                   <p className="font-black text-slate-800 text-lg">{h.amount}g Weight</p>
                                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{h.date}</p>
                                </div>
                             </div>
                             <button onClick={() => { setGardens(gardens.map(g => g.id === selectedGardenId ? { ...g, plants: g.plants.map(p => p.id === inspectedPlant.id ? { ...p, harvests: p.harvests.filter(hr => hr.id !== h.id) } : p) } : g)); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={18} /></button>
                          </div>
                       )) : (
                          <div className="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-100 rounded-[3rem] opacity-30">
                             <p className="text-xs font-black uppercase tracking-widest">No yield data logged for this specimen.</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
              
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                 <button onClick={() => deletePlant(inspectedPlant.id)} className="text-rose-400 hover:text-rose-600 font-black text-[10px] uppercase flex items-center gap-2 outline-none transition-colors">
                    <Trash2 size={16} /> Archive Specimen
                 </button>
                 <Button onClick={() => setIsPlantDetailOpen(false)} className="px-10">Done</Button>
              </div>
           </div>
        </div>
      )}

      {/* --- FORM MODALS --- */}

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-slate-800">{editingGarden ? 'Edit Garden' : 'New Garden'}</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-500 transition-colors"><X size={24}/></button>
              </div>
              <form onSubmit={saveGarden} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Garden Name</label>
                    <input name="gname" defaultValue={editingGarden?.name} placeholder="E.g. Balcony Veggie Rack" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 font-bold" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Setup Type</label>
                       <select name="gtype" defaultValue={editingGarden?.type || 'Indoor'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none"><option>Indoor</option><option>Outdoor</option></select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Initiation Date</label>
                       <input name="gdate" type="date" defaultValue={editingGarden?.startedDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">System Description</label>
                    <textarea name="gdesc" defaultValue={editingGarden?.description} placeholder="Lighting, nutrient line, or equipment used..." className="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl resize-none outline-none focus:border-emerald-500 font-medium" />
                 </div>
                 <Button type="submit" className="w-full py-5 text-xl shadow-lg">Save Garden Profile</Button>
              </form>
           </div>
        </div>
      )}

      {isPlantModalOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in-95">
              <h3 className="text-3xl font-black text-slate-800 mb-10">Log Specimen</h3>
              <form onSubmit={savePlant} className="space-y-6">
                 <div><label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Common Name</label><input name="pname" placeholder="E.g. Genovese Basil" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" /></div>
                 <div><label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Strain/Variety</label><input name="pvariety" placeholder="E.g. Heirloom Purple" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" /></div>
                 <div><label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Germination Date</label><input name="pdate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" /></div>
                 <Button type="submit" className="w-full py-5 text-xl shadow-lg">Register Specimen</Button>
                 <button type="button" onClick={() => setIsPlantModalOpen(false)} className="w-full text-center text-slate-400 font-bold py-2 mt-2 uppercase text-[10px] tracking-widest">Cancel</button>
              </form>
           </div>
        </div>
      )}

      {isHarvestModalOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl p-10 animate-in zoom-in-95">
              <h3 className="text-3xl font-black text-slate-800 mb-10">Log Yield</h3>
              <form onSubmit={saveHarvest} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Weight (Grams)</label>
                    <div className="relative">
                       <input name="hamount" type="number" step="0.1" placeholder="0.0" required className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-3xl font-black outline-none focus:border-emerald-500 pr-16" />
                       <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-300 font-black text-xl">g</span>
                    </div>
                 </div>
                 <div><label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Date</label><input name="hdate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black" /></div>
                 <Button type="submit" className="w-full py-5 text-xl shadow-lg">Confirm Harvest</Button>
                 <button type="button" onClick={() => setIsHarvestModalOpen(false)} className="w-full text-center text-slate-400 font-bold py-2 mt-2 uppercase text-[10px] tracking-widest">Cancel</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
