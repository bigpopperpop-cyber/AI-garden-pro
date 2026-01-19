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
  Clock
} from 'lucide-react';
import { 
  ViewState, Setup, Plant, Equipment, Ingredient, Task, HarvestRecord 
} from './types.ts';
import { troubleshootPlant, getDailyTip, getGrowGuide } from './services/geminiService.ts';

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

// --- Custom Data Viz Components ---

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
            <Zap size={14} /> <span>The ultimate grower's toolkit</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1]">
            Grow your first <span className="text-emerald-600">Harvest</span> today.
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Smart management for hydroponics and aquaponics. Track setups, analyze plant health with AI, and learn the science of indoor farming.
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

const ReportsView = ({ plants }: { plants: Plant[] }) => {
  const harvestSummary = useMemo(() => {
    const data: { [key: string]: number } = {};
    plants.forEach(p => {
      p.harvestRecords?.forEach(h => {
        const date = new Date(h.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
        data[date] = (data[date] || 0) + Number(h.amount);
      });
    });
    // Sort keys by date roughly
    return Object.entries(data).map(([label, value]) => ({ label, value }));
  }, [plants]);

  const varietyPerformance = useMemo(() => {
    const data: { [key: string]: number } = {};
    plants.forEach(p => {
      const total = p.harvestRecords?.reduce((sum, h) => sum + Number(h.amount), 0) || 0;
      data[p.name] = (data[p.name] || 0) + total;
    });
    return Object.entries(data).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [plants]);

  const totalHarvest = plants.reduce((sum, p) => sum + (p.harvestRecords?.reduce((hSum, h) => hSum + Number(h.amount), 0) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-emerald-600 text-white text-center p-8 border-none shadow-xl shadow-emerald-100">
          <Scale size={32} className="mx-auto mb-4 text-emerald-200" />
          <p className="text-emerald-100 font-bold uppercase tracking-widest text-[10px]">Total Accumulated Yield</p>
          <h2 className="text-5xl font-black mt-2">{totalHarvest}<span className="text-xl">g</span></h2>
        </Card>
        <Card className="text-center p-8 bg-white border-slate-100">
          <Sprout size={32} className="mx-auto mb-4 text-emerald-500" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Active Producing Plants</p>
          <h2 className="text-5xl font-black mt-2 text-slate-800">{plants.filter(p => p.status === 'Healthy').length}</h2>
        </Card>
        <Card className="text-center p-8 bg-white border-slate-100">
          <TrendingUp size={32} className="mx-auto mb-4 text-emerald-500" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Avg Yield / Plant</p>
          <h2 className="text-5xl font-black mt-2 text-slate-800">
            {plants.length ? (totalHarvest / plants.length).toFixed(1) : 0}<span className="text-xl">g</span>
          </h2>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Harvest Trends (by Month)">
          {harvestSummary.length > 0 ? (
            <SimpleBarChart data={harvestSummary} />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-300 italic border-2 border-dashed border-slate-50 rounded-3xl">
              <History size={48} className="mb-2 opacity-10" />
              <p>No harvest data recorded yet</p>
            </div>
          )}
        </Card>
        <Card title="Top Performing Varieties">
           <div className="space-y-4">
              {varietyPerformance.slice(0, 5).map((v, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-slate-200 text-slate-500'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <span className="font-black text-slate-800 block">{v.label}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Variety Summary</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-2xl text-emerald-600">{v.value}</span>
                    <span className="text-xs font-bold text-slate-400 ml-1">g</span>
                  </div>
                </div>
              ))}
              {varietyPerformance.length === 0 && <div className="py-20 text-center text-slate-300 italic border-2 border-dashed border-slate-50 rounded-3xl">Start harvesting to see analytics</div>}
           </div>
        </Card>
      </div>
    </div>
  );
};

const PlantLifecycleTimeline = ({ plant }: { plant: Plant }) => {
  const steps = [
    { label: 'Planted', date: plant.plantedDate, icon: Sprout, active: true },
    { label: 'Germinated', date: plant.germinatedDate, icon: Zap, active: !!plant.germinatedDate },
    { label: 'Flowered', date: plant.floweredDate, icon: Star, active: !!plant.floweredDate },
    { label: 'Last Check', date: plant.lastChecked, icon: Clock, active: true },
  ].filter(s => s.active).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-4 relative py-2">
      <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-slate-100" />
      {steps.map((step, i) => (
        <div key={i} className="flex items-center space-x-4 relative z-10">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${i === steps.length - 1 ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-slate-100 text-slate-400'}`}>
            <step.icon size={16} />
          </div>
          <div>
            <p className="text-xs font-black text-slate-800">{step.label}</p>
            <p className="text-[10px] text-slate-400 font-bold">{new Date(step.date).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- App Root ---

export default function App() {
  const [mode, setMode] = useState<'website' | 'platform'>('website');
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Start closed on mobile-first mindset
  const [dailyTip, setDailyTip] = useState<string>("Loading your grower intelligence...");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Navigation Helper - Closes sidebar on mobile selection
  const navigateTo = (view: ViewState) => {
    setActiveView(view);
    setIsSidebarOpen(false);
  };

  // Persistence State
  const [setups, setSetups] = useState<Setup[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [inventory, setInventory] = useState<{equipment: Equipment[], ingredients: Ingredient[]}>({
    equipment: [],
    ingredients: []
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [paypalId, setPaypalId] = useState<string>('gizmooo@yahoo.com');

  // UI State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'setup' | 'plant' | 'equip' | 'ingred' | 'harvest' | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [mode, activeView]);

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

  // CRUD Helpers
  const addSetup = (data: any) => setSetups([...setups, { ...data, id: Date.now().toString() }]);
  const updateSetup = (id: string, data: any) => setSetups(setups.map(s => s.id === id ? { ...s, ...data } : s));
  const deleteSetup = (id: string) => {
    if(confirm("Delete system? All linked plants will lose their system ID.")) {
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

  const seedAppData = () => {
    const demoSetup: Setup = { id: 'demo-1', name: 'Kitchen Herb Station', type: 'Kratky', startDate: new Date(Date.now() - 60 * 86400000).toISOString(), reservoirSize: '10L', location: 'Kitchen Counter', notes: 'Beginner-friendly low maintenance setup.' };
    const demoPlant: Plant = { 
      id: 'demo-p1', 
      setupId: 'demo-1', 
      name: 'Sweet Basil', 
      variety: 'Genovese', 
      plantedDate: new Date(Date.now() - 45 * 86400000).toISOString(), 
      germinatedDate: new Date(Date.now() - 40 * 86400000).toISOString(),
      floweredDate: new Date(Date.now() - 15 * 86400000).toISOString(),
      status: 'Healthy', 
      lastChecked: new Date().toISOString(), 
      notes: 'Growing vigorously.',
      harvestRecords: [
        { id: 'h1', date: new Date().toISOString(), amount: 15, unit: 'g' },
        { id: 'h2', date: new Date(Date.now() - 7 * 86400000).toISOString(), amount: 10, unit: 'g' },
        { id: 'h3', date: new Date(Date.now() - 14 * 86400000).toISOString(), amount: 12, unit: 'g' }
      ]
    };
    setSetups([demoSetup]);
    setPlants([demoPlant]);
    alert("Demo garden seeded with lifecycle data!");
    navigateTo('dashboard');
  };

  const handleExport = () => {
    const data = { setups, plants, inventory, tasks, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydrogrow-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.setups) setSetups(json.setups);
        if (json.plants) setPlants(json.plants);
        if (json.inventory) setInventory(json.inventory);
        if (json.tasks) setTasks(json.tasks);
        alert("Backup imported successfully!");
      } catch (err) {
        alert("Failed to parse backup file.");
      }
    };
    reader.readAsText(file);
  };

  if (mode === 'website') {
    return (
      <LandingPage 
        onEnterApp={() => {
          setMode('platform');
          navigateTo('dashboard');
        }} 
        onGoToSupport={() => { 
          setMode('platform'); 
          navigateTo('support'); 
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setMode('website')}>
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xl"><Sprout size={24} /></div>
              <h1 className="text-xl font-black text-slate-800 tracking-tighter">HydroGrow</h1>
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

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 glass-effect sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 border-b border-slate-100 shrink-0">
           <div className="flex items-center space-x-4">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"><Menu/></button>
             <h2 className="text-lg md:text-xl font-bold text-slate-800 truncate">{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h2>
           </div>
           <div className="flex items-center space-x-4">
             <div onClick={() => navigateTo('settings')} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all">
                <img src="https://picsum.photos/seed/user/100" alt="User" />
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          {activeView === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Systems", val: setups.length, icon: Layers, color: "emerald" },
                  { label: "Plants", val: plants.length, icon: Sprout, color: "sky" },
                  { label: "Inventory", val: (inventory.equipment?.length || 0) + (inventory.ingredients?.length || 0), icon: FlaskConical, color: "indigo" },
                  { label: "Tasks", val: tasks.filter((t: any) => !t.completed).length, icon: Calendar, color: "amber" }
                ].map((s, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{s.label}</p>
                      <h4 className="text-4xl font-black mt-1 text-slate-800">{s.val}</h4>
                    </div>
                    <s.icon className={`absolute top-4 right-4 text-emerald-500 opacity-5 group-hover:scale-125 transition-transform`} size={80} />
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
                   <Button onClick={() => navigateTo('guide')} variant="secondary" className="bg-white text-emerald-900 hover:bg-emerald-50 border-none">Browse the Growth Wiki</Button>
                 </div>
              </Card>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card title="Recent Activity" action={<button onClick={() => navigateTo('calendar')} className="text-emerald-600 font-bold hover:underline">Full Schedule</button>}>
                    <div className="space-y-4">
                      {tasks.filter((t: any) => !t.completed).length === 0 ? (
                        <div className="text-center py-16 text-slate-300 italic border-2 border-dashed border-slate-50 rounded-3xl">
                          <Activity size={48} className="mx-auto mb-2 opacity-10" />
                          <p>No immediate tasks found.</p>
                        </div>
                      ) : (
                        tasks.filter((t: any) => !t.completed).slice(0, 5).map((task: any) => (
                          <div key={task.id} className="flex items-center space-x-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                            <input type="checkbox" className="w-5 h-5 accent-emerald-500 rounded cursor-pointer" onChange={() => setTasks(tasks.map((t: any) => t.id === task.id ? {...t, completed: true} : t))} />
                            <div className="flex-1">
                              <p className="font-bold text-slate-800">{task.title}</p>
                              <p className="text-xs text-slate-400 font-medium">{new Date(task.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>
                </div>
                <Card title="Quick Analytics">
                   <div className="space-y-6">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-slate-400 uppercase">Yield Velocity</span>
                           <BarChart3 size={14} className="text-emerald-500" />
                        </div>
                        <h4 className="text-3xl font-black text-slate-800">
                          {plants.reduce((sum, p) => sum + (p.harvestRecords?.length || 0), 0)} <span className="text-xs font-bold text-slate-400">Total Harvests</span>
                        </h4>
                      </div>
                      <Button variant="outline" className="w-full" onClick={() => navigateTo('reports')}>View Detailed Reports</Button>
                   </div>
                </Card>
              </div>
            </div>
          )}
          {activeView === 'reports' && <ReportsView plants={plants} />}
          {activeView === 'plants' && (
             <div className="space-y-8 animate-in fade-in duration-500 pb-20">
               <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-slate-800">Plant Registry</h3>
                  <Button onClick={() => { setSelectedItem(null); setModalType('plant'); setIsModalOpen(true); }}>Log New Plant</Button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {plants.map(p => (
                   <Card key={p.id} className="hover:shadow-xl transition-shadow group" title={p.name} action={<div className="flex gap-2"><button onClick={() => { setSelectedItem(p); setModalType('plant'); setIsModalOpen(true); }} className="text-slate-300 hover:text-emerald-500 transition-colors p-1"><Edit2 size={16}/></button><button onClick={() => deletePlant(p.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16}/></button></div>}>
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col">
                          <p className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full inline-block mb-1 ${p.status === 'Healthy' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                            {p.status}
                          </p>
                          <span className="text-sm text-slate-500 italic">{p.variety}</span>
                        </div>
                        <div className="text-right">
                           <p className="text-xl font-black text-slate-800">{p.harvestRecords?.reduce((s, h) => s + Number(h.amount), 0) || 0}g</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase">Total Yield</p>
                        </div>
                     </div>
                     
                     <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Activity size={10} /> Lifecycle Timeline
                        </p>
                        <PlantLifecycleTimeline plant={p} />
                     </div>

                     <div className="flex gap-3">
                        <Button variant="outline" className="text-xs py-2 px-3 flex-1 border-slate-100" onClick={() => { setSelectedItem(p); setModalType('harvest'); setIsModalOpen(true); }}>
                           <Scale size={14}/> Harvest Data
                        </Button>
                     </div>
                   </Card>
                 ))}
                 {plants.length === 0 && <div className="col-span-full py-32 text-center text-slate-300 italic border-2 border-dashed border-slate-100 rounded-[3rem]">No plants logged yet. Get started by adding your first seed.</div>}
               </div>
             </div>
          )}
          
          {/* Reuse the other views from the previous logic... */}
          {activeView === 'guide' && <GuideView />}
          {activeView === 'troubleshoot' && <TroubleshootView />}
          {activeView === 'setups' && (
             <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center"><h3 className="text-2xl font-bold text-slate-800">Systems</h3><Button onClick={() => { setSelectedItem(null); setModalType('setup'); setIsModalOpen(true); }}>Add System</Button></div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {setups.map(s => (
                   <Card key={s.id} title={s.name} action={<div className="flex gap-2"><button onClick={() => { setSelectedItem(s); setModalType('setup'); setIsModalOpen(true); }} className="text-slate-400 hover:text-emerald-500 transition-colors"><Edit2 size={16}/></button><button onClick={() => deleteSetup(s.id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={16}/></button></div>}>
                     <p className="text-xs font-bold text-emerald-600 uppercase mb-2">{s.type}</p>
                     <p className="text-sm text-slate-600 mb-4">{s.notes}</p>
                     <div className="flex justify-between items-center text-xs text-slate-400 font-bold"><span>{s.location}</span><span>{s.reservoirSize}</span></div>
                   </Card>
                 ))}
                 {setups.length === 0 && <div className="col-span-full py-20 text-center text-slate-300">No systems defined yet.</div>}
               </div>
             </div>
          )}
          {activeView === 'inventory' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between"><h3 className="text-2xl font-bold text-slate-800">Growth Pantry</h3><div className="flex gap-2"><Button variant="dark" onClick={() => { setModalType('equip'); setIsModalOpen(true); }}>Add Gear</Button><Button onClick={() => { setModalType('ingred'); setIsModalOpen(true); }}>Add Ingredient</Button></div></div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <Card title="Hardware">
                    <div className="space-y-2">
                      {inventory.equipment.length === 0 ? <p className="text-slate-300 italic text-sm">No hardware logged.</p> : inventory.equipment.map(e => <div key={e.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100"><span>{e.name} ({e.status})</span><button onClick={() => deleteEquipment(e.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button></div>)}
                    </div>
                 </Card>
                 <Card title="Nutrients">
                    <div className="space-y-2">
                      {inventory.ingredients.length === 0 ? <p className="text-slate-300 italic text-sm">No ingredients logged.</p> : inventory.ingredients.map(i => <div key={i.id} className="p-4 bg-white border border-slate-100 rounded-xl flex justify-between items-center shadow-sm"><span>{i.name} - {i.quantity}{i.unit}</span><button onClick={() => deleteIngredient(i.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button></div>)}
                    </div>
                 </Card>
               </div>
            </div>
          )}
          {activeView === 'calendar' && (
            <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-500">
               <h3 className="text-2xl font-bold text-slate-800">Tasks Schedule</h3>
               <form onSubmit={e => { e.preventDefault(); const f = e.target as any; addTask(f.task.value, f.date.value); f.reset(); }} className="flex gap-2">
                 <input name="task" required placeholder="What to do?" className="flex-1 p-4 border rounded-2xl bg-white shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                 <input name="date" required type="date" className="p-4 border rounded-2xl bg-white shadow-sm outline-none" />
                 <Button type="submit">Add</Button>
               </form>
               <div className="space-y-2">
                 {tasks.length === 0 ? <p className="text-center py-12 text-slate-300">Schedule is clear!</p> : tasks.map(t => <div key={t.id} className="p-5 bg-white rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm"><div><p className="font-bold text-slate-800">{t.title}</p><p className="text-xs text-slate-400 font-medium">{t.date}</p></div><button onClick={() => setTasks(tasks.filter(x => x.id !== t.id))} className="text-red-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button></div>)}
               </div>
            </div>
          )}
          {activeView === 'settings' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
              <Card title="Developer Settings">
                 <div className="space-y-4">
                   <p className="text-sm text-slate-500">Current PayPal ID: <strong>{paypalId}</strong></p>
                   <Button onClick={seedAppData} variant="dark">Seed Demo Data with Analytics</Button>
                 </div>
              </Card>
              <Card title="Data Management">
                 <div className="grid grid-cols-2 gap-4">
                   <Button onClick={handleExport} className="w-full"><Download size={18}/> Export Data</Button>
                   <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full"><Upload size={18}/> Restore Data</Button>
                   <input type="file" ref={fileInputRef} className="hidden" onChange={handleImport} />
                 </div>
              </Card>
            </div>
          )}
          {activeView === 'support' && (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
               <div className="text-center space-y-4">
                 <h2 className="text-5xl font-black text-slate-800">Support <span className="text-emerald-600">Us</span></h2>
                 <p className="text-slate-500 text-lg">Help us grow and improve the platform.</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[5, 15, 50].map(amt => (
                    <Card key={amt} className="text-center p-8 hover:shadow-2xl transition-all hover:-translate-y-1">
                      <Heart className="mx-auto text-red-500 mb-4" size={40} />
                      <h4 className="text-3xl font-black mb-6 text-slate-800">${amt}</h4>
                      <Button onClick={() => window.open(`https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=${paypalId}&amount=${amt}&currency_code=USD`, '_blank')} className="w-full">Donate</Button>
                    </Card>
                  ))}
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Global Modals */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalType?.toUpperCase() || ''}>
         {modalType === 'setup' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; const d = { name: f.sname.value, type: f.stype.value, startDate: f.sdate.value, reservoirSize: f.ssize.value, location: f.sloc.value, notes: f.snotes.value }; selectedItem ? updateSetup(selectedItem.id, d) : addSetup(d); setIsModalOpen(false); }}>
             <input name="sname" placeholder="System Name" required defaultValue={selectedItem?.name} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/5" />
             <select name="stype" defaultValue={selectedItem?.type || "Hydroponic"} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none"><option>Hydroponic</option><option>Kratky</option><option>DWC</option><option>Aquaponic</option><option>Aeroponic</option><option>NFT</option></select>
             <input name="ssize" placeholder="Reservoir (L)" defaultValue={selectedItem?.reservoirSize} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" />
             <input name="sdate" type="date" defaultValue={selectedItem?.startDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" />
             <input name="sloc" placeholder="Location" defaultValue={selectedItem?.location} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" />
             <textarea name="snotes" placeholder="Notes" defaultValue={selectedItem?.notes} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 h-24 outline-none focus:ring-4 focus:ring-emerald-500/5 resize-none" />
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
             status: f.pstatus.value,
             lastChecked: new Date().toISOString(), 
             notes: f.pnotes.value 
           }; selectedItem ? updatePlant(selectedItem.id, d) : addPlant(d); setIsModalOpen(false); }}>
             <select name="pId" defaultValue={selectedItem?.setupId} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none"><option value="">Standalone</option>{setups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
             <input name="pname" placeholder="Species (e.g. Basil)" required defaultValue={selectedItem?.name} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/5" />
             <input name="pvar" placeholder="Variety (e.g. Genovese)" defaultValue={selectedItem?.variety} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/5" />
             <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Planted</label>
                 <input name="pdate" type="date" defaultValue={selectedItem?.plantedDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" />
               </div>
               <div>
                 <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Germinated</label>
                 <input name="pgerm" type="date" defaultValue={selectedItem?.germinatedDate} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" />
               </div>
             </div>
             <div>
               <label className="text-[10px] uppercase font-bold text-slate-400 ml-2">Flowered / Fruited</label>
               <input name="pflow" type="date" defaultValue={selectedItem?.floweredDate} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" />
             </div>
             <select name="pstatus" defaultValue={selectedItem?.status || "Healthy"} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none">
                <option>Healthy</option>
                <option>Needs Attention</option>
                <option>Struggling</option>
                <option>Harvested</option>
             </select>
             <textarea name="pnotes" placeholder="Notes" defaultValue={selectedItem?.notes} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 h-24 outline-none focus:ring-4 focus:ring-emerald-500/5 resize-none" />
             <Button type="submit" className="w-full py-4 text-lg">{selectedItem ? "Update" : "Add"} Plant</Button>
           </form>
         )}
         {modalType === 'harvest' && (
           <div className="space-y-6">
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; addHarvest(selectedItem.id, { amount: Number(f.hamount.value), unit: f.hunit.value, date: f.hdate.value }); f.reset(); }}>
                <div className="flex gap-2">
                  <input name="hamount" type="number" step="0.1" placeholder="Amount" required className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/5" />
                  <select name="hunit" className="w-24 p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none"><option>g</option><option>kg</option><option>oz</option><option>pcs</option></select>
                </div>
                <input name="hdate" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" />
                <Button type="submit" className="w-full py-4">Save Harvest Record</Button>
              </form>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                 <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest px-2">Recent Logs for {selectedItem.name}</h4>
                 {selectedItem.harvestRecords?.slice().reverse().map((h: HarvestRecord) => (
                   <div key={h.id} className="p-3 bg-slate-50 rounded-xl flex justify-between items-center text-sm border border-slate-100">
                     <div>
                       <span className="font-bold text-emerald-600">{h.amount}{h.unit}</span>
                       <span className="text-slate-400 text-xs ml-2">{new Date(h.date).toLocaleDateString()}</span>
                     </div>
                     <button onClick={() => deleteHarvest(selectedItem.id, h.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                   </div>
                 ))}
                 {(!selectedItem.harvestRecords || selectedItem.harvestRecords.length === 0) && <p className="text-center py-4 text-slate-300 italic text-xs">No records logged yet.</p>}
              </div>
           </div>
         )}
         {/* Inventory forms stay same... */}
         {modalType === 'equip' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; addEquipment({ name: f.ename.value, category: f.ecat.value, status: 'Active', purchaseDate: new Date().toISOString(), notes: '' }); setIsModalOpen(false); }}>
             <input name="ename" placeholder="Device Name" required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/5" />
             <select name="ecat" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none"><option>Lighting</option><option>Pump</option><option>Monitoring</option><option>Structural</option><option>Other</option></select>
             <Button type="submit" variant="dark" className="w-full py-4 text-lg">Inventory Gear</Button>
           </form>
         )}
         {modalType === 'ingred' && (
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; addIngredient({ name: f.iname.value, brand: f.ibrand.value, quantity: f.iqty.value, unit: f.iunit.value, purpose: f.ipurp.value, notes: '' }); setIsModalOpen(false); }}>
             <input name="iname" placeholder="Item Name" required className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/5" />
             <input name="ibrand" placeholder="Brand" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" />
             <select name="ipurp" className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none"><option>Nutrient</option><option>pH Adjuster</option><option>Additive</option><option>Water Treatment</option></select>
             <div className="flex gap-2">
               <input name="iqty" placeholder="Qty" className="flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" />
               <input name="iunit" placeholder="Unit (e.g. ml)" className="w-24 p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" />
             </div>
             <Button type="submit" className="w-full py-4 text-lg">Save Item</Button>
           </form>
         )}
      </Modal>
    </div>
  );
}

// Sub-views moved inside main component for context access
const GuideView = () => {
  const [topic, setTopic] = useState('');
  const [guide, setGuide] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const commonTopics = [
    'pH Management', 'EC/PPM Basics', 'Kratky Method', 'Deep Water Culture', 
    'Nutrient Ratios', 'Lighting PAR/DLI', 'Water Temperature', 'Oxygenation'
  ];

  const fetchGuide = async (t: string) => {
    if (!t) return;
    setLoading(true);
    try {
      const res = await getGrowGuide(t);
      setGuide(res);
    } catch (e) {
      setGuide("Failed to fetch guide.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-800">Growth <span className="text-emerald-600">Wiki</span></h2>
        <p className="text-slate-500">Essential knowledge for soil-less success, powered by AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card title="Common Questions">
            <div className="flex flex-col gap-2">
              {commonTopics.map(t => (
                <button 
                  key={t} 
                  onClick={() => { setTopic(t); fetchGuide(t); }} 
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl text-sm font-bold transition-all border border-slate-100"
                >
                  {t}
                </button>
              ))}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full min-h-[500px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                <p className="font-bold">Consulting the grow masters...</p>
              </div>
            ) : guide ? (
              <div className="prose prose-emerald p-2">
                <div className="whitespace-pre-wrap text-slate-600 leading-relaxed text-sm p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  {guide}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 italic text-center">
                 <BookOpen size={64} className="mb-4 opacity-10" />
                 <p>Select a topic to view the guide.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const TroubleshootView = () => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImage(base64String.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!description) return;
    setLoading(true);
    try {
      const result = await troubleshootPlant(description, image || undefined);
      setDiagnosis(result);
    } catch (e) {
      setDiagnosis("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-800">AI <span className="text-emerald-600">Botanist</span></h2>
        <p className="text-slate-500">Expert diagnosis for your plant issues.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Symptom Input">
            <div className="space-y-4">
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe leaf spots, curling, wilting..." 
                className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 h-32 outline-none focus:ring-4 focus:ring-emerald-500/5 resize-none text-sm" 
              />
              <div 
                onClick={() => document.getElementById('troubleshoot-img-file')?.click()}
                className="w-full h-40 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-emerald-50 transition-all relative overflow-hidden"
              >
                {image ? (
                  <img src={`data:image/jpeg;base64,${image}`} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Droplets className="text-emerald-500 mx-auto mb-2 opacity-50" size={32} />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Upload Photo</p>
                  </div>
                )}
              </div>
              <input id="troubleshoot-img-file" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              <Button onClick={handleAnalyze} disabled={loading || !description} className="w-full">Run Analysis</Button>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card title="Results" className="h-full min-h-[400px]">
            {loading ? <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto mt-20" /> : diagnosis ? (
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-sm whitespace-pre-wrap text-slate-600">{diagnosis}</div>
            ) : <p className="text-center py-20 text-slate-300 italic">Report will appear here.</p>}
          </Card>
        </div>
      </div>
    </div>
  );
};
