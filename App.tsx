
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
  Camera,
  Thermometer,
  Waves
} from 'lucide-react';
import { 
  ViewState, Setup, Plant, Equipment, Ingredient, Task, HarvestRecord, WaterLog 
} from './types.ts';
import { troubleshootPlant, getDailyTip, getGrowGuide, getPlantProjections, generateStarterKit } from './services/geminiService.ts';

// --- Shared UI Components ---

// Reusable button component with various style variants
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

// Modal dialog component for capturing inputs or showing details
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

// Main application component containing routing logic and global state
const App = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [dailyTip, setDailyTipStr] = useState<string>("Loading your daily grower tip...");

  // Effect to fetch a personalized tip from Gemini on initial load
  useEffect(() => {
    getDailyTip().then(setDailyTipStr).catch(() => setDailyTipStr("Maintain water temps between 18-22°C for optimal root health."));
  }, []);

  // Helper component for navigation items
  const SidebarItem = ({ id, icon: Icon, label }: { id: ViewState, icon: any, label: string }) => (
    <button
      onClick={() => setView(id)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
        view === id 
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col p-6 space-y-8 shrink-0">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Sprout size={24} />
          </div>
          <span className="text-2xl font-black tracking-tight text-emerald-600">HydroMaster</span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="setups" icon={Layers} label="Systems" />
          <SidebarItem id="plants" icon={Sprout} label="My Plants" />
          <SidebarItem id="inventory" icon={FlaskConical} label="Nutrients" />
          <SidebarItem id="calendar" icon={Calendar} label="Schedule" />
          <SidebarItem id="troubleshoot" icon={Stethoscope} label="AI Diagnosis" />
          <SidebarItem id="reports" icon={BarChart3} label="Analytics" />
          <SidebarItem id="guide" icon={BookOpen} label="Growing Guide" />
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <SidebarItem id="settings" icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main UI Area */}
      <main className="flex-1 overflow-y-auto p-10 bg-slate-50">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 capitalize tracking-tight">{view}</h1>
            <p className="text-slate-500 mt-1 font-medium">{dailyTip}</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="px-4"><Search size={20}/></Button>
            <Button onClick={() => {}} className="shadow-emerald-100">
              <Plus size={20} />
              <span>New Entry</span>
            </Button>
          </div>
        </header>

        {/* Dashboard: Overview of metrics and system health */}
        {view === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold flex items-center space-x-2 text-slate-700">
                  <Activity className="text-emerald-500" />
                  <span>Real-time Vitals</span>
                </h2>
                <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>Sensors Online</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col justify-between h-36">
                  <div className="text-blue-600 flex items-center space-x-2">
                    <Droplets size={18}/> 
                    <span className="text-xs font-black uppercase tracking-widest opacity-80">Average pH</span>
                  </div>
                  <div className="text-4xl font-black text-blue-900">6.2</div>
                </div>
                <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100 flex flex-col justify-between h-36">
                  <div className="text-orange-600 flex items-center space-x-2">
                    <Waves size={18}/> 
                    <span className="text-xs font-black uppercase tracking-widest opacity-80">Avg EC</span>
                  </div>
                  <div className="text-4xl font-black text-orange-900">1.8 <span className="text-sm font-bold opacity-40">mS/cm</span></div>
                </div>
                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col justify-between h-36">
                  <div className="text-emerald-600 flex items-center space-x-2">
                    <Thermometer size={18}/> 
                    <span className="text-xs font-black uppercase tracking-widest opacity-80">Water Temp</span>
                  </div>
                  <div className="text-4xl font-black text-emerald-900">21.5<span className="text-xl font-bold">°C</span></div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-600 p-8 rounded-3xl text-white shadow-xl shadow-emerald-200 flex flex-col justify-between relative overflow-hidden group">
              <Sparkles className="absolute -top-6 -right-6 w-32 h-32 text-emerald-400 opacity-20 rotate-12 group-hover:rotate-45 transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-inner">
                  <Timer className="text-white" size={28} />
                </div>
                <h3 className="text-2xl font-black leading-tight">Harvest Forecast</h3>
                <p className="text-emerald-50 mt-3 text-lg font-medium">
                  Your <span className="text-white underline underline-offset-4 decoration-emerald-300">Genovese Basil</span> is ready in <span className="font-black">3 days</span>.
                </p>
              </div>
              <button className="relative z-10 mt-8 flex items-center space-x-2 text-white font-black hover:translate-x-3 transition-transform duration-300">
                <span>OPEN CALENDAR</span>
                <ArrowRight size={20} />
              </button>
            </div>

            {/* Logs and status widgets */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold mb-6 flex items-center space-x-2 text-slate-800">
                <History size={20} className="text-slate-400" />
                <span>Recent Logs</span>
              </h3>
              <div className="space-y-6">
                {[
                  { title: 'pH Adjusted', system: 'Lettuce DWC', time: '1h ago', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
                  { title: 'Nutrients Added', system: 'NFT Herbs', time: '4h ago', icon: FlaskConical, color: 'text-purple-500', bg: 'bg-purple-50' },
                  { title: 'Harvest Recorded', system: 'Basil Tower', time: 'Yesterday', icon: Scale, color: 'text-amber-500', bg: 'bg-amber-50' }
                ].map((log, i) => (
                  <div key={i} className="flex items-center space-x-4 group cursor-pointer">
                    <div className={`w-11 h-11 rounded-xl ${log.bg} ${log.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <log.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800 leading-none mb-1">{log.title}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{log.system} • {log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold mb-6 flex items-center space-x-2 text-slate-800">
                <Zap size={20} className="text-amber-500" />
                <span>Quick Stats</span>
              </h3>
              <div className="space-y-5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Nutrient Level</span>
                    <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase">Refill Soon</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[22%] rounded-full shadow-sm"></div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Growth Success</span>
                    <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">Optimal</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[94%] rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-sm">
                <Leaf size={36} />
              </div>
              <div className="text-6xl font-black text-slate-800 tracking-tighter">24</div>
              <div className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mt-3">Active Plants Growing</div>
            </div>
          </div>
        )}

        {/* AI Troubleshoot: Diagnostic interface powered by Gemini */}
        {view === 'troubleshoot' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex items-center space-x-6 mb-10">
                <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center shadow-sm">
                  <Stethoscope size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">AI Plant Doctor</h2>
                  <p className="text-slate-500 text-lg">Describe the symptoms or upload a photo for professional diagnosis.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="relative group">
                  <textarea 
                    className="w-full h-52 p-8 bg-slate-50/50 rounded-[2rem] border-2 border-slate-100 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-700 text-lg leading-relaxed placeholder:text-slate-300 resize-none shadow-inner"
                    placeholder="Ex: My lettuce leaves are turning yellow at the edges and feel soft, roots look brownish..."
                  ></textarea>
                  <div className="absolute bottom-6 right-8 text-[10px] font-black text-slate-400 uppercase tracking-widest pointer-events-none group-focus-within:opacity-0 transition-opacity">Gemini 3 Pro Powered</div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="secondary" className="flex-1 py-5 rounded-2xl text-lg shadow-sm">
                    <Camera size={24} />
                    <span>Take/Upload Photo</span>
                  </Button>
                  <Button className="flex-1 py-5 rounded-2xl text-lg shadow-xl shadow-emerald-200">
                    <span>Analyze Health</span>
                    <ChevronRight size={24} />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="font-bold text-slate-800 flex items-center space-x-2 mb-4">
                  <Activity size={20} className="text-rose-500" />
                  <span>How Diagnosis Works</span>
                </h4>
                <p className="text-slate-600 leading-relaxed text-sm">
                  Our expert model uses visual and textual pattern matching against thousands of botanical cases to pinpoint nutrient imbalances, pests, and bacterial infections.
                </p>
              </div>
              <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 shadow-sm">
                <h4 className="font-bold text-amber-800 flex items-center space-x-2 mb-4">
                  <Star size={20} fill="currentColor" />
                  <span>Grower Wisdom</span>
                </h4>
                <p className="text-amber-800/80 leading-relaxed text-sm italic font-medium">
                  "Most common indoor growing issues are caused by incorrect pH or root zone temperature. Always verify your equipment first."
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View placeholders */}
        {view !== 'dashboard' && view !== 'troubleshoot' && (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mb-8 text-slate-300 shadow-inner">
              <Wrench size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-400 tracking-tight">Section Coming Soon</h2>
            <p className="text-slate-400 mt-2 font-medium">We're hard at work building advanced {view} tools.</p>
            <Button variant="outline" className="mt-10" onClick={() => setView('dashboard')}>
              Return to Dashboard
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
