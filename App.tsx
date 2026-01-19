import React, { useState, useEffect, useRef } from 'react';
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
  Upload
} from 'lucide-react';
import { 
  ViewState, Setup, Plant, Equipment, Ingredient, Task 
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

// --- Content Views ---

const LandingPage = ({ onEnterApp, onGoToSupport }: any) => (
  <div className="bg-white min-h-screen text-slate-900 selection:bg-emerald-100">
    <nav className="fixed top-0 w-full z-50 px-8 py-6 flex items-center justify-between glass-effect">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xl">
          <Sprout size={24} />
        </div>
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

const DashboardView = ({ setups, plants, inventory, tasks, setTasks, dailyTip, setActiveView }: any) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: "Systems", val: setups.length, icon: Layers, color: "emerald" },
        { label: "Plants", val: plants.length, icon: Sprout, color: "sky" },
        { label: "Inventory", val: (inventory.equipment?.length || 0) + (inventory.ingredients?.length || 0), icon: FlaskConical, color: "indigo" },
        { label: "Tasks", val: tasks.filter((t: any) => !t.completed).length, icon: Calendar, color: "amber" }
      ].map((s, i) => (
        <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{s.label}</p>
            <h4 className="text-4xl font-black mt-1 text-slate-800">{s.val}</h4>
          </div>
          <s.icon className={`absolute top-4 right-4 text-emerald-500 opacity-5 group-hover:scale-125 transition-transform`} size={80} />
        </div>
      ))}
    </div>

    {setups.length === 0 && (
      <Card title="Quick Start Roadmap" className="bg-emerald-50 border-emerald-100">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { title: "1. Define System", desc: "Choose a Kratky or DWC system to start simple.", icon: Layers, view: 'setups' },
             { title: "2. Log Seeds", desc: "Tell us what you're planting to track progress.", icon: Sprout, view: 'plants' },
             { title: "3. Check Wiki", desc: "Learn the basics of pH and Light cycles.", icon: BookOpen, view: 'guide' }
           ].map((step, i) => (
             <div key={i} className="p-6 bg-white rounded-2xl shadow-sm border border-emerald-100 cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all" onClick={() => setActiveView(step.view)}>
               <step.icon className="text-emerald-600 mb-4" />
               <h4 className="font-bold text-slate-800">{step.title}</h4>
               <p className="text-xs text-slate-500 leading-relaxed mt-1">{step.desc}</p>
             </div>
           ))}
         </div>
      </Card>
    )}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card title="Upcoming Tasks" action={<button onClick={() => setActiveView('calendar')} className="text-emerald-600 font-bold hover:underline">View All</button>}>
          <div className="space-y-4">
            {tasks.filter((t: any) => !t.completed).length === 0 ? (
              <div className="text-center py-16 text-slate-300">
                <Calendar size={48} className="mx-auto mb-2 opacity-20" />
                <p>No pending tasks for today.</p>
              </div>
            ) : (
              tasks.filter((t: any) => !t.completed).slice(0, 5).map((task: any) => (
                <div key={task.id} className="flex items-center space-x-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                  <input type="checkbox" className="w-5 h-5 accent-emerald-500" onChange={() => setTasks(tasks.map((t: any) => t.id === task.id ? {...t, completed: true} : t))} />
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
      <div>
        <Card className="bg-emerald-900 text-white border-none shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10"><Leaf size={140}/></div>
           <div className="relative z-10 space-y-6 py-4">
             <div className="flex items-start space-x-3">
               <div className="p-3 bg-emerald-500 rounded-2xl"><Zap size={24}/></div>
               <div>
                 <h4 className="font-bold uppercase tracking-widest text-emerald-400 text-xs mb-2">Grower Intelligence</h4>
                 <p className="text-lg font-medium italic leading-relaxed">"{dailyTip}"</p>
               </div>
             </div>
             <Button onClick={() => setActiveView('guide')} variant="secondary" className="w-full bg-white text-emerald-900 hover:bg-emerald-50">Open Guide Wiki</Button>
           </div>
        </Card>
      </div>
    </div>
  </div>
);

const GuideView = () => {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const topics = ["pH Balance", "EC and PPM", "Light Cycles", "Root Rot", "Nutrient Deficiencies", "Aquaponic Cycling"];

  const fetchGuide = async (t: string) => {
    setLoading(true);
    setTopic(t);
    const res = await getGrowGuide(t);
    setContent(res);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-800">Grower's Wiki</h2>
        <p className="text-slate-500">Instant AI-generated guides for complex hydroponic concepts.</p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        {topics.map(t => (
          <button key={t} onClick={() => fetchGuide(t)} className={`px-6 py-3 rounded-full font-bold transition-all ${topic === t ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-emerald-50'}`}>
            {t}
          </button>
        ))}
      </div>
      <Card className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-32 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent" />
            <p className="font-bold text-slate-400">Consulting Botanist AI...</p>
          </div>
        ) : content ? (
          <div className="prose prose-emerald max-w-none p-4">
            <h3 className="text-2xl font-bold mb-4">{topic}</h3>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">{content}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-32 text-slate-300 opacity-20">
            <BookOpen size={100} />
            <p className="text-xl font-black italic">Select a topic to learn more</p>
          </div>
        )}
      </Card>
    </div>
  );
};

const TroubleshootView = () => {
  const [issue, setIssue] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);

  const handleRun = async () => {
    if(!issue && !image) return;
    setLoading(true);
    const res = await troubleshootPlant(issue, image?.split(',')[1]);
    setDiagnosis(res);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom duration-500">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-black text-slate-800">AI Plant Consultant</h2>
        <p className="text-slate-500 text-lg">Describe or photograph plant symptoms for a professional diagnosis.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <Card title="Describe Symptom">
          <textarea value={issue} onChange={e => setIssue(e.target.value)} placeholder="What's wrong?" className="w-full h-48 p-6 rounded-3xl border border-slate-100 bg-slate-50 outline-none mb-6 resize-none focus:ring-2 focus:ring-emerald-500" />
          <div className="relative border-4 border-dashed border-slate-100 rounded-3xl p-10 flex flex-col items-center justify-center mb-6 group cursor-pointer hover:border-emerald-200 transition-colors">
            {image ? (
              <div className="relative w-full h-full">
                <img src={image} className="w-full h-auto rounded-2xl shadow-xl" alt="Symptom" />
                <button onClick={() => setImage(null)} className="absolute -top-4 -right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform"><X size={16}/></button>
              </div>
            ) : (
              <>
                <Plus className="text-slate-300 mb-2 group-hover:scale-110 transition-transform" size={40} />
                <p className="text-sm font-bold text-slate-400">Upload Symptom Photo</p>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => {
                  const f = e.target.files?.[0];
                  if(f) { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(f); }
                }} />
              </>
            )}
          </div>
          <Button className="w-full py-5 text-lg" onClick={handleRun} disabled={loading}>
            {loading ? <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" /> : "Analyze Health Issue"}
          </Button>
        </Card>
        <Card title="Diagnosis">
          {diagnosis ? (
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap p-8 bg-slate-50 rounded-3xl border border-slate-100 animate-in fade-in zoom-in-95">{diagnosis}</div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-32 text-slate-300 opacity-20">
              <Stethoscope size={100} className="mb-6" />
              <p className="text-xl font-black italic">Waiting for input...</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// --- App Root ---

export default function App() {
  const [mode, setMode] = useState<'website' | 'platform'>('website');
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dailyTip, setDailyTip] = useState<string>("Loading your grower intelligence...");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
  const [modalType, setModalType] = useState<'setup' | 'plant' | 'equip' | 'ingred' | null>(null);
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

  const addPlant = (data: any) => setPlants([...plants, { ...data, id: Date.now().toString() }]);
  const updatePlant = (id: string, data: any) => setPlants(plants.map(p => p.id === id ? { ...p, ...data } : p));
  const deletePlant = (id: string) => confirm("Delete plant log?") && setPlants(plants.filter(p => p.id !== id));

  const addEquipment = (data: any) => setInventory(prev => ({ ...prev, equipment: [...prev.equipment, { ...data, id: Date.now().toString() }] }));
  const deleteEquipment = (id: string) => setInventory(prev => ({ ...prev, equipment: prev.equipment.filter(e => e.id !== id) }));
  
  const addIngredient = (data: any) => setInventory(prev => ({ ...prev, ingredients: [...prev.ingredients, { ...data, id: Date.now().toString() }] }));
  const deleteIngredient = (id: string) => setInventory(prev => ({ ...prev, ingredients: prev.ingredients.filter(i => i.id !== id) }));

  const addTask = (title: string, date: string) => setTasks([...tasks, { id: Date.now().toString(), title, date, completed: false, priority: 'Medium' }]);

  const seedAppData = () => {
    const demoSetup: Setup = { id: 'demo-1', name: 'Kitchen Herb Station', type: 'Kratky', startDate: new Date().toISOString(), reservoirSize: '10L', location: 'Kitchen Counter', notes: 'Beginner-friendly low maintenance setup.' };
    const demoPlant: Plant = { id: 'demo-p1', setupId: 'demo-1', name: 'Sweet Basil', variety: 'Genovese', plantedDate: new Date().toISOString(), status: 'Healthy', lastChecked: new Date().toISOString(), notes: 'First true leaves appearing.' };
    setSetups([demoSetup]);
    setPlants([demoPlant]);
    alert("Demo garden seeded!");
    setActiveView('dashboard');
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
          setActiveView('dashboard');
        }} 
        onGoToSupport={() => { 
          setMode('platform'); 
          setActiveView('support'); 
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setMode('website')}>
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-xl"><Sprout size={24} /></div>
              <h1 className="text-xl font-black text-slate-800 tracking-tighter">HydroGrow</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><X/></button>
          </div>
          <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
            <SidebarItem icon={Layers} label="Systems" active={activeView === 'setups'} onClick={() => setActiveView('setups')} />
            <SidebarItem icon={Sprout} label="Plants" active={activeView === 'plants'} onClick={() => setActiveView('plants')} />
            <SidebarItem icon={BookOpen} label="Grower's Wiki" active={activeView === 'guide'} onClick={() => setActiveView('guide')} />
            <SidebarItem icon={Stethoscope} label="AI Consultant" active={activeView === 'troubleshoot'} onClick={() => setActiveView('troubleshoot')} />
            <SidebarItem icon={FlaskConical} label="Inventory" active={activeView === 'inventory'} onClick={() => setActiveView('inventory')} />
            <SidebarItem icon={Calendar} label="Calendar" active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} />
            <SidebarItem icon={Settings} label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
            <SidebarItem icon={Heart} label="Support Us" active={activeView === 'support'} onClick={() => setActiveView('support')} />
          </nav>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 glass-effect sticky top-0 z-30 flex items-center justify-between px-10 border-b border-slate-100 shrink-0">
           <div className="flex items-center space-x-4">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"><Menu/></button>
             <h2 className="text-xl font-bold text-slate-800">{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h2>
           </div>
           <div className="flex items-center space-x-6">
             <div onClick={() => setActiveView('settings')} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all">
                <img src="https://picsum.photos/seed/user/100" alt="User" />
             </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 scroll-smooth">
          {activeView === 'dashboard' && <DashboardView setups={setups} plants={plants} inventory={inventory} tasks={tasks} setTasks={setTasks} dailyTip={dailyTip} setActiveView={setActiveView} />}
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
               </div>
             </div>
          )}
          {activeView === 'plants' && (
             <div className="space-y-8 animate-in fade-in duration-500">
               <div className="flex justify-between items-center"><h3 className="text-2xl font-bold text-slate-800">Plants</h3><Button onClick={() => { setSelectedItem(null); setModalType('plant'); setIsModalOpen(true); }}>Log Plant</Button></div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {plants.map(p => (
                   <Card key={p.id} title={p.name} action={<div className="flex gap-2"><button onClick={() => { setSelectedItem(p); setModalType('plant'); setIsModalOpen(true); }} className="text-slate-400 hover:text-emerald-500 transition-colors"><Edit2 size={16}/></button><button onClick={() => deletePlant(p.id)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={16}/></button></div>}>
                     <p className="text-xs font-black text-emerald-500 uppercase">{p.status}</p>
                     <p className="text-sm text-slate-500 italic mt-1">{p.variety}</p>
                   </Card>
                 ))}
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
                   <Button onClick={seedAppData} variant="dark">Seed Demo Data</Button>
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
           <form className="space-y-4" onSubmit={e => { e.preventDefault(); const f = e.currentTarget; const d = { setupId: f.pId.value, name: f.pname.value, variety: f.pvar.value, plantedDate: f.pdate.value, status: 'Healthy', lastChecked: new Date().toISOString(), notes: '' }; selectedItem ? updatePlant(selectedItem.id, d) : addPlant(d); setIsModalOpen(false); }}>
             <select name="pId" defaultValue={selectedItem?.setupId} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none"><option value="">Standalone</option>{setups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
             <input name="pname" placeholder="Species (e.g. Basil)" required defaultValue={selectedItem?.name} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/5" />
             <input name="pvar" placeholder="Variety (e.g. Genovese)" defaultValue={selectedItem?.variety} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/5" />
             <input name="pdate" type="date" defaultValue={selectedItem?.plantedDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" />
             <Button type="submit" className="w-full py-4 text-lg">{selectedItem ? "Update" : "Add"} Plant</Button>
           </form>
         )}
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