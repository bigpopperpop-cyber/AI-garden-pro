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
  Timer
} from 'lucide-react';
import { 
  ViewState, Setup, Plant, Equipment, Ingredient, Task, HarvestRecord 
} from './types.ts';
import { troubleshootPlant, getDailyTip, getGrowGuide, getPlantProjections } from './services/geminiService.ts';

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
        <div className="p-6 max-h-[80vh] overflow-y-auto">
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

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200 font-bold' 
        : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 font-bold'
    }`}
  >
    <Icon size={22} className={active ? "scale-110" : ""} />
    <span className="truncate">{label}</span>
  </button>
);

const SimpleBarChart = ({ data }: { data: { label: string, value: number }[] }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="h-64 flex items-end justify-around space-x-4 pt-10 px-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
          <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded z-20 pointer-events-none">
            {d.value}
          </div>
          <div 
            className="w-full bg-emerald-500 rounded-t-lg transition-all duration-700 ease-out hover:bg-emerald-600 cursor-help"
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          <span className="text-[9px] font-bold text-slate-400 mt-2 rotate-45 origin-left whitespace-nowrap">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// --- Lifecycle Timeline ---

const PlantLifecycleTimeline = ({ plant }: { plant: Plant }) => {
  const steps = [
    { label: 'Planted', date: plant.plantedDate, icon: Sprout, actual: true },
    { label: 'Germinated', date: plant.germinatedDate || plant.projectedGerminationDate, icon: Zap, actual: !!plant.germinatedDate, projected: !plant.germinatedDate && !!plant.projectedGerminationDate },
    { label: 'Flowering', date: plant.floweredDate || plant.projectedFloweringDate, icon: Star, actual: !!plant.floweredDate, projected: !plant.floweredDate && !!plant.projectedFloweringDate },
    { label: 'Harvest Ready', date: plant.projectedHarvestDate, icon: Scale, actual: false, projected: !!plant.projectedHarvestDate },
  ].filter(s => s.date).sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());

  return (
    <div className="space-y-4 relative py-2">
      <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-100" />
      {steps.map((step, i) => (
        <div key={i} className="flex items-center space-x-4 relative z-10">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
            step.actual 
              ? 'bg-emerald-600 text-white' 
              : step.projected 
                ? 'bg-white border-2 border-dashed border-emerald-200 text-emerald-400'
                : 'bg-white border-2 border-slate-100 text-slate-300'
          }`}>
            <step.icon size={16} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-xs font-black text-slate-800">{step.label}</p>
              {step.projected && <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1 rounded font-black uppercase">Projected</span>}
            </div>
            <p className="text-[10px] text-slate-400 font-bold">{new Date(step.date!).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Content Views ---

const LandingPage = ({ onEnterApp, onGoToSupport }: any) => (
  <div className="bg-white min-h-screen text-slate-900 selection:bg-emerald-100">
    <nav className="fixed top-0 w-full z-50 px-8 py-6 flex items-center justify-between glass-effect">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xl"><Sprout size={24} /></div>
        <span className="text-xl font-bold tracking-tight">HydroGrow Pro</span>
      </div>
      <div className="hidden md:flex items-center space-x-10 text-sm font-semibold text-slate-500">
        <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
        <a href="#ai" className="hover:text-emerald-600 transition-colors">AI Diagnostics</a>
        <a href="#support" onClick={(e) => { e.preventDefault(); onGoToSupport(); }} className="hover:text-emerald-600 transition-colors">Support Us</a>
      </div>
      <Button variant="dark" onClick={onEnterApp}>
        Launch App <ArrowRight size={16} className="ml-2" />
      </Button>
    </nav>
    <section className="relative pt-48 pb-32 px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
        <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest mx-auto lg:mx-0">
            <Zap size={14} /> <span>Smart Greenhouse Management</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1]">
            Plan. Grow. <span className="text-emerald-600">Harvest.</span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Intelligent tracking for soil-less farming. Log costs, estimate harvest dates with AI, and track your yield journey from seed to table.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button onClick={onEnterApp} className="px-12 py-5 text-lg">Start Growing</Button>
            <Button onClick={onGoToSupport} variant="outline" className="px-12 py-5 text-lg">Support Us</Button>
          </div>
        </div>
        <div className="lg:w-1/2 relative">
           <div className="rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-white rotate-2 shadow-emerald-200/50">
             <img src="https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&q=80&w=800" className="w-full h-auto" alt="Hydroponic setup" />
           </div>
        </div>
      </div>
    </section>
  </div>
);

const ReportsView = ({ plants, setups, inventory }: { plants: Plant[], setups: Setup[], inventory: {equipment: Equipment[], ingredients: Ingredient[]} }) => {
  const harvestSummary = useMemo(() => {
    const data: { [key: string]: number } = {};
    plants.forEach(p => {
      p.harvestRecords?.forEach(h => {
        const date = new Date(h.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        data[date] = (data[date] || 0) + Number(h.amount);
      });
    });
    return Object.entries(data).map(([label, value]) => ({ label, value }));
  }, [plants]);

  const totalHarvest = plants.reduce((sum, p) => sum + (p.harvestRecords?.reduce((hSum, h) => hSum + Number(h.amount), 0) || 0), 0);
  const totalInvestment = setups.reduce((s, x) => s + (x.cost || 0), 0) + plants.reduce((s, x) => s + (x.cost || 0), 0) + inventory.equipment.reduce((s, x) => s + (x.cost || 0), 0) + inventory.ingredients.reduce((s, x) => s + (x.cost || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-emerald-600 text-white text-center p-6 border-none shadow-xl">
          <Scale size={24} className="mx-auto mb-4 text-emerald-200" />
          <p className="text-emerald-100 font-bold uppercase tracking-widest text-[10px]">Total Yield</p>
          <h2 className="text-4xl font-black mt-1">{totalHarvest}g</h2>
        </Card>
        <Card className="bg-slate-900 text-white text-center p-6 border-none shadow-xl">
          <DollarSign size={24} className="mx-auto mb-4 text-emerald-400" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Spent</p>
          <h2 className="text-4xl font-black mt-1">${totalInvestment.toFixed(2)}</h2>
        </Card>
        <Card title="Upcoming Projections" className="lg:col-span-2">
           <div className="space-y-2">
             {plants.filter(p => p.projectedHarvestDate && p.status !== 'Harvested').sort((a,b) => new Date(a.projectedHarvestDate!).getTime() - new Date(b.projectedHarvestDate!).getTime()).slice(0, 3).map(p => (
               <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                 <span className="font-bold text-slate-700 text-sm">{p.name}</span>
                 <div className="flex items-center space-x-2 text-emerald-600 font-black text-xs">
                   <Timer size={12} />
                   <span>Harvest by {new Date(p.projectedHarvestDate!).toLocaleDateString()}</span>
                 </div>
               </div>
             ))}
             {plants.length === 0 && <p className="text-slate-300 italic text-center py-4 text-xs">No projections available.</p>}
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Yield Trends">
          {harvestSummary.length > 0 ? <SimpleBarChart data={harvestSummary} /> : <div className="h-64 flex items-center justify-center text-slate-300 italic">No data yet</div>}
        </Card>
        <Card title="Project Summary">
          <div className="space-y-4">
             {setups.map(s => {
               const pCosts = plants.filter(p => p.setupId === s.id).reduce((sum, x) => sum + (x.cost || 0), 0);
               const total = (s.cost || 0) + pCosts;
               return (
                 <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                   <span className="font-black text-slate-800">{s.name}</span>
                   <span className="font-black text-xl text-emerald-600">${total.toFixed(2)}</span>
                 </div>
               );
             })}
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- App Root ---

export default function App() {
  const [mode, setMode] = useState<'website' | 'platform'>('website');
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dailyTip, setDailyTip] = useState<string>("Loading your grower intelligence...");
  const [isPredicting, setIsPredicting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Navigation
  const navigateTo = (view: ViewState) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  const [setups, setSetups] = useState<Setup[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [inventory, setInventory] = useState<{equipment: Equipment[], ingredients: Ingredient[]}>({ equipment: [], ingredients: [] });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [paypalId, setPaypalId] = useState<string>('gizmooo@yahoo.com');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'setup' | 'plant' | 'equip' | 'ingred' | 'harvest' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    const s = localStorage.getItem('hydro_setups');
    const p = localStorage.getItem('hydro_plants');
    const i = localStorage.getItem('hydro_inventory');
    const t = localStorage.getItem('hydro_tasks');
    const pay = localStorage.getItem('hydro_paypal');
    if (s) setSetups(JSON.parse(s));
    if (p) setPlants(JSON.parse(p));
    if (i) setInventory(JSON.parse(i));
    if (t) setTasks(JSON.parse(t));
    if (pay) setPaypalId(pay);
    getDailyTip().then(setDailyTip);
  }, []);

  useEffect(() => {
    localStorage.setItem('hydro_setups', JSON.stringify(setups));
    localStorage.setItem('hydro_plants', JSON.stringify(plants));
    localStorage.setItem('hydro_inventory', JSON.stringify(inventory));
    localStorage.setItem('hydro_tasks', JSON.stringify(tasks));
    localStorage.setItem('hydro_paypal', paypalId);
  }, [setups, plants, inventory, tasks, paypalId]);

  const addSetup = (data: any) => setSetups([...setups, { ...data, id: Date.now().toString() }]);
  const updateSetup = (id: string, data: any) => setSetups(setups.map(s => s.id === id ? { ...s, ...data } : s));
  const deleteSetup = (id: string) => {
    if(confirm("Delete system?")) {
      setSetups(setups.filter(s => s.id !== id));
      setPlants(plants.map(p => p.setupId === id ? { ...p, setupId: '' } : p));
    }
  };

  const addPlant = (data: any) => setPlants([...plants, { ...data, id: Date.now().toString(), harvestRecords: [] }]);
  const updatePlant = (id: string, data: any) => setPlants(plants.map(p => p.id === id ? { ...p, ...data } : p));
  const deletePlant = (id: string) => confirm("Delete plant log?") && setPlants(plants.filter(p => p.id !== id));

  const addHarvest = (plantId: string, record: { amount: number, unit: string, date: string }) => {
    setPlants(plants.map(p => p.id === plantId ? {
      ...p,
      harvestRecords: [...(p.harvestRecords || []), { id: Date.now().toString(), ...record }]
    } : p));
  };

  const deleteHarvest = (plantId: string, harvestId: string) => {
    setPlants(plants.map(p => p.id === plantId ? {
      ...p,
      harvestRecords: (p.harvestRecords || []).filter(h => h.id !== harvestId)
    } : p));
  };

  const addEquipment = (data: any) => setInventory(prev => ({ ...prev, equipment: [...prev.equipment, { ...data, id: Date.now().toString() }] }));
  const deleteEquipment = (id: string) => setInventory(prev => ({ ...prev, equipment: prev.equipment.filter(e => e.id !== id) }));
  
  const addIngredient = (data: any) => setInventory(prev => ({ ...prev, ingredients: [...prev.ingredients, { ...data, id: Date.now().toString() }] }));
  const deleteIngredient = (id: string) => setInventory(prev => ({ ...prev, ingredients: prev.ingredients.filter(i => i.id !== id) }));

  const addTask = (title: string, date: string) => setTasks([...tasks, { id: Date.now().toString(), title, date, completed: false, priority: 'Medium' }]);

  const handlePredict = async (form: any) => {
    const name = form.pname.value;
    const variety = form.pvar.value;
    const setupId = form.pId.value;
    const plantedDateStr = form.pdate.value;
    if (!name) return alert("Enter plant name first!");

    setIsPredicting(true);
    const system = setups.find(s => s.id === setupId)?.type || 'Hydroponic';
    const projections = await getPlantProjections(name, variety, system);
    setIsPredicting(false);

    if (projections) {
      const baseDate = new Date(plantedDateStr);
      const formatDate = (days: number) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
      };
      form.pgerm_proj.value = formatDate(projections.daysToGerminate);
      form.pflow_proj.value = formatDate(projections.daysToFlower);
      form.phrv_proj.value = formatDate(projections.daysToHarvest);
    } else {
      alert("AI couldn't estimate dates. Try a more specific name.");
    }
  };

  if (mode === 'website') return <LandingPage onEnterApp={() => { setMode('platform'); navigateTo('dashboard'); }} onGoToSupport={() => { setMode('platform'); navigateTo('support'); }} />;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setMode('website')}>
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xl"><Sprout size={24} /></div>
              <h1 className="text-xl font-black text-slate-800 tracking-tighter">HydroGrow</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl"><X/></button>
          </div>
          <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => navigateTo('dashboard')} />
            <SidebarItem icon={Layers} label="Systems" active={activeView === 'setups'} onClick={() => navigateTo('setups')} />
            <SidebarItem icon={Sprout} label="Plants" active={activeView === 'plants'} onClick={() => navigateTo('plants')} />
            <SidebarItem icon={BarChart3} label="Analytics" active={activeView === 'reports'} onClick={() => navigateTo('reports')} />
            <SidebarItem icon={BookOpen} label="Grower's Wiki" active={activeView === 'guide'} onClick={() => navigateTo('guide')} />
            <SidebarItem icon={Stethoscope} label="AI Consultant" active={activeView === 'troubleshoot'} onClick={() => navigateTo('troubleshoot')} />
            <SidebarItem icon={FlaskConical} label="Inventory" active={activeView === 'inventory'} onClick={() => navigateTo('inventory')} />
            <SidebarItem icon={Calendar} label="Calendar" active={activeView === 'calendar'} onClick={() => navigateTo('calendar')} />
            <SidebarItem icon={Settings} label="Settings" active={activeView === 'settings'} onClick={() => navigateTo('settings')} />
            <SidebarItem icon={Heart} label="Support Us" active={activeView === 'support'} onClick={() => navigateTo('support')} />
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 glass-effect sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 border-b border-slate-100 shrink-0">
           <div className="flex items-center space-x-4">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl"><Menu/></button>
             <h2 className="text-lg md:text-xl font-bold text-slate-800 truncate">{activeView.toUpperCase()}</h2>
           </div>
           <div onClick={() => navigateTo('settings')} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all overflow-hidden"><img src="https://picsum.photos/seed/user/100" alt="User" /></div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          {activeView === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Systems", val: setups.length, icon: Layers },
                  { label: "Plants", val: plants.length, icon: Sprout },
                  { label: "Total Yield", val: `${plants.reduce((s, x) => s + (x.harvestRecords?.reduce((hS, h) => hS + h.amount, 0) || 0), 0)}g`, icon: Scale },
                  { label: "Investment", val: `$${(setups.reduce((s, x) => s + (x.cost || 0), 0) + plants.reduce((s, x) => s + (x.cost || 0), 0)).toFixed(0)}`, icon: DollarSign }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{s.label}</p>
                      <h4 className="text-4xl font-black mt-1 text-slate-800">{s.val}</h4>
                    </div>
                    <s.icon className="absolute top-4 right-4 text-emerald-500 opacity-5" size={80} />
                  </div>
                ))}
              </div>
              <Card className="bg-emerald-900 text-white border-none shadow-2xl relative overflow-hidden p-10">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Leaf size={140}/></div>
                 <div className="relative z-10 space-y-6">
                   <div className="flex items-start space-x-4">
                     <div className="p-4 bg-emerald-500/20 backdrop-blur rounded-2xl"><Zap size={28}/></div>
                     <div>
                       <h4 className="font-bold uppercase tracking-widest text-emerald-400 text-xs mb-2">Grower Intelligence</h4>
                       <p className="text-xl md:text-2xl font-medium italic leading-relaxed">"{dailyTip}"</p>
                     </div>
                   </div>
                   <Button onClick={() => navigateTo('guide')} variant="secondary" className="bg-white text-emerald-900">Learn to grow</Button>
                 </div>
              </Card>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card title="Current Task List">
                    <div className="space-y-4">
                       {tasks.filter(t => !t.completed).length === 0 ? <p className="text-center py-10 text-slate-300 italic">Clear schedule!</p> : tasks.filter(t => !t.completed).slice(0, 5).map(task => (
                         <div key={task.id} className="flex items-center space-x-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                           <input type="checkbox" className="w-5 h-5 accent-emerald-500" onChange={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: true} : t))} />
                           <span className="font-bold text-slate-800">{task.title}</span>
                         </div>
                       ))}
                    </div>
                 </Card>
                 <Card title="Upcoming Projections">
                    <div className="space-y-4">
                       {plants.filter(p => p.projectedHarvestDate && p.status !== 'Harvested').slice(0, 4).map(p => (
                         <div key={p.id} className="flex justify-between items-center p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100">
                           <span className="font-bold text-slate-800">{p.name}</span>
                           <span className="text-xs font-black text-emerald-600">Harvest {new Date(p.projectedHarvestDate!).toLocaleDateString()}</span>
                         </div>
                       ))}
                    </div>
                 </Card>
              </div>
            </div>
          )}
          
          {activeView === 'reports' && <ReportsView plants={plants} setups={setups} inventory={inventory} />}
          
          {activeView === 'plants' && (
             <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center"><h3 className="text-2xl font-black text-slate-800">Plant Registry</h3><Button onClick={() => { setSelectedItem(null); setModalType('plant'); setIsModalOpen(true); }}>Add Plant</Button></div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {plants.map(p => (
                   <Card key={p.id} title={p.name} action={<div className="flex gap-2"><button onClick={() => { setSelectedItem(p); setModalType('plant'); setIsModalOpen(true); }} className="text-slate-300 hover:text-emerald-500"><Edit2 size={16}/></button><button onClick={() => deletePlant(p.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></div>}>
                     <div className="mb-4"><span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">{p.status}</span><p className="text-sm text-slate-500 italic mt-1">{p.variety}</p></div>
                     <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Timeline</p><PlantLifecycleTimeline plant={p} /></div>
                     <Button variant="outline" className="w-full text-xs" onClick={() => { setSelectedItem(p); setModalType('harvest'); setIsModalOpen(true); }}>Log Harvest</Button>
                   </Card>
                 ))}
               </div>
             </div>
          )}

          {activeView === 'setups' && (
             <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center"><h3 className="text-2xl font-bold text-slate-800">Systems</h3><Button onClick={() => { setSelectedItem(null); setModalType('setup'); setIsModalOpen(true); }}>Add System</Button></div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {setups.map(s => (
                   <Card key={s.id} title={s.name} action={<div className="flex gap-2"><button onClick={() => { setSelectedItem(s); setModalType('setup'); setIsModalOpen(true); }} className="text-slate-400 hover:text-emerald-500"><Edit2 size={16}/></button><button onClick={() => deleteSetup(s.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button></div>}>
                     <p className="text-xs font-bold text-emerald-600 uppercase mb-2">{s.type}</p>
                     <p className="text-sm text-slate-600 mb-4">{s.notes}</p>
                     <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest"><span>Spent: ${s.cost || 0}</span><span>Size: {s.reservoirSize}</span></div>
                   </Card>
                 ))}
               </div>
             </div>
          )}
          
          {activeView === 'guide' && <GuideView />}
          {activeView === 'troubleshoot' && <TroubleshootView />}
          {activeView === 'inventory' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between"><h3 className="text-2xl font-bold text-slate-800">Pantry</h3><div className="flex gap-2"><Button onClick={() => { setSelectedItem(null); setModalType('equip'); setIsModalOpen(true); }}>Add Gear</Button><Button variant="dark" onClick={() => { setSelectedItem(null); setModalType('ingred'); setIsModalOpen(true); }}>Add Supply</Button></div></div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card title="Hardware">
                    {inventory.equipment.map(e => (
                      <div key={e.id} className="p-4 bg-slate-50 rounded-xl mb-2 flex justify-between">
                        <span>{e.name}</span><button onClick={() => deleteEquipment(e.id)} className="text-red-400"><Trash2 size={14}/></button>
                      </div>
                    ))}
                 </Card>
                 <Card title="Supplies">
                    {inventory.ingredients.map(i => (
                      <div key={i.id} className="p-4 bg-white border rounded-xl mb-2 flex justify-between">
                        <span>{i.name} - {i.quantity}{i.unit}</span><button onClick={() => deleteIngredient(i.id)} className="text-red-400"><Trash2 size={14}/></button>
                      </div>
                    ))}
                 </Card>
               </div>
            </div>
          )}
          {activeView === 'calendar' && (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
               <h3 className="text-2xl font-bold text-slate-800">Tasks</h3>
               <form onSubmit={e => { e.preventDefault(); const f = e.target as any; addTask(f.task.value, f.date.value); f.reset(); }} className="flex gap-2">
                 <input name="task" required placeholder="To do..." className="flex-1 p-4 border rounded-2xl outline-none" />
                 <input name="date" required type="date" className="p-4 border rounded-2xl outline-none" />
                 <Button type="submit">Add</Button>
               </form>
               {tasks.map(t => <div key={t.id} className="p-5 bg-white rounded-2xl border flex justify-between items-center"><div><p className="font-bold">{t.title}</p><p className="text-xs text-slate-400">{t.date}</p></div><button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="text-red-400"><Trash2 size={18}/></button></div>)}
            </div>
          )}
          {activeView === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
              <Card title="Utilities">
                 <Button onClick={() => {
                   const demoS: Setup = { id: 'd1', name: 'Kratky Basil Bin', type: 'Kratky', startDate: new Date().toISOString(), reservoirSize: '5L', location: 'Living Room', notes: 'My first setup.', cost: 20 };
                   const demoP: Plant = { id: 'dp1', setupId: 'd1', name: 'Genovese Basil', variety: 'Genovese', plantedDate: new Date(Date.now() - 30 * 86400000).toISOString(), projectedHarvestDate: new Date(Date.now() + 15 * 86400000).toISOString(), status: 'Healthy', lastChecked: new Date().toISOString(), notes: '', harvestRecords: [] };
                   setSetups([demoS]); setPlants([demoP]); alert("Seeded!");
                 }} variant="dark">Seed Demo Data</Button>
                 <div className="grid grid-cols-2 gap-4 mt-4"><Button onClick={() => { const b = new Blob([JSON.stringify({ setups, plants, inventory, tasks })], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'hydrogrow-backup.json'; a.click(); }}>Export</Button><Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Restore</Button><input type="file" ref={fileInputRef} className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = x => { const j = JSON.parse(x.target?.result as string); if(j.setups) setSetups(j.setups); if(j.plants) setPlants(j.plants); if(j.inventory) setInventory(j.inventory); if(j.tasks) setTasks(j.tasks); alert("Restored!"); }; r.readAsText(f); } }} /></div>
              </Card>
            </div>
          )}
          {activeView === 'support' && (
            <div className="max-w-xl mx-auto text-center space-y-8 py-20">
              <Heart className="mx-auto text-red-500" size={64} />
              <h2 className="text-4xl font-black">Support Us</h2>
              <p className="text-slate-500">Help us keep HydroGrow Pro free and expert-driven.</p>
              <div className="grid grid-cols-3 gap-4">
                {[5, 15, 50].map(amt => <Button key={amt} onClick={() => window.open(`https://paypal.me/hydrogrow/${amt}`)}>${amt}</Button>)}
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType?.toUpperCase() || ''}>
         {modalType === 'setup' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; const d = { name: f.sname.value, type: f.stype.value, startDate: f.sdate.value, reservoirSize: f.ssize.value, location: f.sloc.value, notes: f.snotes.value, cost: Number(f.scost.value) || 0 }; selectedItem ? updateSetup(selectedItem.id, d) : addSetup(d); setIsModalOpen(false); }}>
             <input name="sname" placeholder="System Name" required defaultValue={selectedItem?.name} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
             <div className="flex gap-2">
               <select name="stype" defaultValue={selectedItem?.type || "Hydroponic"} className="flex-1 p-4 bg-slate-50 rounded-2xl border outline-none"><option>Hydroponic</option><option>Kratky</option><option>DWC</option><option>NFT</option></select>
               <input name="scost" type="number" step="0.01" placeholder="Cost ($)" defaultValue={selectedItem?.cost} className="w-28 p-4 bg-slate-50 rounded-2xl border outline-none" />
             </div>
             <input name="ssize" placeholder="Reservoir (L)" defaultValue={selectedItem?.reservoirSize} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
             <input name="sdate" type="date" defaultValue={selectedItem?.startDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
             <input name="sloc" placeholder="Location" defaultValue={selectedItem?.location} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
             <Button type="submit" className="w-full py-4 text-lg">{selectedItem ? "Update" : "Create"} System</Button>
           </form>
         )}
         {modalType === 'plant' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; const d = { 
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
             cost: Number(f.pcost.value) || 0
           }; selectedItem ? updatePlant(selectedItem.id, d) : addPlant(d); setIsModalOpen(false); }}>
             <div className="flex gap-2">
                <select name="pId" defaultValue={selectedItem?.setupId} className="flex-1 p-4 bg-slate-50 rounded-2xl border outline-none"><option value="">Standalone</option>{setups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                <input name="pcost" type="number" step="0.01" placeholder="Seed Cost ($)" defaultValue={selectedItem?.cost} className="w-28 p-4 bg-slate-50 rounded-2xl border outline-none" />
             </div>
             <div className="flex gap-2">
               <input name="pname" placeholder="Plant (e.g. Basil)" required defaultValue={selectedItem?.name} className="flex-1 p-4 bg-slate-50 rounded-2xl border outline-none" />
               <Button variant="accent" onClick={(e: any) => handlePredict(e.currentTarget.form)} disabled={isPredicting} className="p-4 rounded-2xl">
                 {isPredicting ? <div className="animate-spin h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full" /> : <Sparkles size={20} />}
               </Button>
             </div>
             <input name="pvar" placeholder="Variety (e.g. Genovese)" defaultValue={selectedItem?.variety} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] uppercase font-black text-slate-400">Planted</label><input name="pdate" type="date" defaultValue={selectedItem?.plantedDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" /></div>
               <div><label className="text-[10px] uppercase font-black text-slate-400">Germinated (Actual)</label><input name="pgerm" type="date" defaultValue={selectedItem?.germinatedDate} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" /></div>
             </div>
             <div className="p-4 bg-emerald-50/50 rounded-3xl border border-emerald-100 space-y-4">
               <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Sparkles size={10} /> Simple Projections</h4>
               <div className="grid grid-cols-3 gap-2">
                 <div><label className="text-[8px] uppercase font-black text-slate-400">Germination</label><input name="pgerm_proj" type="date" defaultValue={selectedItem?.projectedGerminationDate} className="w-full p-2 bg-white rounded-xl border outline-none text-[10px]" /></div>
                 <div><label className="text-[8px] uppercase font-black text-slate-400">Flowering</label><input name="pflow_proj" type="date" defaultValue={selectedItem?.projectedFloweringDate} className="w-full p-2 bg-white rounded-xl border outline-none text-[10px]" /></div>
                 <div><label className="text-[8px] uppercase font-black text-slate-400">Harvest</label><input name="phrv_proj" type="date" defaultValue={selectedItem?.projectedHarvestDate} className="w-full p-2 bg-white rounded-xl border outline-none text-[10px]" /></div>
               </div>
             </div>
             <select name="pstatus" defaultValue={selectedItem?.status || "Healthy"} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none"><option>Healthy</option><option>Needs Attention</option><option>Harvested</option></select>
             <Button type="submit" className="w-full py-4 text-lg">{selectedItem ? "Update" : "Add"} Plant</Button>
           </form>
         )}
         {modalType === 'harvest' && (
           <div className="space-y-6">
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; addHarvest(selectedItem.id, { amount: Number(f.hamount.value), unit: f.hunit.value, date: f.hdate.value }); f.reset(); }}>
                <div className="flex gap-2">
                  <input name="hamount" type="number" placeholder="Amt" required className="flex-1 p-4 bg-slate-50 rounded-2xl border outline-none" />
                  <select name="hunit" className="w-24 p-4 bg-slate-50 rounded-2xl border outline-none"><option>g</option><option>kg</option><option>oz</option></select>
                </div>
                <input name="hdate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
                <Button type="submit" className="w-full py-4">Save Harvest</Button>
              </form>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                 {selectedItem.harvestRecords?.map((h: HarvestRecord) => <div key={h.id} className="p-3 bg-slate-50 rounded-xl flex justify-between"><span>{h.amount}{h.unit}</span><button onClick={() => deleteHarvest(selectedItem.id, h.id)} className="text-red-400"><Trash2 size={14}/></button></div>)}
              </div>
           </div>
         )}
         {modalType === 'equip' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; addEquipment({ name: f.ename.value, category: f.ecat.value, status: 'Active', purchaseDate: new Date().toISOString(), notes: '', cost: Number(f.ecost.value) || 0, setupId: f.eSetup.value || undefined }); setIsModalOpen(false); }}>
             <input name="ename" placeholder="Gear Name" required className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
             <div className="flex gap-2"><select name="ecat" className="flex-1 p-4 bg-slate-50 rounded-2xl border outline-none"><option>Lighting</option><option>Pump</option></select><input name="ecost" type="number" placeholder="$" className="w-24 p-4 bg-slate-50 rounded-2xl border outline-none" /></div>
             <select name="eSetup" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none"><option value="">No System</option>{setups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
             <Button type="submit" className="w-full py-4">Save Gear</Button>
           </form>
         )}
      </Modal>
    </div>
  );
}

const GuideView = () => {
  const [guide, setGuide] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchG = async (t: string) => { setLoading(true); const res = await getGrowGuide(t); setGuide(res); setLoading(false); };
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        {['Kratky Method', 'Nutrient Mix', 'pH Balance', 'LED PAR'].map(t => <button key={t} onClick={() => fetchG(t)} className="px-6 py-3 bg-white border rounded-xl font-bold hover:bg-emerald-50">{t}</button>)}
      </div>
      <Card className="h-[500px]">
        {loading ? <div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mt-20" /> : guide ? <div className="prose prose-emerald p-4 text-sm whitespace-pre-wrap">{guide}</div> : <p className="text-center mt-20 text-slate-300 italic">Select a topic.</p>}
      </Card>
    </div>
  );
};

const TroubleshootView = () => {
  const [diag, setDiag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleA = async (e: any) => { e.preventDefault(); setLoading(true); const res = await troubleshootPlant(e.target.desc.value); setDiag(res); setLoading(false); };
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <form onSubmit={handleA} className="space-y-4">
        <textarea name="desc" placeholder="Describe symptoms..." className="w-full p-6 bg-white border rounded-[2rem] h-40 outline-none" />
        <Button type="submit" disabled={loading} className="w-full">{loading ? "Consulting..." : "Analyze symptoms"}</Button>
      </form>
      {diag && <Card title="Diagnosis report"><div className="text-sm text-slate-600 whitespace-pre-wrap">{diag}</div></Card>}
    </div>
  );
};