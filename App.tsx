import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Sprout, 
  Wrench, 
  Calendar, 
  Stethoscope, 
  Plus, 
  X,
  ChevronRight,
  ChevronLeft,
  Search,
  FlaskConical,
  Droplets,
  Trash2,
  Edit2,
  ArrowRight,
  Zap,
  Leaf,
  Settings,
  BookOpen,
  Download,
  Upload,
  BarChart3,
  Scale,
  Activity,
  History,
  Sparkles,
  Timer,
  Camera,
  Thermometer,
  Waves,
  Star
} from 'lucide-react';
import { 
  ViewState, Setup, Plant, Equipment, Ingredient, Task, HarvestRecord, WaterLog 
} from './types.ts';
import { troubleshootPlant, getDailyTip, getGrowGuide, getPlantProjections, generateStarterKit } from './services/geminiService.ts';

// --- Shared UI Components ---

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
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

const Card = ({ children, title, action, className = "" }: any) => (
  <div className={`bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col ${className}`}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-6">
        {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
        {action}
      </div>
    )}
    <div className="flex-1">{children}</div>
  </div>
);

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

// --- Timeline Component ---

const PlantLifecycleTimeline = ({ plant }: { plant: Plant }) => {
  const steps = [
    { label: 'Planted', date: plant.plantedDate, icon: Sprout, actual: true },
    { label: 'Germinated', date: plant.germinatedDate || plant.projectedGerminationDate, icon: Zap, actual: !!plant.germinatedDate, projected: !plant.germinatedDate && !!plant.projectedGerminationDate },
    { label: 'Flowering', date: plant.floweredDate || plant.projectedFloweringDate, icon: Star, actual: !!plant.floweredDate, projected: !plant.floweredDate && !!plant.projectedFloweringDate },
    { label: 'Harvest Ready', date: plant.projectedHarvestDate, icon: Scale, actual: false, projected: !!plant.projectedHarvestDate },
  ].filter(s => !!s.date).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  const now = new Date().getTime();
  const start = new Date(plant.plantedDate).getTime();
  const target = plant.projectedHarvestDate ? new Date(plant.projectedHarvestDate).getTime() : now + (30 * 86400000);
  const total = Math.max(1, target - start);
  const current = Math.min(now - start, total);
  const progressPercent = Math.max(0, Math.min(100, (current / total) * 100));

  return (
    <div className="space-y-4">
      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
      </div>
      <div className="space-y-3 relative py-2">
        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100" />
        {steps.map((step, i) => (
          <div key={i} className="flex items-center space-x-4 relative z-10">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
              step.actual 
                ? 'bg-emerald-600 text-white' 
                : step.projected 
                  ? 'bg-white border-2 border-dashed border-emerald-200 text-emerald-400'
                  : 'bg-white border-2 border-slate-100 text-slate-300'
            }`}>
              <step.icon size={14} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider">{step.label}</p>
                {step.projected && <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1 rounded font-black uppercase">Projected</span>}
              </div>
              <p className="text-[9px] text-slate-400 font-bold">{new Date(step.date!).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Guide View ---

const GuideView = () => {
  const [guide, setGuide] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [wizardMode, setWizardMode] = useState(false);

  const fetchG = async (t: string) => { 
    setActiveTopic(t);
    setWizardMode(false);
    setLoading(true); 
    try { const res = await getGrowGuide(t); setGuide(res); } 
    finally { setLoading(false); } 
  };

  const showMenu = !guide && !wizardMode && !loading;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {showMenu && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button onClick={() => setWizardMode(true)} className="col-span-full p-8 bg-emerald-600 text-white rounded-[2.5rem] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex flex-col items-center text-center space-y-4 group">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform"><Sparkles size={32}/></div>
            <div>
              <h3 className="text-2xl font-black">AI Starter Kit Wizard</h3>
              <p className="text-emerald-50 text-sm font-medium opacity-80">Tell us your budget and space, we'll build your shopping list.</p>
            </div>
          </button>
          {['Kratky Method', 'Nutrient Mixing 101', 'pH Balance Guide', 'Lighting (PAR/PPFD)', 'DWC Setup', 'NFT Systems'].map(t => (
            <button key={t} onClick={() => fetchG(t)} className="p-6 bg-white border border-slate-100 rounded-3xl font-bold hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm flex items-center justify-between group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors"><BookOpen size={20} /></div>
                <span className="text-slate-700 group-hover:text-emerald-900">{t}</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-40 animate-pulse">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-slate-500 font-bold">Consulting AI Wiki...</p>
        </div>
      )}

      {(guide || wizardMode) && !loading && (
        <div className="space-y-6">
          <button onClick={() => { setGuide(null); setWizardMode(false); setActiveTopic(null); }} className="flex items-center space-x-2 text-slate-400 hover:text-emerald-600 font-bold transition-colors group">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Wiki Menu</span>
          </button>
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
             <h2 className="text-3xl font-black text-slate-800 mb-8">{activeTopic || "Starter Kit Plan"}</h2>
             <div className="prose prose-emerald text-slate-600 leading-relaxed whitespace-pre-wrap">{guide}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Troubleshoot View ---

const TroubleshootView = () => {
  const [diag, setDiag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const desc = e.target.desc.value;
    if(!desc) return;
    setLoading(true);
    try {
      const b64 = imageBase64 ? imageBase64.split(',')[1] : undefined;
      const res = await troubleshootPlant(desc, b64);
      setDiag(res);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-10 flex items-center gap-4"><Stethoscope className="text-rose-500" size={40} /> AI Plant Doctor</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea name="desc" className="w-full h-52 p-8 bg-slate-50/50 rounded-[2rem] border-2 border-slate-100 focus:border-emerald-500 outline-none text-slate-700 text-lg resize-none" placeholder="Describe the symptoms..."></textarea>
          <Button type="submit" disabled={loading} className="w-full py-5 text-lg">{loading ? "Analyzing..." : "Get Diagnosis"}</Button>
        </form>
      </div>
      {diag && <Card title="AI Diagnosis Report" className="bg-white p-10 rounded-[2.5rem] border-emerald-100"><div className="prose prose-emerald text-slate-600 whitespace-pre-wrap">{diag}</div></Card>}
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [dailyTip, setDailyTipStr] = useState<string>("Loading your daily grower tip...");
  const [setups, setSetups] = useState<Setup[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [inventory, setInventory] = useState<{equipment: Equipment[], ingredients: Ingredient[]}>({ equipment: [], ingredients: [] });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'setup' | 'plant' | 'water' | 'harvest' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem('hydro_setups');
    if (s) setSetups(JSON.parse(s));
    getDailyTip().then(setDailyTipStr).catch(() => {});
  }, []);

  const handlePredict = async (form: any) => {
    const name = form.pname?.value;
    if (!name) return alert("Enter species name.");
    setIsPredicting(true);
    try {
      const proj = await getPlantProjections(name, "", "Hydroponic");
      if (proj) {
        const base = new Date();
        const addD = (d: number) => {
          const date = new Date(base);
          date.setDate(date.getDate() + d);
          return date.toISOString().split('T')[0];
        };
        form.pgerm_proj.value = addD(proj.daysToGerminate);
        form.pflow_proj.value = addD(proj.daysToFlower);
        form.phrv_proj.value = addD(proj.daysToHarvest);
      } else {
        alert("AI could not determine milestones for this species.");
      }
    } catch (e) {
      alert("AI Service currently unavailable.");
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 space-y-8 shrink-0">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Sprout size={24} /></div>
          <span className="text-2xl font-black text-emerald-600">HydroMaster</span>
        </div>
        <nav className="flex-1 space-y-2 overflow-y-auto">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <SidebarItem id="setups" icon={Layers} label="Systems" active={view === 'setups'} onClick={() => setView('setups')} />
          <SidebarItem id="plants" icon={Sprout} label="My Plants" active={view === 'plants'} onClick={() => setView('plants')} />
          <SidebarItem id="troubleshoot" icon={Stethoscope} label="AI Diagnosis" active={view === 'troubleshoot'} onClick={() => setView('troubleshoot')} />
          <SidebarItem id="guide" icon={BookOpen} label="Growing Guide" active={view === 'guide'} onClick={() => setView('guide')} />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 bg-slate-50">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 capitalize tracking-tight">{view}</h1>
            <p className="text-slate-500 mt-1 italic font-medium">"{dailyTip}"</p>
          </div>
          <Button onClick={() => { setSelectedItem(null); setModalType('plant'); setIsModalOpen(true); }}><Plus size={20} /><span>New Plant</span></Button>
        </header>

        {view === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-2">
              <Card title="Active Systems">
                <div className="space-y-4">
                  {setups.map(s => (
                    <div key={s.id} className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] flex justify-between items-center">
                      <div><h5 className="font-bold text-slate-800">{s.name}</h5><p className="text-[10px] text-slate-400 uppercase font-black">{s.type}</p></div>
                      <Button variant="outline" className="text-xs" onClick={() => { setSelectedItem(s); setModalType('water'); setIsModalOpen(true); }}>Log Lab</Button>
                    </div>
                  ))}
                  {setups.length === 0 && <p className="text-center py-10 text-slate-300 italic">No systems registered yet.</p>}
                </div>
              </Card>
            </div>
            <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 flex flex-col justify-between">
              <div><h3 className="text-xl font-black mb-4">AI Projections</h3><p className="text-emerald-50 text-sm">Automated harvest dates powered by Gemini AI.</p></div>
              <Button variant="secondary" className="w-full bg-white text-emerald-600 mt-6" onClick={() => setView('plants')}>View Forecasts</Button>
            </div>
          </div>
        )}

        {view === 'plants' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {plants.map(p => (
              <Card key={p.id} title={p.name}><PlantLifecycleTimeline plant={p} /></Card>
            ))}
            <button onClick={() => { setSelectedItem(null); setModalType('plant'); setIsModalOpen(true); }} className="h-64 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 hover:border-emerald-100 hover:text-emerald-200 transition-all group">
              <Plus size={32} className="group-hover:scale-110 transition-transform mb-2" />
              <span className="font-black uppercase tracking-widest text-xs">Add Seedling</span>
            </button>
          </div>
        )}

        {view === 'troubleshoot' && <TroubleshootView />}
        {view === 'guide' && <GuideView />}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={(modalType || '').toUpperCase()}>
        {modalType === 'plant' && (
          <form className="space-y-4" onSubmit={e => { 
            e.preventDefault(); 
            const f = e.currentTarget as any; 
            // Fix: Adding missing properties (setupId, lastChecked, notes) to satisfy the Plant interface.
            const d: Plant = { 
              id: Date.now().toString(), 
              setupId: '', 
              name: f.pname.value, 
              variety: f.pvar.value, 
              plantedDate: f.pdate.value, 
              projectedGerminationDate: f.pgerm_proj.value, 
              projectedFloweringDate: f.pflow_proj.value, 
              projectedHarvestDate: f.phrv_proj.value, 
              status: 'Healthy', 
              lastChecked: new Date().toISOString().split('T')[0],
              notes: '',
              harvestRecords: [] 
            }; 
            setPlants([...plants, d]); 
            setIsModalOpen(false); 
          }}>
            <div className="flex gap-2">
              <input name="pname" placeholder="Species (e.g. Basil)" required className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
              <Button variant="accent" onClick={() => handlePredict(document.querySelector('form'))} disabled={isPredicting} className="p-4 rounded-2xl w-14 h-14 shrink-0">
                {isPredicting ? <div className="animate-spin h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full" /> : <Sparkles size={20} />}
              </Button>
            </div>
            <input name="pvar" placeholder="Variety" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
            <input name="pdate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
            <div className="grid grid-cols-3 gap-2">
              <div><label className="text-[8px] uppercase font-black text-slate-400">Sprout</label><input name="pgerm_proj" type="date" className="w-full p-2 bg-white rounded-xl border outline-none text-[10px]" /></div>
              <div><label className="text-[8px] uppercase font-black text-slate-400">Flower</label><input name="pflow_proj" type="date" className="w-full p-2 bg-white rounded-xl border outline-none text-[10px]" /></div>
              <div><label className="text-[8px] uppercase font-black text-slate-400">Harvest</label><input name="phrv_proj" type="date" className="w-full p-2 bg-white rounded-xl border outline-none text-[10px]" /></div>
            </div>
            <Button type="submit" className="w-full py-4 text-lg">Log Plant</Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
