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
  Search,
  FlaskConical,
  Droplets,
  Trash2,
  Edit2,
  ArrowRight,
  Zap,
  Leaf,
  Settings,
  Heart,
  Star,
  Lock,
  BookOpen,
  Download,
  Upload,
  BarChart3,
  TrendingUp,
  PieChart,
  Scale,
  Activity,
  History,
  Clock,
  DollarSign,
  PiggyBank,
  Sparkles,
  Timer,
  Camera,
  Thermometer,
  Waves
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

// --- Lifecycle Timeline ---

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

// --- Guide View Component ---

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

  const handleWizard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const els = f.elements as any;
    setLoading(true);
    try {
      const res = await generateStarterKit(els.budget.value, els.space.value, els.goal.value);
      setGuide(res);
      setWizardMode(false);
      setActiveTopic("AI Starter Kit Plan");
    } finally { setLoading(false); }
  };

  const showMenu = !guide && !wizardMode && !loading;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {showMenu && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setWizardMode(true)} 
            className="col-span-full p-8 bg-emerald-600 text-white rounded-[2.5rem] shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all flex flex-col items-center text-center space-y-4 group"
          >
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles size={32}/>
            </div>
            <div>
              <h3 className="text-2xl font-black">AI Starter Kit Wizard</h3>
              <p className="text-emerald-50 text-sm font-medium opacity-80">Tell us your budget and space, we'll build your shopping list.</p>
            </div>
          </button>

          {['Kratky Method', 'Nutrient Mixing 101', 'pH Balance Guide', 'Lighting (PAR/PPFD)', 'DWC Setup', 'NFT Systems'].map(t => (
            <button 
              key={t} 
              onClick={() => fetchG(t)} 
              className="p-6 bg-white border border-slate-100 rounded-3xl font-bold hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm flex items-center justify-between group"
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                  <BookOpen size={20} />
                </div>
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
          <p className="text-slate-500 font-bold text-lg">Consulting Grow Master AI...</p>
        </div>
      )}

      {(guide || wizardMode) && !loading && (
        <div className="space-y-6">
          <button 
            onClick={() => { setGuide(null); setWizardMode(false); setActiveTopic(null); }} 
            className="flex items-center space-x-2 text-slate-400 hover:text-emerald-600 font-bold transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Wiki Menu</span>
          </button>

          {wizardMode ? (
            <Card title="Starter Kit AI Wizard">
              <form onSubmit={handleWizard} className="space-y-6">
                 <p className="text-slate-500 font-medium">Customize your first indoor farm with professional AI advice.</p>
                 <div className="space-y-4">
                   <div>
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Total Budget ($)</label>
                     <input name="budget" placeholder="e.g. $100" required className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all" />
                   </div>
                   <div>
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">Available Space</label>
                     <input name="space" placeholder="e.g. 2x2ft closet, Windowsill" required className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all" />
                   </div>
                   <div>
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">What do you want to grow?</label>
                     <input name="goal" placeholder="e.g. Basil and Spinach" required className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all" />
                   </div>
                 </div>
                 <Button type="submit" className="w-full py-5 text-lg shadow-xl shadow-emerald-100">Generate Custom Plan</Button>
              </form>
            </Card>
          ) : (
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center space-x-4 mb-8">
                 <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <BookOpen size={28} />
                 </div>
                 <h2 className="text-3xl font-black text-slate-800 tracking-tight">{activeTopic}</h2>
              </div>
              <div className="prose prose-emerald p-2 text-slate-600 leading-relaxed max-w-none whitespace-pre-wrap">
                {guide}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Troubleshoot Component ---

const TroubleshootView = () => {
  const [diag, setDiag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: any) => {
    const f = e.target.files[0];
    if (f) {
      const r = new FileReader();
      r.onloadend = () => setImageBase64(r.result as string);
      r.readAsDataURL(f);
    }
  };

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
        <div className="flex items-center space-x-6 mb-10">
          <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center shadow-sm">
            <Stethoscope size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">AI Plant Doctor</h2>
            <p className="text-slate-500 text-lg">Pinpoint issues with precision using Gemini Pro.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <textarea 
              name="desc"
              className="w-full h-52 p-8 bg-slate-50/50 rounded-[2rem] border-2 border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-700 text-lg leading-relaxed placeholder:text-slate-300 resize-none shadow-inner"
              placeholder="Ex: My lettuce leaves are turning yellow at the edges and feel soft, roots look brownish..."
            ></textarea>
            <div className="absolute bottom-6 right-8 flex items-center gap-4">
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImage} />
              {imageBase64 && (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-emerald-500">
                  <img src={imageBase64} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setImageBase64(null)} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center"><X size={12}/></button>
                </div>
              )}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="p-4 bg-white border-2 border-slate-100 text-slate-400 rounded-2xl hover:border-emerald-500 hover:text-emerald-500 transition-all"><Camera size={24}/></button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full py-5 text-lg shadow-xl shadow-emerald-100">
            {loading ? "Analyzing Health Markers..." : "Get Diagnosis"}
          </Button>
        </form>
      </div>

      {diag && (
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-emerald-100 animate-in zoom-in-95 duration-300">
           <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Sparkles size={20}/></div>
              <h3 className="text-2xl font-black text-slate-800">Diagnosis Report</h3>
           </div>
           <div className="prose prose-emerald prose-lg max-w-none text-slate-600 whitespace-pre-wrap leading-relaxed">
              {diag}
           </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [dailyTip, setDailyTipStr] = useState<string>("Loading your daily grower tip...");

  // Data State
  const [setups, setSetups] = useState<Setup[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [inventory, setInventory] = useState<{equipment: Equipment[], ingredients: Ingredient[]}>({ equipment: [], ingredients: [] });
  const [tasks, setTasks] = useState<Task[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'setup' | 'plant' | 'equip' | 'ingred' | 'harvest' | 'water' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Persistence
  useEffect(() => {
    const s = localStorage.getItem('hydro_setups');
    const p = localStorage.getItem('hydro_plants');
    const i = localStorage.getItem('hydro_inventory');
    const t = localStorage.getItem('hydro_tasks');
    if (s) setSetups(JSON.parse(s));
    if (p) setPlants(JSON.parse(p));
    if (i) setInventory(JSON.parse(i));
    if (t) setTasks(JSON.parse(t));
    getDailyTip().then(setDailyTipStr).catch(() => setDailyTipStr("Maintain water temps between 18-22°C for optimal root health."));
  }, []);

  useEffect(() => {
    localStorage.setItem('hydro_setups', JSON.stringify(setups));
    localStorage.setItem('hydro_plants', JSON.stringify(plants));
    localStorage.setItem('hydro_inventory', JSON.stringify(inventory));
    localStorage.setItem('hydro_tasks', JSON.stringify(tasks));
  }, [setups, plants, inventory, tasks]);

  // Handlers
  const addSetup = (data: any) => setSetups([...setups, { ...data, id: Date.now().toString(), waterLogs: [] }]);
  const updateSetup = (id: string, data: any) => setSetups(setups.map(s => s.id === id ? { ...s, ...data } : s));
  const deleteSetup = (id: string) => confirm("Delete system?") && setSetups(setups.filter(s => s.id !== id));

  const addPlant = (data: any) => setPlants([...plants, { ...data, id: Date.now().toString(), harvestRecords: [] }]);
  const updatePlant = (id: string, data: any) => setPlants(plants.map(p => p.id === id ? { ...p, ...data } : p));
  const deletePlant = (id: string) => confirm("Delete plant?") && setPlants(plants.filter(p => p.id !== id));

  const addWaterLog = (setupId: string, log: any) => {
    setSetups(setups.map(s => s.id === setupId ? { ...s, waterLogs: [...(s.waterLogs || []), { id: Date.now().toString(), ...log }] } : s));
  };

  const addHarvest = (plantId: string, h: any) => {
    setPlants(plants.map(p => p.id === plantId ? { ...p, harvestRecords: [...(p.harvestRecords || []), { id: Date.now().toString(), ...h }] } : p));
  };

  const handlePredict = async (form: any) => {
    const name = form.pname?.value;
    const variety = form.pvar?.value;
    const setupId = form.pId?.value;
    const plantedDate = form.pdate?.value;
    if (!name) return alert("Enter species name first.");
    setIsPredicting(true);
    try {
      const system = setups.find(s => s.id === setupId)?.type || 'Hydroponic';
      const proj = await getPlantProjections(name, variety, system);
      if (proj) {
        const base = new Date(plantedDate || new Date());
        const addD = (d: number) => {
          const date = new Date(base);
          date.setDate(date.getDate() + d);
          return date.toISOString().split('T')[0];
        };
        form.pgerm_proj.value = addD(proj.daysToGerminate);
        form.pflow_proj.value = addD(proj.daysToFlower);
        form.phrv_proj.value = addD(proj.daysToHarvest);
      }
    } catch (e) {
      alert("AI Service unreachable.");
    } finally {
      setIsPredicting(false);
    }
  };

  // Metrics
  const totalYield = useMemo(() => plants.reduce((s, p) => s + (p.harvestRecords?.reduce((hS, h) => hS + h.amount, 0) || 0), 0), [plants]);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 space-y-8 shrink-0">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Sprout size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight text-emerald-600">HydroMaster</span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <SidebarItem id="setups" icon={Layers} label="Systems" active={view === 'setups'} onClick={() => setView('setups')} />
          <SidebarItem id="plants" icon={Sprout} label="My Plants" active={view === 'plants'} onClick={() => setView('plants')} />
          <SidebarItem id="inventory" icon={FlaskConical} label="Inventory" active={view === 'inventory'} onClick={() => setView('inventory')} />
          <SidebarItem id="calendar" icon={Calendar} label="Schedule" active={view === 'calendar'} onClick={() => setView('calendar')} />
          <SidebarItem id="troubleshoot" icon={Stethoscope} label="AI Diagnosis" active={view === 'troubleshoot'} onClick={() => setView('troubleshoot')} />
          <SidebarItem id="reports" icon={BarChart3} label="Analytics" active={view === 'reports'} onClick={() => setView('reports')} />
          <SidebarItem id="guide" icon={BookOpen} label="Growing Guide" active={view === 'guide'} onClick={() => setView('guide')} />
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <SidebarItem id="settings" icon={Settings} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 bg-slate-50">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 capitalize tracking-tight">{view}</h1>
            <p className="text-slate-500 mt-1 font-medium italic">"{dailyTip}"</p>
          </div>
          <div className="flex space-x-3">
             <Button onClick={() => { setSelectedItem(null); setModalType('setup'); setIsModalOpen(true); }} variant="outline">New System</Button>
             <Button onClick={() => { setSelectedItem(null); setModalType('plant'); setIsModalOpen(true); }} className="shadow-emerald-100">
               <Plus size={20} />
               <span>New Plant</span>
             </Button>
          </div>
        </header>

        {view === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Systems", val: setups.length, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: "Active Plants", val: plants.filter(p => p.status !== 'Harvested').length, icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: "Total Yield", val: `${totalYield}g`, icon: Scale, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: "Tasks", val: tasks.filter(t => !t.completed).length, icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50' }
              ].map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
                    <s.icon size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                    <h4 className="text-2xl font-black text-slate-800">{s.val}</h4>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card title="System Vitality Dashboard">
                  <div className="space-y-4">
                    {setups.map(s => {
                      const latest = s.waterLogs?.[s.waterLogs.length-1];
                      return (
                        <div key={s.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] gap-4">
                          <div>
                            <h5 className="font-bold text-slate-800">{s.name}</h5>
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{s.type}</p>
                          </div>
                          <div className="flex gap-6">
                            <div className="text-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase">pH</p>
                              <p className={`text-xl font-black ${latest && (latest.ph < 5.5 || latest.ph > 6.5) ? 'text-rose-500' : 'text-blue-600'}`}>{latest?.ph || '--'}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase">EC</p>
                              <p className="text-xl font-black text-amber-600">{latest?.ec || '--'}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[9px] font-black text-slate-400 uppercase">TEMP</p>
                              <p className="text-xl font-black text-emerald-600">{latest?.temp || '--'}°</p>
                            </div>
                          </div>
                          <Button variant="outline" className="text-xs py-2 px-4" onClick={() => { setSelectedItem(s); setModalType('water'); setIsModalOpen(true); }}>Add Log</Button>
                        </div>
                      );
                    })}
                    {setups.length === 0 && <p className="text-center py-10 text-slate-300 italic">No systems registered.</p>}
                  </div>
                </Card>
              </div>
              <div className="space-y-8">
                <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
                  <Sparkles className="absolute -top-6 -right-6 w-32 h-32 text-emerald-400 opacity-20 rotate-12" />
                  <div className="relative z-10">
                    <h3 className="text-xl font-black mb-4">AI Projections</h3>
                    <p className="text-emerald-50 text-sm font-medium leading-relaxed">Your data is synced with Gemini to predict harvest dates for active crops.</p>
                    <Button variant="secondary" className="mt-6 w-full bg-white text-emerald-600" onClick={() => setView('plants')}>View Forecasts</Button>
                  </div>
                </div>
                <Card title="Daily Tasks">
                   <div className="space-y-3">
                      {tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                        <div key={task.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center space-x-3">
                          <input type="checkbox" className="w-5 h-5 accent-emerald-500 rounded-lg" onChange={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: true} : t))} />
                          <span className="text-sm font-bold text-slate-700">{task.title}</span>
                        </div>
                      ))}
                      {tasks.filter(t => !t.completed).length === 0 && <p className="text-center py-6 text-slate-300 italic text-sm">Clear schedule!</p>}
                   </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {view === 'plants' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {plants.map(p => (
              <Card key={p.id} title={p.name} action={<div className="flex gap-2"><button onClick={() => { setSelectedItem(p); setModalType('plant'); setIsModalOpen(true); }} className="text-slate-300 hover:text-emerald-500 transition-colors"><Edit2 size={16}/></button><button onClick={() => deletePlant(p.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button></div>}>
                <div className="mb-4 flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${p.status === 'Healthy' ? 'bg-emerald-50 text-emerald-600' : p.status === 'Harvested' ? 'bg-slate-100 text-slate-500' : 'bg-rose-50 text-rose-600'}`}>{p.status}</span>
                  <span className="text-[10px] text-slate-400 font-bold">{p.variety}</span>
                </div>
                <div className="bg-slate-50/50 rounded-[1.5rem] p-5 border border-slate-100 mb-6">
                  <PlantLifecycleTimeline plant={p} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-xs py-2" onClick={() => { setSelectedItem(p); setModalType('harvest'); setIsModalOpen(true); }}>Log Yield</Button>
                  <Button variant="secondary" className="px-4 py-2" onClick={() => { setView('troubleshoot'); }}><Stethoscope size={16}/></Button>
                </div>
              </Card>
            ))}
            <button onClick={() => { setSelectedItem(null); setModalType('plant'); setIsModalOpen(true); }} className="h-full min-h-[300px] border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 hover:border-emerald-100 hover:text-emerald-200 transition-all group">
               <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Plus size={32}/></div>
               <span className="font-black uppercase tracking-widest text-xs">Add New Seedling</span>
            </button>
          </div>
        )}

        {view === 'setups' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
             {setups.map(s => (
               <Card key={s.id} title={s.name} action={<div className="flex gap-2"><button onClick={() => { setSelectedItem(s); setModalType('setup'); setIsModalOpen(true); }} className="text-slate-300 hover:text-emerald-500"><Edit2 size={16}/></button><button onClick={() => deleteSetup(s.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button></div>}>
                  <div className="flex items-center space-x-2 mb-6">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{s.type}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{s.location}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Reservoir Size</p>
                      <p className="font-bold text-slate-700">{s.reservoirSize}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Investment</p>
                      <p className="font-bold text-slate-700">${s.cost || 0}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" onClick={() => { setSelectedItem(s); setModalType('water'); setIsModalOpen(true); }}>Manage Lab Parameters</Button>
               </Card>
             ))}
          </div>
        )}

        {view === 'troubleshoot' && <TroubleshootView />}
        {view === 'guide' && <GuideView />}

        {view === 'inventory' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex gap-2">
                <Button onClick={() => { setSelectedItem(null); setModalType('equip'); setIsModalOpen(true); }}>Add Hardware</Button>
                <Button variant="secondary" onClick={() => { setSelectedItem(null); setModalType('ingred'); setIsModalOpen(true); }}>Add Supply</Button>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Growth Hardware">
                   <div className="space-y-3">
                      {inventory.equipment.map(e => (
                        <div key={e.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm group">
                          <div>
                            <p className="font-bold text-slate-800">{e.name}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{e.category} • ${e.cost || 0}</p>
                          </div>
                          <button onClick={() => setInventory({...inventory, equipment: inventory.equipment.filter(x => x.id !== e.id)})} className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      ))}
                      {inventory.equipment.length === 0 && <p className="text-center py-10 text-slate-300 italic">No hardware logged.</p>}
                   </div>
                </Card>
                <Card title="Nutrients & Treatments">
                   <div className="space-y-3">
                      {inventory.ingredients.map(i => (
                        <div key={i.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm">
                           <div>
                            <p className="font-bold text-slate-800">{i.name}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{i.brand} • {i.quantity}{i.unit}</p>
                          </div>
                          <button onClick={() => setInventory({...inventory, ingredients: inventory.ingredients.filter(x => x.id !== i.id)})} className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      ))}
                      {inventory.ingredients.length === 0 && <p className="text-center py-10 text-slate-300 italic">Stock up!</p>}
                   </div>
                </Card>
             </div>
          </div>
        )}

        {view === 'calendar' && (
          <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
             <form onSubmit={e => { e.preventDefault(); const f = e.currentTarget; const t = (f as any).task.value; const d = (f as any).date.value; if(!t || !d) return; setTasks([...tasks, {id: Date.now().toString(), title: t, date: d, completed: false, priority: 'Medium'}]); (f as any).reset(); }} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-4">
                <input name="task" placeholder="Add a task (e.g. Check pH, Flush Reservoir)" required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all" />
                <div className="flex gap-2">
                   <input name="date" type="date" required className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500 transition-all" />
                   <Button type="submit">Schedule</Button>
                </div>
             </form>
             <div className="space-y-3">
                {tasks.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => (
                  <div key={t.id} className={`p-5 bg-white border border-slate-100 rounded-2xl flex items-center justify-between shadow-sm ${t.completed ? 'opacity-50 grayscale' : ''}`}>
                     <div className="flex items-center space-x-4">
                        <input type="checkbox" checked={t.completed} className="w-6 h-6 accent-emerald-500 rounded-lg" onChange={() => setTasks(tasks.map(x => x.id === t.id ? {...x, completed: !x.completed} : x))} />
                        <div>
                           <p className={`font-bold text-slate-800 ${t.completed ? 'line-through' : ''}`}>{t.title}</p>
                           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{t.date}</p>
                        </div>
                     </div>
                     <button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="text-slate-200 hover:text-rose-500 transition-colors"><Trash2 size={16}/></button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {view === 'reports' && (
           <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card title="Investment Overview">
                    <p className="text-4xl font-black text-slate-800">${(setups.reduce((s,x) => s+(x.cost||0),0) + plants.reduce((s,x) => s+(x.cost||0),0) + inventory.equipment.reduce((s,x) => s+(x.cost||0),0)).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-2">Total platform spend</p>
                 </Card>
                 <Card title="Productivity Rate">
                    <p className="text-4xl font-black text-emerald-600">{plants.length > 0 ? (totalYield / plants.length).toFixed(1) : 0}g</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-2">Grams per seedling</p>
                 </Card>
                 <Card title="Activity Index">
                    <p className="text-4xl font-black text-blue-600">{setups.length > 0 ? (plants.length / setups.length).toFixed(1) : 0}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-2">Plants per system</p>
                 </Card>
              </div>
           </div>
        )}

        {view === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
             <Card title="Data Management">
                <div className="flex flex-col gap-4">
                   <Button variant="outline" className="justify-start" onClick={() => {
                      const data = JSON.stringify({ setups, plants, inventory, tasks });
                      const blob = new Blob([data], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `hydromaster-backup-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                   }}><Download size={18}/><span>Export System Data</span></Button>
                   <Button variant="secondary" className="justify-start" onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.onchange = (e: any) => {
                         const f = e.target.files[0];
                         const r = new FileReader();
                         r.onload = (ev: any) => {
                            const d = JSON.parse(ev.target.result);
                            if(d.setups) setSetups(d.setups);
                            if(d.plants) setPlants(d.plants);
                            if(d.inventory) setInventory(d.inventory);
                            if(d.tasks) setTasks(d.tasks);
                            alert("Import successful!");
                         };
                         r.readAsText(f);
                      };
                      input.click();
                   }}><Upload size={18}/><span>Import System Data</span></Button>
                   <Button variant="danger" className="justify-start" onClick={() => {
                      if(confirm("DANGER: This will delete ALL data. Proceed?")) {
                         setSetups([]); setPlants([]); setInventory({equipment:[], ingredients:[]}); setTasks([]);
                         localStorage.clear();
                         alert("Reset complete.");
                      }
                   }}><Trash2 size={18}/></Button>
                </div>
             </Card>
          </div>
        )}
      </main>

      {/* Modals */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={(modalType || '').toUpperCase()}>
         {modalType === 'setup' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget as any; const d = { name: f.sname.value, type: f.stype.value, startDate: f.sdate.value, reservoirSize: f.ssize.value, location: f.sloc.value, notes: f.snotes.value, cost: Number(f.scost.value) }; selectedItem ? updateSetup(selectedItem.id, d) : addSetup(d); setIsModalOpen(false); }}>
             <input name="sname" placeholder="System Name" required defaultValue={selectedItem?.name} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500" />
             <div className="flex gap-2">
               <select name="stype" defaultValue={selectedItem?.type || "Hydroponic"} className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none"><option>Hydroponic</option><option>Kratky</option><option>DWC</option><option>NFT</option><option>Aquaponic</option></select>
               <input name="scost" type="number" step="0.01" placeholder="Cost ($)" defaultValue={selectedItem?.cost} className="w-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
             </div>
             <input name="ssize" placeholder="Reservoir (e.g. 5 Gallons, 20L)" defaultValue={selectedItem?.reservoirSize} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
             <input name="sdate" type="date" defaultValue={selectedItem?.startDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
             <input name="sloc" placeholder="Location" defaultValue={selectedItem?.location} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
             <textarea name="snotes" placeholder="Notes..." defaultValue={selectedItem?.notes} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none h-24 resize-none" />
             <Button type="submit" className="w-full py-4 text-lg">{selectedItem ? "Update" : "Create"} System</Button>
           </form>
         )}

         {modalType === 'water' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget as any; addWaterLog(selectedItem.id, { date: new Date().toISOString(), ph: Number(f.ph.value), ec: Number(f.ec.value), temp: Number(f.temp.value), notes: f.wnotes.value }); setIsModalOpen(false); }}>
             <p className="text-xs text-slate-500 mb-4">Logging for <strong>{selectedItem?.name}</strong></p>
             <div className="grid grid-cols-3 gap-2">
               <div><label className="text-[10px] uppercase font-black text-slate-400">pH</label><input name="ph" type="number" step="0.1" required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500" placeholder="6.0" /></div>
               <div><label className="text-[10px] uppercase font-black text-slate-400">EC/PPM</label><input name="ec" type="number" step="0.1" required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-500" placeholder="1.2" /></div>
               <div><label className="text-[10px] uppercase font-black text-slate-400">Temp (°C)</label><input name="temp" type="number" step="0.1" required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500" placeholder="22" /></div>
             </div>
             <textarea name="wnotes" placeholder="Additives or observations..." className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none h-24 resize-none" />
             <Button type="submit" className="w-full py-4">Save Parameters</Button>
           </form>
         )}

         {modalType === 'plant' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget as any; const d = { 
             setupId: f.pId.value, 
             name: f.pname.value, 
             variety: f.pvar.value, 
             plantedDate: f.pdate.value, 
             germinatedDate: f.pgerm.value || undefined,
             floweredDate: f.pflow.value || undefined,
             projectedGerminationDate: f.pgerm_proj.value || undefined,
             projectedFloweringDate: f.pflow_proj.value || undefined,
             projectedHarvestDate: f.phrv_proj.value || undefined,
             status: f.pstatus.value,
             lastChecked: new Date().toISOString(), 
             notes: f.pnotes.value,
             cost: Number(f.pcost.value)
           }; selectedItem ? updatePlant(selectedItem.id, d) : addPlant(d); setIsModalOpen(false); }}>
             <div className="flex gap-2">
                <select name="pId" defaultValue={selectedItem?.setupId} className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none"><option value="">Standalone</option>{setups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                <input name="pcost" type="number" step="0.01" placeholder="Seed Cost ($)" defaultValue={selectedItem?.cost} className="w-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
             </div>
             <div className="flex gap-2">
               <input name="pname" placeholder="Species (e.g. Basil)" required defaultValue={selectedItem?.name} className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-emerald-500" />
               <Button variant="accent" onClick={() => handlePredict(document.querySelector('form'))} disabled={isPredicting} className="p-4 rounded-2xl w-14 h-14 shrink-0">
                 {isPredicting ? <div className="animate-spin h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full" /> : <Sparkles size={20} />}
               </Button>
             </div>
             <input name="pvar" placeholder="Variety" defaultValue={selectedItem?.variety} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] uppercase font-black text-slate-400">Planted</label><input name="pdate" type="date" defaultValue={selectedItem?.plantedDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" /></div>
               <div><label className="text-[10px] uppercase font-black text-slate-400">Germinated</label><input name="pgerm" type="date" defaultValue={selectedItem?.germinatedDate} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" /></div>
             </div>
             <div className="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100 space-y-4">
               <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Sparkles size={10} /> Forecasted Milestones</h4>
               <div className="grid grid-cols-3 gap-2">
                 <div><label className="text-[8px] uppercase font-black text-slate-400">Sprout</label><input name="pgerm_proj" type="date" defaultValue={selectedItem?.projectedGerminationDate} className="w-full p-2 bg-white rounded-xl border outline-none text-[10px]" /></div>
                 <div><label className="text-[8px] uppercase font-black text-slate-400">Flower</label><input name="pflow_proj" type="date" defaultValue={selectedItem?.projectedFloweringDate} className="w-full p-2 bg-white rounded-xl border outline-none text-[10px]" /></div>
                 <div><label className="text-[8px] uppercase font-black text-slate-400">Harvest</label><input name="phrv_proj" type="date" defaultValue={selectedItem?.projectedHarvestDate} className="w-full p-2 bg-white rounded-xl border outline-none text-[10px]" /></div>
               </div>
             </div>
             <select name="pstatus" defaultValue={selectedItem?.status || "Healthy"} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none"><option>Healthy</option><option>Needs Attention</option><option>Struggling</option><option>Harvested</option></select>
             <textarea name="pnotes" placeholder="Observations..." defaultValue={selectedItem?.notes} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none h-24 resize-none" />
             <Button type="submit" className="w-full py-4 text-lg">{selectedItem ? "Update" : "Log"} Plant</Button>
           </form>
         )}

         {modalType === 'harvest' && (
           <div className="space-y-6">
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget as any; addHarvest(selectedItem.id, { amount: Number(f.hamount.value), unit: f.hunit.value, date: f.hdate.value }); (f as any).reset(); }}>
                <div className="flex gap-2">
                  <input name="hamount" type="number" step="0.1" placeholder="Yield Amount" required className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
                  <select name="hunit" className="w-24 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none"><option>g</option><option>kg</option><option>oz</option></select>
                </div>
                <input name="hdate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
                <Button type="submit" className="w-full py-4">Save Harvest Record</Button>
              </form>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                 {selectedItem?.harvestRecords?.map((h: HarvestRecord) => (
                   <div key={h.id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-sm border border-slate-100">
                     <span className="font-bold">{h.amount}{h.unit}</span>
                     <span className="text-slate-400 text-xs">{h.date}</span>
                   </div>
                 ))}
              </div>
           </div>
         )}
         
         {modalType === 'equip' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget as any; setInventory({...inventory, equipment: [...inventory.equipment, {id: Date.now().toString(), name: f.ename.value, category: f.ecat.value, status: 'Active', purchaseDate: new Date().toISOString(), notes: '', cost: Number(f.ecost.value), setupId: f.esetup.value || undefined}]}); setIsModalOpen(false); }}>
             <input name="ename" placeholder="Device Name" required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
             <div className="flex gap-2">
               <select name="ecat" className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none"><option>Lighting</option><option>Pump</option><option>Monitoring</option><option>Structural</option><option>Other</option></select>
               <input name="ecost" type="number" step="0.01" placeholder="$" className="w-24 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
             </div>
             <select name="esetup" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none"><option value="">No System Link</option>{setups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
             <Button type="submit" className="w-full py-4">Log Equipment</Button>
           </form>
         )}
         
         {modalType === 'ingred' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget as any; setInventory({...inventory, ingredients: [...inventory.ingredients, {id: Date.now().toString(), name: f.iname.value, brand: f.ibrand.value, quantity: f.iqty.value, unit: f.iunit.value, purpose: f.ipurp.value, notes: '', cost: Number(f.icost.value)}]}); setIsModalOpen(false); }}>
             <input name="iname" placeholder="Supply Name" required className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
             <div className="flex gap-2">
               <input name="ibrand" placeholder="Brand" className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
               <input name="icost" type="number" step="0.01" placeholder="$" className="w-24 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
             </div>
             <div className="flex gap-2">
               <input name="iqty" placeholder="Qty" className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
               <input name="iunit" placeholder="Unit" className="w-24 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" />
             </div>
             <select name="ipurp" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none"><option>Nutrient</option><option>pH Adjuster</option><option>Additive</option><option>Water Treatment</option></select>
             <Button type="submit" className="w-full py-4">Save Supply</Button>
           </form>
         )}
      </Modal>
    </div>
  );
}
