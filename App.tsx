
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
  Timer,
  Camera
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

// --- Missing Views ---

/**
 * LandingPage component for the initial marketing view.
 */
const LandingPage = ({ onEnterApp, onGoToSupport }: { onEnterApp: () => void, onGoToSupport: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xl"><Sprout size={24} /></div>
          <h1 className="text-xl font-black tracking-tighter">HydroGrow Pro</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={onEnterApp} className="hidden md:block text-slate-600 font-bold hover:text-emerald-600 transition-colors">Login</button>
          <Button onClick={onEnterApp}>Get Started</Button>
        </div>
      </nav>

      <section className="pt-32 md:pt-48 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest mb-6 animate-pulse">Smart Indoor Farming Platform</div>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
          The Future of <span className="text-emerald-600 underline decoration-emerald-200 decoration-8 underline-offset-8">Hydroponics</span> is AI-Driven.
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium">
          Professional tracking, AI-powered diagnosis, and real-time growth analytics for your indoor farm.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button onClick={onEnterApp} className="w-full sm:w-auto text-xl py-6 px-10">Launch App</Button>
          <Button onClick={onGoToSupport} variant="outline" className="w-full sm:w-auto text-xl py-6 px-10">Support Us</Button>
        </div>
      </section>

      <section className="py-20 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Stethoscope, title: "AI Plant Health", text: "Submit photos of your plants for instant diagnosis using advanced Gemini Pro vision." },
          { icon: TrendingUp, title: "Growth Forecasts", text: "Predict germination and harvest dates specifically for your system type." },
          { icon: BarChart3, title: "Yield Reports", text: "Keep detailed logs and analyze your harvest history to optimize your growth cycles." }
        ].map((f, i) => (
          <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><f.icon size={32}/></div>
            <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
            <p className="text-slate-500 leading-relaxed font-medium">{f.text}</p>
          </div>
        ))}
      </section>

      <footer className="py-12 border-t border-slate-100 text-center text-slate-400 font-bold text-sm">
        &copy; 2025 HydroGrow Pro. Cultivating the future of agriculture.
      </footer>
    </div>
  );
};

/**
 * ReportsView component for detailed growth and investment analytics.
 */
const ReportsView = ({ plants, setups, inventory }: { plants: Plant[], setups: Setup[], inventory: { equipment: Equipment[], ingredients: Ingredient[] } }) => {
  const harvestData = useMemo(() => {
    const data: { [key: string]: number } = {};
    plants.forEach(p => {
      p.harvestRecords?.forEach(h => {
        const month = new Date(h.date).toLocaleString('default', { month: 'short' });
        data[month] = (data[month] || 0) + h.amount;
      });
    });
    return Object.entries(data).map(([label, value]) => ({ label, value }));
  }, [plants]);

  const investmentBySystem = useMemo(() => {
    const data: { [key: string]: number } = {};
    setups.forEach(s => {
      data[s.name] = (data[s.name] || 0) + (s.cost || 0);
    });
    return Object.entries(data).map(([label, value]) => ({ label, value }));
  }, [setups]);

  const totalSpent = useMemo(() => {
    const equipCost = inventory.equipment.reduce((s, e) => s + (e.cost || 0), 0);
    const supplyCost = inventory.ingredients.reduce((s, i) => s + (i.cost || 0), 0);
    const setupCost = setups.reduce((s, x) => s + (x.cost || 0), 0);
    const plantCost = plants.reduce((s, p) => s + (p.cost || 0), 0);
    return equipCost + supplyCost + setupCost + plantCost;
  }, [inventory, setups, plants]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Investment">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"><DollarSign size={24}/></div>
            <div>
              <p className="text-3xl font-black text-slate-800">${totalSpent.toFixed(0)}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Across all logs</p>
            </div>
          </div>
        </Card>
        <Card title="Avg Plant Yield">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Scale size={24}/></div>
            <div>
              <p className="text-3xl font-black text-slate-800">
                {plants.length > 0 ? (plants.reduce((s, p) => s + (p.harvestRecords?.reduce((hS, h) => hS + h.amount, 0) || 0), 0) / plants.length).toFixed(1) : 0}g
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grams per Seedling</p>
            </div>
          </div>
        </Card>
        <Card title="Maintenance Rate">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><Activity size={24}/></div>
            <div>
              <p className="text-3xl font-black text-slate-800">{setups.length > 0 ? (plants.length / setups.length).toFixed(1) : 0}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plants/System</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Harvest Weight Timeline (g)">
          {harvestData.length > 0 ? <SimpleBarChart data={harvestData} /> : <div className="h-64 flex items-center justify-center text-slate-300 italic">No harvest data available.</div>}
        </Card>
        <Card title="Financial Split by System ($)">
          {investmentBySystem.length > 0 ? <SimpleBarChart data={investmentBySystem} /> : <div className="h-64 flex items-center justify-center text-slate-300 italic">No cost distribution data.</div>}
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
  
  // Helpers for defensive form handling
  const getElements = (f: HTMLFormElement | EventTarget) => (f as HTMLFormElement).elements as any;
  const getVal = (f: HTMLFormElement | EventTarget, name: string) => getElements(f).namedItem(name)?.value || '';
  const getNumVal = (f: HTMLFormElement | EventTarget, name: string) => Number(getVal(f, name)) || 0;

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

  const handlePredict = async (form: HTMLFormElement | null) => {
    if (!form) return;
    const name = getVal(form, 'pname');
    const variety = getVal(form, 'pvar');
    const setupId = getVal(form, 'pId');
    const plantedDateStr = getVal(form, 'pdate');
    
    if (!name) return alert("Enter plant name first!");

    setIsPredicting(true);
    const system = setups.find(s => s.id === setupId)?.type || 'Hydroponic';
    try {
      const projections = await getPlantProjections(name, variety, system);
      if (projections) {
        const baseDate = new Date(plantedDateStr || Date.now());
        const formatDate = (days: number) => {
          const d = new Date(baseDate);
          if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
          d.setDate(d.getDate() + days);
          return d.toISOString().split('T')[0];
        };
        const els = getElements(form);
        if (els.namedItem('pgerm_proj')) els.namedItem('pgerm_proj').value = formatDate(projections.daysToGerminate);
        if (els.namedItem('pflow_proj')) els.namedItem('pflow_proj').value = formatDate(projections.daysToFlower);
        if (els.namedItem('phrv_proj')) els.namedItem('phrv_proj').value = formatDate(projections.daysToHarvest);
      } else {
        alert("AI couldn't estimate dates. Try a more specific name.");
      }
    } catch (e) {
      console.error(e);
      alert("Error reaching AI service.");
    } finally {
      setIsPredicting(false);
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
              <h1 className="text-xl font-black text-slate-800 tracking-tighter">HydroGrow Pro</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"><X/></button>
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
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"><Menu/></button>
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
                   <Button onClick={() => navigateTo('guide')} variant="secondary" className="bg-white text-emerald-900 border-none">Learn to grow</Button>
                 </div>
              </Card>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card title="Upcoming Maintenance">
                    <div className="space-y-4">
                       {tasks.filter(t => !t.completed).length === 0 ? <p className="text-center py-10 text-slate-300 italic">Clear schedule!</p> : tasks.filter(t => !t.completed).slice(0, 5).map(task => (
                         <div key={task.id} className="flex items-center space-x-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                           <input type="checkbox" className="w-5 h-5 accent-emerald-500" onChange={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: true} : t))} />
                           <span className="font-bold text-slate-800">{task.title}</span>
                         </div>
                       ))}
                    </div>
                 </Card>
                 <Card title="Harvest Forecast">
                    <div className="space-y-4">
                       {plants.filter(p => p.projectedHarvestDate && p.status !== 'Harvested').slice(0, 4).map(p => (
                         <div key={p.id} className="flex justify-between items-center p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100">
                           <span className="font-bold text-slate-800">{p.name}</span>
                           <span className="text-xs font-black text-emerald-600">Harvest {new Date(p.projectedHarvestDate!).toLocaleDateString()}</span>
                         </div>
                       ))}
                       {plants.filter(p => p.projectedHarvestDate && p.status !== 'Harvested').length === 0 && <p className="text-center py-10 text-slate-300 italic">No projections logged.</p>}
                    </div>
                 </Card>
              </div>
            </div>
          )}
          
          {activeView === 'reports' && <ReportsView plants={plants} setups={setups} inventory={inventory} />}
          
          {activeView === 'plants' && (
             <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center"><h3 className="text-2xl font-black text-slate-800">Plant Registry</h3><Button onClick={() => { setSelectedItem(null); setModalType('plant'); setIsModalOpen(true); }}>Add Plant</Button></div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {plants.map(p => (
                   <Card key={p.id} title={p.name} action={<div className="flex gap-2"><button onClick={() => { setSelectedItem(p); setModalType('plant'); setIsModalOpen(true); }} className="text-slate-300 hover:text-emerald-500"><Edit2 size={16}/></button><button onClick={() => deletePlant(p.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></div>}>
                     <div className="mb-4"><span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${p.status === 'Healthy' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{p.status}</span><p className="text-sm text-slate-500 italic mt-1">{p.variety}</p></div>
                     <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Timeline</p><PlantLifecycleTimeline plant={p} /></div>
                     <Button variant="outline" className="w-full text-xs" onClick={() => { setSelectedItem(p); setModalType('harvest'); setIsModalOpen(true); }}>Log Harvest</Button>
                   </Card>
                 ))}
                 {plants.length === 0 && <div className="col-span-full py-20 text-center text-slate-300 italic border-2 border-dashed border-slate-200 rounded-[2rem]">Empty grow logs. Add your first seed!</div>}
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
                 {setups.length === 0 && <div className="col-span-full py-20 text-center text-slate-300 italic">No systems defined.</div>}
               </div>
             </div>
          )}
          
          {activeView === 'guide' && <GuideView />}
          {activeView === 'troubleshoot' && <TroubleshootView />}
          {activeView === 'inventory' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between"><h3 className="text-2xl font-bold text-slate-800">Growth Pantry</h3><div className="flex gap-2"><Button onClick={() => { setSelectedItem(null); setModalType('equip'); setIsModalOpen(true); }}>Add Gear</Button><Button variant="dark" onClick={() => { setSelectedItem(null); setModalType('ingred'); setIsModalOpen(true); }}>Add Supply</Button></div></div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card title="Hardware">
                    {inventory.equipment.map(e => (
                      <div key={e.id} className="p-4 bg-slate-50 rounded-xl mb-2 flex justify-between border border-slate-100">
                        <span>{e.name} (${e.cost || 0})</span><button onClick={() => deleteEquipment(e.id)} className="text-red-400 p-2"><Trash2 size={14}/></button>
                      </div>
                    ))}
                    {inventory.equipment.length === 0 && <p className="text-slate-300 italic text-center py-4">No gear logged.</p>}
                 </Card>
                 <Card title="Supplies">
                    {inventory.ingredients.map(i => (
                      <div key={i.id} className="p-4 bg-white border rounded-xl mb-2 flex justify-between shadow-sm">
                        <span>{i.name} - {i.quantity}{i.unit}</span><button onClick={() => deleteIngredient(i.id)} className="text-red-400 p-2"><Trash2 size={14}/></button>
                      </div>
                    ))}
                    {inventory.ingredients.length === 0 && <p className="text-slate-300 italic text-center py-4">No supplies logged.</p>}
                 </Card>
               </div>
            </div>
          )}
          {activeView === 'calendar' && (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
               <h3 className="text-2xl font-bold text-slate-800">Tasks Schedule</h3>
               <form onSubmit={e => { e.preventDefault(); const f = e.currentTarget; addTask(getVal(f, 'task'), getVal(f, 'date')); (f as any).reset(); }} className="flex gap-2">
                 <input name="task" required placeholder="What needs doing?" className="flex-1 p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" />
                 <input name="date" required type="date" className="p-4 border rounded-2xl outline-none" />
                 <Button type="submit">Add</Button>
               </form>
               <div className="space-y-2">
                 {tasks.map(t => <div key={t.id} className="p-5 bg-white rounded-2xl border flex justify-between items-center shadow-sm"><div><p className="font-bold">{t.title}</p><p className="text-xs text-slate-400">{t.date}</p></div><button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="text-red-400 p-2"><Trash2 size={18}/></button></div>)}
                 {tasks.length === 0 && <p className="text-center py-12 text-slate-300 italic">Clear schedule!</p>}
               </div>
            </div>
          )}
          {activeView === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
              <Card title="Utilities">
                 <Button onClick={() => {
                   const demoS: Setup = { id: 'd1', name: 'Kitchen Bin', type: 'Kratky', startDate: new Date().toISOString(), reservoirSize: '5L', location: 'Kitchen', notes: 'First test.', cost: 25 };
                   const demoP: Plant = { id: 'dp1', setupId: 'd1', name: 'Thai Basil', variety: 'Classic', plantedDate: new Date(Date.now() - 30 * 86400000).toISOString(), projectedHarvestDate: new Date(Date.now() + 15 * 86400000).toISOString(), status: 'Healthy', lastChecked: new Date().toISOString(), notes: 'Smells great.', harvestRecords: [], cost: 4 };
                   setSetups([demoS]); setPlants([demoP]); alert("Seeded!");
                 }} variant="dark">Seed Demo Data</Button>
                 <div className="grid grid-cols-2 gap-4 mt-4"><Button onClick={() => { const b = new Blob([JSON.stringify({ setups, plants, inventory, tasks })], { type: 'application/json' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'hydrogrow-backup.json'; a.click(); }}>Export</Button><Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Restore</Button><input type="file" ref={fileInputRef} className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = x => { const j = JSON.parse(x.target?.result as string); if(j.setups) setSetups(j.setups); if(j.plants) setPlants(j.plants); if(j.inventory) setInventory(j.inventory); if(j.tasks) setTasks(j.tasks); alert("Restored!"); }; r.readAsText(f); } }} /></div>
              </Card>
            </div>
          )}
          {activeView === 'support' && (
            <div className="max-w-xl mx-auto text-center space-y-8 py-20 animate-in zoom-in-95 duration-500">
              <Heart className="mx-auto text-red-500" size={64} />
              <h2 className="text-4xl font-black">Support the Vision</h2>
              <p className="text-slate-500">Help us grow HydroGrow Pro with better expert-driven data.</p>
              <div className="grid grid-cols-3 gap-4">
                {[5, 15, 50].map(amt => <Button key={amt} onClick={() => window.open(`https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=${paypalId}&amount=${amt}&currency_code=USD`)}>${amt}</Button>)}
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType?.toUpperCase() || ''}>
         {modalType === 'setup' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; const d = { name: getVal(f, 'sname'), type: getVal(f, 'stype'), startDate: getVal(f, 'sdate'), reservoirSize: getVal(f, 'ssize'), location: getVal(f, 'sloc'), notes: getVal(f, 'snotes'), cost: getNumVal(f, 'scost') }; selectedItem ? updateSetup(selectedItem.id, d) : addSetup(d); setIsModalOpen(false); }}>
             <input name="sname" placeholder="System Name" required defaultValue={selectedItem?.name} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500" />
             <div className="flex gap-2">
               <select name="stype" defaultValue={selectedItem?.type || "Hydroponic"} className="flex-1 p-4 bg-slate-50 rounded-2xl border outline-none"><option>Hydroponic</option><option>Kratky</option><option>DWC</option><option>NFT</option></select>
               <input name="scost" type="number" step="0.01" placeholder="Cost ($)" defaultValue={selectedItem?.cost} className="w-28 p-4 bg-slate-50 rounded-2xl border outline-none" />
             </div>
             <input name="ssize" placeholder="Reservoir (L)" defaultValue={selectedItem?.reservoirSize} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
             <input name="sdate" type="date" defaultValue={selectedItem?.startDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
             <input name="sloc" placeholder="Location" defaultValue={selectedItem?.location} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
             <textarea name="snotes" placeholder="General Notes..." defaultValue={selectedItem?.notes} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none h-24 resize-none" />
             <Button type="submit" className="w-full py-4 text-lg">{selectedItem ? "Update" : "Create"} System</Button>
           </form>
         )}
         {modalType === 'plant' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; const d = { 
             setupId: getVal(f, 'pId'), 
             name: getVal(f, 'pname'), 
             variety: getVal(f, 'pvar'), 
             plantedDate: getVal(f, 'pdate'), 
             germinatedDate: getVal(f, 'pgerm') || undefined,
             floweredDate: getVal(f, 'pflow') || undefined,
             projectedGerminationDate: getVal(f, 'pgerm_proj') || undefined,
             projectedFloweringDate: getVal(f, 'pflow_proj') || undefined,
             projectedHarvestDate: getVal(f, 'phrv_proj') || undefined,
             status: getVal(f, 'pstatus'),
             lastChecked: new Date().toISOString(), 
             notes: getVal(f, 'pnotes'),
             cost: getNumVal(f, 'pcost')
           }; selectedItem ? updatePlant(selectedItem.id, d) : addPlant(d); setIsModalOpen(false); }}>
             <div className="flex gap-2">
                <select name="pId" defaultValue={selectedItem?.setupId} className="flex-1 p-4 bg-slate-50 rounded-2xl border outline-none"><option value="">Standalone</option>{setups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                <input name="pcost" type="number" step="0.01" placeholder="Cost ($)" defaultValue={selectedItem?.cost} className="w-28 p-4 bg-slate-50 rounded-2xl border outline-none" />
             </div>
             <div className="flex gap-2">
               <input name="pname" placeholder="Species" required defaultValue={selectedItem?.name} className="flex-1 p-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500" />
               <Button variant="accent" onClick={(e: any) => handlePredict(e.currentTarget.form)} disabled={isPredicting} className="p-4 rounded-2xl">
                 {isPredicting ? <div className="animate-spin h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full" /> : <Sparkles size={20} />}
               </Button>
             </div>
             <input name="pvar" placeholder="Variety" defaultValue={selectedItem?.variety} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-[10px] uppercase font-black text-slate-400">Planted</label><input name="pdate" type="date" defaultValue={selectedItem?.plantedDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" /></div>
               <div><label className="text-[10px] uppercase font-black text-slate-400">Germinated</label><input name="pgerm" type="date" defaultValue={selectedItem?.germinatedDate} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" /></div>
             </div>
             <div className="p-4 bg-emerald-50/50 rounded-3xl border border-emerald-100 space-y-4">
               <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Sparkles size={10} /> Forecasted Milestones</h4>
               <div className="grid grid-cols-3 gap-2">
                 <div><label className="text-[8px] uppercase font-black text-slate-400">Germination</label><input name="pgerm_proj" type="date" defaultValue={selectedItem?.projectedGerminationDate} className="w-full p-2 bg-white rounded-xl border outline-none text-[10px]" /></div>
                 <div><label className="text-[8px] uppercase font-black text-slate-400">Flowering</label><input name="pflow_proj" type="date" defaultValue={selectedItem?.projectedFloweringDate} className="w-full p-2 bg-white rounded-xl border outline-none text-[10px]" /></div>
                 <div><label className="text-[8px] uppercase font-black text-slate-400">Harvest</label><input name="phrv_proj" type="date" defaultValue={selectedItem?.projectedHarvestDate} className="w-full p-2 bg-white rounded-xl border outline-none text-[10px]" /></div>
               </div>
             </div>
             <select name="pstatus" defaultValue={selectedItem?.status || "Healthy"} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none"><option>Healthy</option><option>Needs Attention</option><option>Harvested</option></select>
             <textarea name="pnotes" placeholder="Notes..." defaultValue={selectedItem?.notes} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none h-24 resize-none" />
             <Button type="submit" className="w-full py-4 text-lg">{selectedItem ? "Update" : "Add"} Plant</Button>
           </form>
         )}
         {modalType === 'harvest' && (
           <div className="space-y-6">
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; addHarvest(selectedItem.id, { amount: getNumVal(f, 'hamount'), unit: getVal(f, 'hunit'), date: getVal(f, 'hdate') }); (f as any).reset(); }}>
                <div className="flex gap-2">
                  <input name="hamount" type="number" step="0.1" placeholder="Amount" required className="flex-1 p-4 bg-slate-50 rounded-2xl border outline-none focus:ring-2 focus:ring-emerald-500" />
                  <select name="hunit" className="w-24 p-4 bg-slate-50 rounded-2xl border outline-none"><option>g</option><option>kg</option><option>oz</option></select>
                </div>
                <input name="hdate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
                <Button type="submit" className="w-full py-4">Save Harvest</Button>
              </form>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                 {selectedItem?.harvestRecords?.map((h: HarvestRecord) => <div key={h.id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-sm border border-slate-100"><span>{h.amount}{h.unit}</span><button onClick={() => deleteHarvest(selectedItem.id, h.id)} className="text-red-400 p-2"><Trash2 size={14}/></button></div>)}
              </div>
           </div>
         )}
         {modalType === 'equip' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; addEquipment({ name: getVal(f, 'ename'), category: getVal(f, 'ecat'), status: 'Active', purchaseDate: new Date().toISOString(), notes: '', cost: getNumVal(f, 'ecost'), setupId: getVal(f, 'eSetup') || undefined }); setIsModalOpen(false); }}>
             <input name="ename" placeholder="Device/Gear Name" required className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
             <div className="flex gap-2"><select name="ecat" className="flex-1 p-4 bg-slate-50 rounded-2xl border outline-none"><option>Lighting</option><option>Pump</option><option>Monitoring</option><option>Other</option></select><input name="ecost" type="number" step="0.01" placeholder="$" className="w-24 p-4 bg-slate-50 rounded-2xl border outline-none" /></div>
             <select name="eSetup" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none"><option value="">Standalone</option>{setups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
             <Button type="submit" className="w-full py-4">Save Gear</Button>
           </form>
         )}
         {modalType === 'ingred' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; addIngredient({ name: getVal(f, 'iname'), brand: getVal(f, 'ibrand'), quantity: getVal(f, 'iqty'), unit: getVal(f, 'iunit'), purpose: getVal(f, 'ipurp'), notes: '', cost: getNumVal(f, 'icost') }); setIsModalOpen(false); }}>
             <input name="iname" placeholder="Item Name" required className="w-full p-4 bg-slate-50 rounded-2xl border outline-none" />
             <div className="flex gap-2">
               <input name="ibrand" placeholder="Brand" className="flex-1 p-4 bg-slate-50 rounded-2xl border outline-none" />
               <input name="icost" type="number" step="0.01" placeholder="$" className="w-24 p-4 bg-slate-50 rounded-2xl border outline-none" />
             </div>
             <div className="flex gap-2">
               <input name="iqty" placeholder="Quantity" className="flex-1 p-4 bg-slate-50 rounded-2xl border outline-none" />
               <input name="iunit" placeholder="Unit" className="w-24 p-4 bg-slate-50 rounded-2xl border outline-none" />
             </div>
             <select name="ipurp" className="w-full p-4 bg-slate-50 rounded-2xl border outline-none"><option>Nutrient</option><option>pH Adjuster</option><option>Additive</option><option>Water Treatment</option></select>
             <Button type="submit" className="w-full py-4">Save Supply</Button>
           </form>
         )}
      </Modal>
    </div>
  );
}

const GuideView = () => {
  const [guide, setGuide] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fetchG = async (t: string) => { setLoading(true); try { const res = await getGrowGuide(t); setGuide(res); } finally { setLoading(false); } };
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        {['Kratky Method', 'Nutrient Mix', 'pH Balance', 'LED PAR', 'EC Levels'].map(t => <button key={t} onClick={() => fetchG(t)} className="px-6 py-3 bg-white border rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-sm">{t}</button>)}
      </div>
      <Card className="min-h-[500px]">
        {loading ? <div className="flex flex-col items-center justify-center h-full"><div className="animate-spin h-10 w-10 border-4 border-emerald-600 border-t-transparent rounded-full mb-4" /><p className="text-slate-500 font-bold">Consulting databases...</p></div> : guide ? <div className="prose prose-emerald p-4 text-sm whitespace-pre-wrap text-slate-600 leading-relaxed">{guide}</div> : <div className="flex flex-col items-center justify-center h-full text-slate-300 italic"><BookOpen size={64} className="mb-4 opacity-10" /><p>Select a topic above.</p></div>}
      </Card>
    </div>
  );
};

const TroubleshootView = () => {
  const [diag, setDiag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleA = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const els = e.currentTarget.elements as any;
    const desc = els.namedItem('desc')?.value;
    if(!desc) return;
    setLoading(true);
    try {
      const rawBase64 = imageBase64 ? imageBase64.split(',')[1] : undefined;
      const res = await troubleshootPlant(desc, rawBase64);
      setDiag(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <form onSubmit={handleA} className="space-y-6">
        <div className="relative">
          <textarea 
            name="desc" 
            placeholder="Describe symptoms, discoloration, or growth issues..." 
            className="w-full p-8 bg-white border rounded-[2rem] h-40 outline-none shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all resize-none" 
          />
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            {imageBase64 && (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-emerald-500 group">
                <img src={imageBase64} className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setImageBase64(null)} 
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className={`p-4 rounded-full ${imageBase64 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'} hover:bg-emerald-200 transition-colors`}
            >
              <Camera size={20} />
            </button>
          </div>
        </div>
        <Button type="submit" disabled={loading} className="w-full py-4 text-lg">
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              <span>Analyzing with Gemini Pro...</span>
            </div>
          ) : "Expert Diagnosis"}
        </Button>
      </form>
      {diag && (
        <Card title="Diagnosis Report" className="bg-emerald-50/20 border-emerald-100">
          <div className="prose prose-emerald prose-sm max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
            {diag}
          </div>
        </Card>
      )}
      {!diag && !loading && (
        <div className="text-center py-20 text-slate-300 italic">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={32} className="opacity-20" />
          </div>
          <p className="font-medium">Describe plant symptoms or upload a photo for AI analysis.</p>
        </div>
      )}
    </div>
  );
};
