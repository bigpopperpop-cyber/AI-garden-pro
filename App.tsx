
import React, { useState, useEffect } from 'react';
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
  Sun,
  Home,
  Pencil,
  Sparkles
} from 'lucide-react';
import { ViewState, Garden, GardenNote, Notification, GardenType, Plant } from './types.ts';
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
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

// --- View Components ---

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
            <button onClick={() => setView('gardens')} className="text-emerald-600 text-xs font-black uppercase hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {gardens.slice(0, 3).map((g: Garden) => (
              <button 
                key={g.id} 
                onClick={() => onGardenSelect(g.id)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all text-left"
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
                <ChevronRight size={18} className="text-slate-300" />
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

// --- Main App ---

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [notifications] = useState<Notification[]>([
    { id: '1', title: 'pH Check Reminder', message: 'It has been 3 days since your last pH check.', date: new Date().toISOString(), read: false, type: 'maintenance' },
    { id: '2', title: 'Nutrient Tip', message: 'Lettuce grows best with a cooler water temperature.', date: new Date().toISOString(), read: false, type: 'tip' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);
  const [editingGarden, setEditingGarden] = useState<Garden | null>(null);
  const [editingPlant, setEditingPlant] = useState<{plant: Plant, gardenId: string} | null>(null);

  // AI Troubleshoot state
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('hydro_gardens_final_v2');
    if (saved) setGardens(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('hydro_gardens_final_v2', JSON.stringify(gardens));
  }, [gardens]);

  const selectedGarden = gardens.find(g => g.id === selectedGardenId);

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
        name, variety, plantedDate
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
    }
  };

  const handleAiTroubleshoot = async () => {
    if(!aiQuery) return;
    setIsAiLoading(true);
    const advice = await getExpertAdvice(aiQuery);
    setAiResponse(advice);
    setIsAiLoading(false);
  };

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
          <button onClick={() => {setView('dashboard'); setSelectedGardenId(null)}} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <LayoutDashboard size={20} />
            <span className="font-bold hidden md:block">Dashboard</span>
          </button>
          <button onClick={() => {setView('gardens'); setSelectedGardenId(null)}} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${view === 'gardens' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Leaf size={20} />
            <span className="font-bold hidden md:block">Gardens</span>
          </button>
          <button onClick={() => {setView('troubleshoot'); setSelectedGardenId(null)}} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${view === 'troubleshoot' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
            <Stethoscope size={20} />
            <span className="font-bold hidden md:block">AI Expert</span>
          </button>
        </div>

        <button onClick={() => {setView('settings'); setSelectedGardenId(null)}} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${view === 'settings' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
          <Settings size={20} />
          <span className="font-bold hidden md:block">Settings</span>
        </button>
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

        {view === 'gardens' && !selectedGarden && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
            {gardens.map(g => (
              <div key={g.id} className="relative group">
                <button onClick={() => setSelectedGardenId(g.id)} className="w-full text-left group outline-none h-full">
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
                  className="absolute bottom-6 right-6 p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 opacity-0 group-hover:opacity-100 transition-all"
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
              <button onClick={() => setSelectedGardenId(null)} className="flex items-center text-slate-400 hover:text-emerald-600 font-bold group">
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
                {/* Plant Tracking */}
                <Card>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-800">Plant Directory</h3>
                    <Button onClick={() => { setEditingPlant(null); setIsPlantModalOpen(true); }} variant="outline" className="text-xs py-1.5 px-3">
                      <Plus size={16} /> <span>New Plant</span>
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedGarden.plants.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl group hover:shadow-sm transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                             <Sprout size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.variety || 'Heirloom'} • Planted {p.plantedDate}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditingPlant({ plant: p, gardenId: selectedGarden.id }); setIsPlantModalOpen(true); }} className="p-2 text-slate-300 hover:text-emerald-600">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => deletePlant(selectedGarden.id, p.id)} className="p-2 text-slate-300 hover:text-rose-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {selectedGarden.plants.length === 0 && (
                      <div className="text-center py-10 opacity-30">
                        <p className="font-bold">No plants logged yet.</p>
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
                      <input name="notecontent" placeholder="Log an observation (e.g. pH adjusted to 6.0)..." className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 outline-none focus:border-emerald-500" required />
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
                    {selectedGarden.notes.length === 0 && (
                      <div className="text-center py-10 opacity-30 italic">
                        <p>No notes yet.</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                 <Card className="bg-slate-900 text-white shadow-2xl">
                    <h4 className="font-black mb-6 flex items-center gap-2"><Calendar size={18}/> Overview</h4>
                    <div className="space-y-6">
                       <div className="p-4 bg-white/5 rounded-2xl">
                          <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Establishment Date</p>
                          <p className="font-bold text-lg">{selectedGarden.startedDate}</p>
                       </div>
                       <div className="p-4 bg-white/5 rounded-2xl">
                          <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Environment</p>
                          <p className="font-bold text-lg flex items-center gap-2">
                            {selectedGarden.type === 'Indoor' ? <Home size={16}/> : <Sun size={16}/>}
                            {selectedGarden.type}
                          </p>
                       </div>
                       <div className="p-4 bg-white/5 rounded-2xl">
                          <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Description</p>
                          <p className="text-sm text-slate-300 leading-relaxed italic">"{selectedGarden.description || 'No description provided.'}"</p>
                       </div>
                    </div>
                 </Card>

                 <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem]">
                    <h4 className="font-black text-emerald-800 mb-2">Need Help?</h4>
                    <p className="text-sm text-emerald-700 mb-6 leading-relaxed">Describe any issues with this garden to our AI expert.</p>
                    <Button variant="outline" className="w-full bg-white" onClick={() => setView('troubleshoot')}>Consult AI Assistant</Button>
                 </div>
              </div>
            </div>
          </div>
        )}

        {view === 'troubleshoot' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
             <div className="text-center space-y-4 mb-12">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-sm">
                   <Stethoscope size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-800 tracking-tight">Expert Plant Advice</h2>
                <p className="text-slate-500 font-medium text-lg">Your AI-powered botanist is ready to help.</p>
             </div>
             <Card className="p-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Describe the problem</label>
                     <textarea 
                        value={aiQuery} 
                        onChange={e => setAiQuery(e.target.value)}
                        placeholder="E.g. My indoor tomato plants have small yellow spots on the lower leaves. I check the pH weekly."
                        className="w-full h-48 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:border-emerald-500 transition-all text-slate-700 resize-none leading-relaxed"
                     />
                  </div>
                  <Button onClick={handleAiTroubleshoot} disabled={isAiLoading || !aiQuery} className="w-full py-5 text-xl shadow-lg">
                    {isAiLoading ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Consulting Expert...</span>
                      </div>
                    ) : "Ask Botanist"}
                  </Button>
                </div>
             </Card>
             {aiResponse && (
               <Card className="border-emerald-200 bg-white shadow-xl animate-in slide-in-from-bottom-8">
                 <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg"><Sparkles size={20}/></div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Diagnosis & Plan</h3>
                 </div>
                 <div className="prose prose-emerald text-slate-700 leading-relaxed whitespace-pre-wrap text-lg">
                    {aiResponse}
                 </div>
               </Card>
             )}
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-md mx-auto py-20">
             <Card className="p-10 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                   <Settings size={40} className="text-slate-400" />
                </div>
                <h3 className="text-2xl font-black mb-4">Application Settings</h3>
                <p className="text-slate-500 mb-10 text-sm">Manage your data and platform preferences.</p>
                <div className="space-y-4">
                   <Button variant="danger" className="w-full py-4" onClick={() => { if(confirm("Are you sure? This deletes ALL your garden data!")) { localStorage.clear(); window.location.reload(); } }}>
                      <Trash2 size={18}/> <span>Wipe All Garden Data</span>
                   </Button>
                   <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">Version 1.2.0 (Stable)</p>
                </div>
             </Card>
          </div>
        )}
      </main>

      {/* Garden Modal (Add/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-slate-800 tracking-tight">{editingGarden ? 'Edit Garden' : 'New Garden'}</h3>
                 <button onClick={() => { setIsModalOpen(false); setEditingGarden(null); }} className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><X size={32}/></button>
              </div>
              <form onSubmit={saveGarden} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Garden Name</label>
                    <input name="gname" defaultValue={editingGarden?.name} placeholder="E.g. South Balcony" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Environment</label>
                       <select name="gtype" defaultValue={editingGarden?.type || 'Indoor'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold">
                          <option>Indoor</option>
                          <option>Outdoor</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Start Date</label>
                       <input name="gdate" type="date" defaultValue={editingGarden?.startedDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold" />
                    </div>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Notes / Description</label>
                    <textarea name="gdesc" defaultValue={editingGarden?.description} placeholder="Briefly describe this setup..." className="w-full h-28 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 resize-none transition-all" />
                 </div>
                 <Button type="submit" className="w-full py-5 text-xl shadow-lg mt-4">{editingGarden ? 'Update' : 'Initialize'} Garden</Button>
              </form>
           </div>
        </div>
      )}

      {/* Plant Modal (Add/Edit) */}
      {isPlantModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black text-slate-800 tracking-tight">{editingPlant ? 'Edit Plant' : 'Log New Plant'}</h3>
                 <button onClick={() => { setIsPlantModalOpen(false); setEditingPlant(null); }} className="p-2 text-slate-300 hover:text-slate-600 transition-colors"><X size={32}/></button>
              </div>
              <form onSubmit={savePlant} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Plant Name</label>
                    <input name="pname" defaultValue={editingPlant?.plant.name} placeholder="E.g. Basil" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Variety</label>
                    <input name="pvariety" defaultValue={editingPlant?.plant.variety} placeholder="E.g. Genovese" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">Planted Date</label>
                    <input name="pdate" type="date" defaultValue={editingPlant?.plant.plantedDate || new Date().toISOString().split('T')[0]} required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all font-bold" />
                 </div>
                 <Button type="submit" className="w-full py-5 text-xl shadow-lg mt-4">{editingPlant ? 'Save Changes' : 'Add to Garden'}</Button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}

// Utility Icons
const ChevronLeft = ({ size, className }: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m15 18-6-6 6-6"/></svg>;
