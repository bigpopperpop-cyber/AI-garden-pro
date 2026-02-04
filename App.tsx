import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  Settings, 
  Plus, 
  Bell, 
  X, 
  Leaf,
  Calendar as CalendarIcon,
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
  FileUp,
  Camera,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Trophy,
  Target,
  Pencil,
  Undo2
} from 'lucide-react';
import { ViewState, Garden, Notification, GardenType, Plant, LifecycleStage, GardenNote, Reminder } from './types.ts';

// --- Shared UI Components ---

const Card = ({ children, className = "", onClick }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-sm border border-slate-100 ${className}`}
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
      className={`px-4 md:px-5 py-2 md:py-2.5 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 ${variants[variant]} ${className}`}
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

const getDaysRemaining = (targetDate?: string) => {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  const now = new Date();
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
};

const compressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

// --- Calendar View ---

const CalendarView = ({ reminders, onAddReminder, onToggleReminder, onDeleteReminder }: any) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState('');

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const numDays = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= numDays; i++) days.push(i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getRemindersForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reminders.filter((r: Reminder) => r.date === dateStr);
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(dateStr);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-10">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-black text-slate-800">{monthNames[month]} {year}</h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><ChevronLeft size={20}/></button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400"><ChevronRight size={20}/></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-3">
          {["S", "M", "T", "W", "T", "F", "S"].map(d => (
            <div key={d} className="text-center text-[10px] font-black uppercase text-slate-400 py-2">{d}</div>
          ))}
          {days.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />;
            const dayReminders = getRemindersForDay(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            return (
              <button 
                key={day} 
                onClick={() => handleDayClick(day)}
                className={`aspect-square p-1 md:p-2 rounded-xl md:rounded-2xl border transition-all text-left flex flex-col group relative ${isToday ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-50 bg-slate-50/50 hover:bg-white hover:border-emerald-200'}`}
              >
                <span className={`text-[10px] md:text-xs font-black ${isToday ? 'text-emerald-600' : 'text-slate-600'}`}>{day}</span>
                <div className="mt-auto flex flex-wrap gap-0.5 md:gap-1">
                  {dayReminders.slice(0, 3).map((r: Reminder) => (
                    <div key={r.id} className={`w-1 md:w-1.5 h-1 md:h-1.5 rounded-full ${r.completed ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                  ))}
                  {dayReminders.length > 3 && <span className="text-[6px] md:text-[8px] font-bold text-slate-400">+{dayReminders.length - 3}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="flex flex-col h-[400px]">
          <h3 className="text-lg font-black mb-4 flex items-center gap-2"><Bell className="text-emerald-600" size={18} /> Pending Reminders</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {reminders.sort((a: Reminder, b: Reminder) => a.date.localeCompare(b.date)).filter((r: Reminder) => !r.completed).map((r: Reminder) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                <div className="flex items-center gap-3 overflow-hidden">
                  <button onClick={() => onToggleReminder(r.id)} className="text-slate-300 hover:text-emerald-500 shrink-0"><Square size={18} /></button>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{r.title}</p>
                    <p className="text-[9px] font-black uppercase text-slate-400">{r.date}</p>
                  </div>
                </div>
                <button onClick={() => onDeleteReminder(r.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
            ))}
            {reminders.filter((r: Reminder) => !r.completed).length === 0 && (
              <p className="text-center py-12 text-slate-300 italic text-sm">No pending tasks.</p>
            )}
          </div>
        </Card>

        <Card className="flex flex-col h-[400px]">
          <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-slate-400"><CheckCircle2 size={18} /> History</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {reminders.filter((r: Reminder) => r.completed).sort((a: Reminder, b: Reminder) => b.date.localeCompare(a.date)).slice(0, 10).map((r: Reminder) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-50 opacity-60">
                <div className="flex items-center gap-3 overflow-hidden">
                  <button onClick={() => onToggleReminder(r.id)} className="text-emerald-500 shrink-0"><CheckSquare size={18} /></button>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 line-through truncate">{r.title}</p>
                    <p className="text-[9px] font-black uppercase text-slate-400">{r.date}</p>
                  </div>
                </div>
                <button onClick={() => onDeleteReminder(r.id)} className="p-1 text-slate-200 hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 md:p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black mb-6">Reminder for {selectedDateStr}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget;
              const title = (f.elements.namedItem('rtitle') as HTMLInputElement).value;
              onAddReminder({
                id: Date.now().toString(),
                title,
                date: selectedDateStr,
                completed: false,
                priority: 'medium'
              });
              setIsAddModalOpen(false);
            }} className="space-y-4">
              <input name="rtitle" autoFocus placeholder="Task (e.g. Flush system)" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none font-bold text-sm" />
              <Button type="submit" className="w-full py-4">Save Task</Button>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="w-full text-slate-400 font-bold py-2 text-sm">Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Dashboard View ---

const DashboardView = ({ gardens, reminders, onToggleReminder, setView, onGardenSelect, onShareApp }: any) => {
  const allPlants = gardens.flatMap((g: Garden) => g.plants);
  const totalPlants = allPlants.length;
  const pendingReminders = reminders.filter((r: Reminder) => !r.completed);
  
  const latestActivity = gardens
    .flatMap((g: Garden) => [
      ...g.plants.flatMap((p: Plant) => p.notes.map(n => ({ ...n, owner: p.name, type: 'Plant' }))),
      ...g.notes.map(n => ({ ...n, owner: g.name, type: 'System' }))
    ])
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="bg-emerald-600 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
        <Leaf className="absolute -bottom-6 -right-6 w-24 h-24 md:w-32 md:h-32 text-emerald-500/20 rotate-12 hidden sm:block" />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl md:text-4xl font-black mb-1 md:mb-2 tracking-tight">Growth Dashboard</h2>
              <p className="text-emerald-50/90 font-medium italic text-sm md:text-lg opacity-80">Welcome to your local oasis.</p>
            </div>
            <button onClick={onShareApp} className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-xl md:rounded-2xl border border-white/10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Globe size={14} /><span className="hidden xs:inline">Share</span></button>
          </div>
          <div className="flex gap-3 md:gap-4 mt-6 md:mt-8">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl shrink-0"><p className="text-[8px] font-black uppercase text-emerald-200">Gardens</p><p className="text-xl font-black">{gardens.length}</p></div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl shrink-0"><p className="text-[8px] font-black uppercase text-emerald-200">Specimens</p><p className="text-xl font-black">{totalPlants}</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2"><CheckSquare className="text-emerald-600" size={20} /> Today's Tasks</h3>
              <button onClick={() => setView('calendar')} className="text-xs font-black uppercase text-emerald-600 hover:underline">Full Schedule</button>
            </div>
            <div className="space-y-3">
              {pendingReminders.slice(0, 4).map((r: Reminder) => (
                <div key={r.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <button onClick={() => onToggleReminder(r.id)} className="text-slate-300 hover:text-emerald-500 shrink-0"><Square size={20} /></button>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{r.title}</p>
                    <p className="text-[10px] font-black uppercase text-slate-400">{r.date}</p>
                  </div>
                </div>
              ))}
              {pendingReminders.length === 0 && <p className="text-center py-10 text-slate-300 italic text-sm">All tasks completed!</p>}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800">My Systems</h3>
              <button onClick={() => setView('gardens')} className="text-emerald-600 text-[10px] font-black uppercase hover:underline">Manage All</button>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
              {gardens.slice(0, 4).map((g: Garden) => (
                <button key={g.id} onClick={() => onGardenSelect(g.id)} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all text-left outline-none group">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${g.type === 'Indoor' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>{g.type === 'Indoor' ? <Home size={18} /> : <Sun size={18} />}</div>
                    <div className="min-w-0"><p className="font-bold text-slate-800 text-sm truncate">{g.name}</p><p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase">{g.plants?.length || 0} Plants</p></div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Card className="bg-slate-900 text-white h-fit">
          <h3 className="text-sm font-black uppercase tracking-tight mb-6 flex items-center gap-2"><History size={18} className="text-emerald-400" /> Recent Logs</h3>
          <div className="space-y-4">
            {latestActivity.map((note: any) => (
              <div key={note.id} className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[9px] font-black text-emerald-400 uppercase truncate max-w-[100px]">{note.owner}</span>
                  <span className="text-[8px] text-slate-500">{note.date.split(',')[0]}</span>
                </div>
                <p className="text-[10px] text-slate-300 italic line-clamp-2">"{note.content}"</p>
              </div>
            ))}
            {latestActivity.length === 0 && <p className="text-slate-500 text-center py-6 text-xs italic">No activity yet.</p>}
          </div>
        </Card>
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
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const saved = localStorage.getItem('hydro_reminders');
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
  const [newGardenNoteText, setNewGardenNoteText] = useState('');
  const [yieldAmount, setYieldAmount] = useState<string>('');
  const [yieldUnit, setYieldUnit] = useState<string>('g');

  // Note editing state
  const [editingNoteInfo, setEditingNoteInfo] = useState<{id: string, type: 'plant' | 'system'} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const selectedGarden = gardens.find(g => g.id === selectedGardenId);
  const inspectedPlant = selectedGarden?.plants.find(p => p.id === selectedPlantId);

  useEffect(() => {
    localStorage.setItem('hydro_gardens_core', JSON.stringify(gardens));
  }, [gardens]);

  useEffect(() => {
    localStorage.setItem('hydro_reminders', JSON.stringify(reminders));
  }, [reminders]);

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

  const handleAddReminder = (r: Reminder) => setReminders(prev => [...prev, r]);
  const handleToggleReminder = (id: string) => setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  const handleDeleteReminder = (id: string) => setReminders(prev => prev.filter(r => r.id !== id));

  const handleGardenSelect = (id: string) => {
    setSelectedGardenId(id);
    setView('gardens');
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
    const variety = (f.elements.namedItem('pvariety') as HTMLInputElement).value;
    const plantedDate = (f.elements.namedItem('pdate') as HTMLInputElement).value;
    const projectedHarvestDate = (f.elements.namedItem('pharvest') as HTMLInputElement).value;
    
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g, plants: [...g.plants, { 
        id: Date.now().toString(), 
        name, 
        variety,
        plantedDate, 
        projectedHarvestDate,
        stage: 'Germination', 
        harvests: [], 
        notes: [], 
        phasePhotos: {} 
      }]
    } : g));
    setIsPlantModalOpen(false);
  };

  const addPlantNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGardenId || !selectedPlantId || !newNoteText.trim()) return;
    
    if (editingNoteInfo && editingNoteInfo.type === 'plant') {
      setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
        ...g, plants: g.plants.map(p => p.id === selectedPlantId ? { 
          ...p, 
          notes: p.notes.map(n => n.id === editingNoteInfo.id ? { ...n, content: newNoteText.trim() } : n) 
        } : p)
      } : g));
      setEditingNoteInfo(null);
    } else {
      const newNote = { id: Date.now().toString(), date: new Date().toLocaleString(), content: newNoteText.trim() };
      setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
        ...g, plants: g.plants.map(p => p.id === selectedPlantId ? { ...p, notes: [newNote, ...p.notes] } : p)
      } : g));
    }
    setNewNoteText('');
  };

  const deletePlantNote = (noteId: string) => {
    if (!selectedGardenId || !selectedPlantId || !confirm("Delete this log?")) return;
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g, plants: g.plants.map(p => p.id === selectedPlantId ? { 
        ...p, 
        notes: p.notes.filter(n => n.id !== noteId) 
      } : p)
    } : g));
  };

  const addGardenNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGardenId || !newGardenNoteText.trim()) return;

    if (editingNoteInfo && editingNoteInfo.type === 'system') {
      setGardens(prev => prev.map(g => g.id === selectedGardenId ? { 
        ...g, 
        notes: g.notes.map(n => n.id === editingNoteInfo.id ? { ...n, content: newGardenNoteText.trim() } : n) 
      } : g));
      setEditingNoteInfo(null);
    } else {
      const newNote = { id: Date.now().toString(), date: new Date().toLocaleString(), content: newGardenNoteText.trim() };
      setGardens(prev => prev.map(g => g.id === selectedGardenId ? { ...g, notes: [newNote, ...g.notes] } : g));
    }
    setNewGardenNoteText('');
  };

  const deleteGardenNote = (noteId: string) => {
    if (!selectedGardenId || !confirm("Delete this log?")) return;
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? { 
      ...g, 
      notes: g.notes.filter(n => n.id !== noteId) 
    } : g));
  };

  const startEditPlantNote = (note: GardenNote) => {
    setNewNoteText(note.content);
    setEditingNoteInfo({ id: note.id, type: 'plant' });
  };

  const startEditGardenNote = (note: GardenNote) => {
    setNewGardenNoteText(note.content);
    setEditingNoteInfo({ id: note.id, type: 'system' });
  };

  const cancelEdit = () => {
    setEditingNoteInfo(null);
    setNewNoteText('');
    setNewGardenNoteText('');
  };

  const updatePlantStage = (stage: LifecycleStage) => {
    if (!selectedGardenId || !selectedPlantId) return;
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g, plants: g.plants.map(p => p.id === selectedPlantId ? { ...p, stage } : p)
    } : g));
  };

  const saveYield = () => {
    if (!selectedGardenId || !selectedPlantId || !yieldAmount) return;
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g, plants: g.plants.map(p => p.id === selectedPlantId ? { 
        ...p, 
        totalYield: parseFloat(yieldAmount), 
        yieldUnit: yieldUnit 
      } : p)
    } : g));
    setYieldAmount('');
    alert("Yield record saved!");
  };

  const handleCapturePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedGardenId && selectedPlantId && inspectedPlant) {
      const compressed = await compressImage(file);
      const stage = inspectedPlant.stage;
      setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
        ...g, plants: g.plants.map(p => p.id === selectedPlantId ? {
          ...p,
          phasePhotos: { ...p.phasePhotos, [stage]: compressed }
        } : p)
      } : g));
    }
  };

  const deletePlant = (plantId: string) => {
    if (!selectedGardenId || !confirm("Delete specimen?")) return;
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g, plants: g.plants.filter(p => p.id !== plantId)
    } : g));
    setIsPlantDetailOpen(false);
  };

  const handleResetApp = () => {
    if (confirm("This will delete ALL local data. Are you sure?")) {
      setGardens([]);
      setReminders([]);
      localStorage.clear();
      setView('dashboard');
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
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

      <input type="file" ref={cameraInputRef} onChange={handleCapturePhoto} accept="image/*" capture="environment" className="hidden" />

      {/* Sidebar (Desktop) */}
      <nav className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-6 space-y-8 z-50">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0"><Sprout size={24} /></div>
          <span className="text-xl font-black text-emerald-600 tracking-tight">HydroGrow</span>
        </div>
        <div className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'gardens', icon: Leaf, label: 'Gardens' },
            { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id as ViewState); setSelectedGardenId(null); }} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${view === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
              <item.icon size={20} />
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 z-[100] flex justify-around items-center shadow-2xl">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
          { id: 'gardens', icon: Leaf, label: 'Gardens' },
          { id: 'calendar', icon: CalendarIcon, label: 'Tasks' },
          { id: 'settings', icon: Settings, label: 'Config' }
        ].map(item => (
          <button key={item.id} onClick={() => { setView(item.id as ViewState); setSelectedGardenId(null); }} className={`flex flex-col items-center space-y-1 transition-all ${view === item.id ? 'text-emerald-600' : 'text-slate-400'}`}>
            <item.icon size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 pb-24 md:pb-32 relative">
        <header className="flex justify-between items-center mb-6 md:mb-10">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight capitalize">{selectedGarden ? selectedGarden.name : view}</h1>
        </header>

        {view === 'dashboard' && <DashboardView gardens={gardens} reminders={reminders} onToggleReminder={handleToggleReminder} setView={setView} onGardenSelect={handleGardenSelect} onShareApp={() => {
           const json = JSON.stringify(gardens);
           const encoded = btoa(encodeURIComponent(json));
           const shareUrl = `${window.location.origin}${window.location.pathname}?workspace=${encoded}`;
           navigator.clipboard.writeText(shareUrl).then(() => { setCopyFeedback("Link copied!"); setTimeout(() => setCopyFeedback(null), 3000); });
        }} />}

        {view === 'calendar' && <CalendarView reminders={reminders} onAddReminder={handleAddReminder} onToggleReminder={handleToggleReminder} onDeleteReminder={handleDeleteReminder} />}

        {view === 'gardens' && !selectedGarden && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {gardens.map(g => (
              <Card key={g.id} className="relative group cursor-pointer hover:border-emerald-200" onClick={() => handleGardenSelect(g.id)}>
                <div className={`w-10 h-10 mb-3 rounded-xl flex items-center justify-center ${g.type === 'Indoor' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>{g.type === 'Indoor' ? <Home size={18} /> : <Sun size={18} />}</div>
                <h3 className="text-lg font-bold text-slate-800 truncate pr-6">{g.name}</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{g.plants?.length || 0} Plants • {g.type}</p>
                <button onClick={(e) => { e.stopPropagation(); setEditingGarden(g); setIsModalOpen(true); }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-emerald-600"><Settings size={16}/></button>
              </Card>
            ))}
            <button onClick={() => setIsModalOpen(true)} className="border-4 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center p-8 text-slate-300 hover:border-emerald-100 transition-all min-h-[140px]">
              <Plus size={32} className="mb-1" />
              <span className="font-black uppercase tracking-widest text-[10px]">Add Garden</span>
            </button>
          </div>
        )}

        {selectedGarden && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in pb-10">
            <button onClick={() => setSelectedGardenId(null)} className="flex items-center text-slate-400 hover:text-emerald-600 font-bold group text-sm">
              <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" /> Back to List
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-black text-slate-800">Plants</h3>
                    <Button onClick={() => setIsPlantModalOpen(true)} variant="outline" className="text-[10px] py-1.5 px-3 uppercase"><Plus size={14} /><span>Add Plant</span></Button>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                    {selectedGarden.plants.map(p => {
                      const daysLeft = getDaysRemaining(p.projectedHarvestDate);
                      return (
                        <div key={p.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 hover:border-emerald-200 transition-all flex flex-col group relative">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3 overflow-hidden">
                              {p.phasePhotos?.[p.stage] ? (
                                <img src={p.phasePhotos[p.stage]} className="w-10 h-10 rounded-xl object-cover shrink-0" alt={p.name} />
                              ) : (
                                <div className="w-10 h-10 bg-white text-emerald-600 rounded-xl flex items-center justify-center shrink-0 border"><Sprout size={18} /></div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 text-sm truncate">{p.name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{p.variety || 'Unknown Variety'}</p>
                              </div>
                            </div>
                            <button onClick={() => { setSelectedPlantId(p.id); setIsPlantDetailOpen(true); }} className="p-2 bg-emerald-600 text-white rounded-lg shadow-sm"><ExternalLink size={14} /></button>
                          </div>
                          <div className="flex justify-between items-center mt-auto">
                            <div className="px-2 py-0.5 bg-white rounded-md border text-[8px] font-black uppercase text-emerald-600">{p.stage}</div>
                            {daysLeft !== null && daysLeft > 0 && (
                              <div className="flex items-center gap-1 text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                                <Clock size={10} /> {daysLeft} Days to Harvest
                              </div>
                            )}
                            {p.totalYield && (
                              <div className="flex items-center gap-1 text-[8px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                <Trophy size={10} /> {p.totalYield}{p.yieldUnit}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="flex flex-col">
                  <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2"><Activity size={18} className="text-emerald-600" /> System Log</h3>
                  <form onSubmit={addGardenNote} className="mb-4">
                    <textarea 
                      value={newGardenNoteText} 
                      onChange={(e) => setNewGardenNoteText(e.target.value)} 
                      placeholder="Log pH, nutrients, or water swap..." 
                      className="w-full p-3 bg-slate-50 border rounded-xl outline-none text-xs focus:border-emerald-500 min-h-[80px]" 
                    />
                    <div className="flex gap-2 mt-2">
                      <Button type="submit" className="flex-1 text-xs py-2">
                        {editingNoteInfo && editingNoteInfo.type === 'system' ? <Check size={14} /> : <Send size={14} />}
                        <span>{editingNoteInfo && editingNoteInfo.type === 'system' ? 'Update Log' : 'Post Log'}</span>
                      </Button>
                      {editingNoteInfo && editingNoteInfo.type === 'system' && (
                        <button type="button" onClick={cancelEdit} className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200"><Undo2 size={16}/></button>
                      )}
                    </div>
                  </form>
                  <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
                    {selectedGarden.notes.map(n => (
                      <div key={n.id} className="p-3 border border-slate-100 bg-white rounded-xl text-[11px] group relative">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-slate-400 font-black uppercase text-[8px]">{n.date}</p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditGardenNote(n)} className="p-1 text-slate-400 hover:text-emerald-600" title="Edit Log"><Pencil size={10}/></button>
                            <button onClick={() => deleteGardenNote(n.id)} className="p-1 text-slate-400 hover:text-rose-600" title="Delete Log"><Trash2 size={10}/></button>
                          </div>
                        </div>
                        <p className="text-slate-600 leading-tight">"{n.content}"</p>
                      </div>
                    ))}
                    {selectedGarden.notes.length === 0 && <p className="text-center text-slate-300 text-xs py-10 italic">No system notes yet.</p>}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-bottom-6 pb-20">
            <Card className="p-6 border-l-4 border-l-emerald-500 bg-emerald-50/10">
              <div className="flex items-center gap-3 mb-3">
                <ShieldCheck size={20} className="text-emerald-600" />
                <h3 className="text-lg font-black text-slate-800">Local Privacy</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">HydroGrow Pro is "local-first." Everything is saved directly in this browser. No servers, no tracking, just your data on your device.</p>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-3"><Share2 size={20} className="text-blue-500" /><h3 className="text-lg font-black">Share Setup</h3></div>
                <p className="text-xs text-slate-500 mb-6 flex-1">Create a link that lets others import your entire garden workspace.</p>
                <Button onClick={() => {
                  const json = JSON.stringify(gardens);
                  const encoded = btoa(encodeURIComponent(json));
                  const shareUrl = `${window.location.origin}${window.location.pathname}?workspace=${encoded}`;
                  navigator.clipboard.writeText(shareUrl).then(() => { setCopyFeedback("Link copied!"); setTimeout(() => setCopyFeedback(null), 3000); });
                }} variant="outline" className="w-full text-xs"><LinkIcon size={14} /><span>Copy Link</span></Button>
              </Card>

              <Card className="p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-3"><Save size={20} className="text-emerald-600" /><h3 className="text-lg font-black">Manual Backup</h3></div>
                <p className="text-xs text-slate-500 mb-6 flex-1">Save your progress to a file. Useful for switching browsers or devices.</p>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full text-xs justify-between" onClick={() => {
                    const blob = new Blob([JSON.stringify({gardens, reminders})], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = "hydro_data_backup.json";
                    a.click();
                  }}><span>Export File</span><Download size={14}/></Button>
                  <Button variant="outline" className="w-full text-xs justify-between" onClick={() => fileInputRef.current?.click()}><span>Import File</span><FileUp size={14}/></Button>
                </div>
              </Card>

              <Card className="p-6 flex flex-col bg-slate-50/50">
                <div className="flex items-center gap-2 mb-3"><RefreshCcw size={20} className="text-slate-400" /><h3 className="text-lg font-black text-slate-600">Factory Reset</h3></div>
                <p className="text-xs text-slate-500 mb-6 flex-1">Permanently erase all data from this browser.</p>
                <Button variant="danger" className="w-full text-xs" onClick={handleResetApp}><Trash2 size={14} /><span>Wipe Workspace</span></Button>
              </Card>

              <Card className="p-6 bg-amber-50/30 border-2 border-amber-100 flex flex-col items-center text-center">
                 <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mb-3"><Coffee size={24} /></div>
                 <h3 className="text-lg font-black text-slate-800">Support Development</h3>
                 <p className="text-xs text-slate-500 mb-4">Love this tool? Help keep it updated with a small donation.</p>
                 <Button variant="coffee" className="w-full text-xs" onClick={() => window.open('https://paypal.me/hydrogrow', '_blank')}>Support with Coffee</Button>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-black mb-8">{editingGarden ? 'Edit Garden' : 'New Garden'}</h3>
              <form onSubmit={saveGarden} className="space-y-4">
                 <input name="gname" defaultValue={editingGarden?.name} placeholder="Garden Name (e.g. Master Aquaponics)" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
                 <select name="gtype" defaultValue={editingGarden?.type || 'Indoor'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none text-sm"><option value="Indoor">Indoor System</option><option value="Outdoor">Outdoor Garden</option></select>
                 <input name="gdate" type="date" defaultValue={editingGarden?.startedDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none text-sm" />
                 <Button type="submit" className="w-full py-4 mt-4">Confirm Settings</Button>
                 <button type="button" onClick={() => setIsModalOpen(false)} className="w-full text-slate-400 font-bold py-2 text-sm">Cancel</button>
              </form>
           </div>
        </div>
      )}

      {isPlantModalOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-black mb-6">Add Specimen</h3>
              <form onSubmit={savePlant} className="space-y-4">
                 <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase text-slate-400 ml-2">Display Name</p>
                   <input name="pname" placeholder="e.g. Tomato #1" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase text-slate-400 ml-2">Variety / Strain</p>
                   <input name="pvariety" placeholder="e.g. Beefsteak" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase text-slate-400 ml-2">Planted Date</p>
                     <input name="pdate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none text-sm" />
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase text-slate-400 ml-2">Proj. Harvest</p>
                     <input name="pharvest" type="date" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none text-sm" />
                   </div>
                 </div>
                 <Button type="submit" className="w-full py-4 mt-4">Save Specimen</Button>
                 <button type="button" onClick={() => setIsPlantModalOpen(false)} className="w-full text-slate-400 font-bold py-2 text-sm">Cancel</button>
              </form>
           </div>
        </div>
      )}

      {isPlantDetailOpen && inspectedPlant && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] w-full max-w-3xl max-h-[95vh] overflow-y-auto p-6 md:p-10 relative animate-in zoom-in-95 custom-scrollbar">
              <button onClick={() => setIsPlantDetailOpen(false)} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:text-rose-500 transition-colors"><X size={24}/></button>
              
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6 md:mb-8 pr-12">
                <h3 className="text-2xl md:text-4xl font-black text-slate-800 leading-tight">{inspectedPlant.name}</h3>
                <span className="text-emerald-600 font-bold text-lg md:text-xl pb-0.5">{inspectedPlant.variety}</span>
              </div>
              
              <div className="space-y-8">
                <div className="relative group rounded-3xl overflow-hidden border-2 border-slate-100 aspect-video bg-slate-50 flex items-center justify-center">
                  {inspectedPlant.phasePhotos?.[inspectedPlant.stage] ? (
                    <img src={inspectedPlant.phasePhotos[inspectedPlant.stage]} className="w-full h-full object-cover" alt={inspectedPlant.name} />
                  ) : (
                    <div className="flex flex-col items-center text-slate-300">
                      <ImageIcon size={48} className="mb-2 opacity-30" />
                      <p className="text-[10px] font-black uppercase tracking-widest">No photo for {inspectedPlant.stage}</p>
                    </div>
                  )}
                  <button onClick={() => cameraInputRef.current?.click()} className="absolute bottom-4 right-4 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"><Camera size={24} /></button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-3">Lifecycle Stage</p>
                    <div className="flex flex-wrap gap-2">
                      {['Germination', 'Vegetative', 'Flowering', 'Fruiting', 'Harvested'].map(s => (
                        <button key={s} onClick={() => updatePlantStage(s as LifecycleStage)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${inspectedPlant.stage === s ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-slate-400 border hover:border-emerald-200'}`}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 mb-1">Specimen Age</p>
                        <p className="text-3xl font-black text-slate-700">{calculateAge(inspectedPlant.plantedDate)} Days</p>
                      </div>
                      {inspectedPlant.projectedHarvestDate && (
                        <div className="text-right">
                          <p className="text-[8px] md:text-[10px] font-black uppercase text-amber-500 mb-1">Countdown</p>
                          <div className="flex items-center gap-1 text-amber-600 font-black text-xl">
                            <Target size={18} /> {getDaysRemaining(inspectedPlant.projectedHarvestDate)}d
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">Planted: {inspectedPlant.plantedDate}</p>
                  </div>
                </div>

                {inspectedPlant.stage === 'Harvested' && (
                  <div className="p-6 bg-blue-50/50 rounded-3xl border-2 border-blue-100 animate-in slide-in-from-top-2">
                    <h4 className="font-black text-lg flex items-center gap-2 text-blue-800 mb-4"><Trophy size={18}/> Record Final Yield</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="number" 
                        value={yieldAmount} 
                        onChange={(e) => setYieldAmount(e.target.value)} 
                        placeholder="Weight / Count" 
                        className="flex-1 p-4 bg-white border border-blue-200 rounded-2xl outline-none font-bold text-sm" 
                      />
                      <select 
                        value={yieldUnit} 
                        onChange={(e) => setYieldUnit(e.target.value)}
                        className="p-4 bg-white border border-blue-200 rounded-2xl outline-none font-bold text-sm"
                      >
                        <option value="g">Grams</option>
                        <option value="oz">Ounces</option>
                        <option value="lbs">Pounds</option>
                        <option value="pcs">Pieces</option>
                      </select>
                      <Button onClick={saveYield} className="bg-blue-600 hover:bg-blue-700 shadow-blue-100">Save Yield</Button>
                    </div>
                    {inspectedPlant.totalYield && (
                        <p className="mt-4 text-sm font-black text-blue-700 bg-white inline-block px-4 py-2 rounded-xl border border-blue-100">
                          Total Harvest: {inspectedPlant.totalYield} {inspectedPlant.yieldUnit}
                        </p>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="font-black text-lg flex items-center gap-2"><ClipboardList size={18} className="text-emerald-600" /> Care Logs</h4>
                  <form onSubmit={addPlantNote} className="flex gap-2">
                    <input 
                      value={newNoteText} 
                      onChange={(e) => setNewNoteText(e.target.value)} 
                      placeholder="Log pruning, growth spikes, etc..." 
                      className={`flex-1 p-4 border rounded-2xl outline-none text-xs transition-colors ${editingNoteInfo && editingNoteInfo.type === 'plant' ? 'bg-amber-50 border-amber-200 focus:border-amber-400' : 'bg-slate-50 border-slate-100 focus:border-emerald-500'}`}
                    />
                    <div className="flex gap-2">
                      <Button type="submit">
                        {editingNoteInfo && editingNoteInfo.type === 'plant' ? <Check size={16}/> : <Send size={16}/>}
                      </Button>
                      {editingNoteInfo && editingNoteInfo.type === 'plant' && (
                        <button type="button" onClick={cancelEdit} className="p-2 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200" title="Cancel Edit"><Undo2 size={16}/></button>
                      )}
                    </div>
                  </form>
                  <div className="space-y-3">
                    {inspectedPlant.notes.map(n => (
                      <div key={n.id} className="p-4 border border-slate-100 bg-white rounded-2xl text-xs group relative">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[8px] font-black text-emerald-600 uppercase">{n.date}</p>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEditPlantNote(n)} className="p-1 text-slate-400 hover:text-emerald-600" title="Edit entry"><Pencil size={12}/></button>
                            <button onClick={() => deletePlantNote(n.id)} className="p-1 text-slate-400 hover:text-rose-600" title="Delete entry"><Trash2 size={12}/></button>
                          </div>
                        </div>
                        <p className="text-slate-600 leading-relaxed italic">"{n.content}"</p>
                      </div>
                    ))}
                    {inspectedPlant.notes.length === 0 && <p className="text-center py-6 text-slate-300 italic text-xs">No plant notes logged.</p>}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                   <button onClick={() => deletePlant(inspectedPlant.id)} className="text-rose-400 hover:text-rose-600 font-black text-[10px] uppercase flex items-center gap-2"><Trash2 size={14}/> Delete specimen</button>
                   <Button onClick={() => setIsPlantDetailOpen(false)} className="w-full sm:w-auto px-10">Close Record</Button>
                </div>
              </div>
           </div>
        </div>
      )}

      {isImportModalOpen && pendingImportData && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6"><LinkIcon size={32} /></div>
              <h3 className="text-2xl font-black mb-4">Import Shared Data?</h3>
              <p className="text-xs text-slate-500 mb-8 leading-relaxed">Found {pendingImportData.length} systems in the link. Merge with your current workspace or replace it entirely?</p>
              <div className="space-y-3">
                 <Button onClick={() => { setGardens(prev => [...prev, ...pendingImportData]); setIsImportModalOpen(false); }} className="w-full py-4 text-sm">Merge Workspace</Button>
                 <Button onClick={() => { setGardens(pendingImportData); setIsImportModalOpen(false); }} variant="secondary" className="w-full py-4 text-sm">Replace Current</Button>
                 <button onClick={() => setIsImportModalOpen(false)} className="text-slate-300 font-bold py-2 text-xs">Discard</button>
              </div>
           </div>
        </div>
      )}

      {copyFeedback && (
        <div className="fixed top-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 z-[300]">
          <Check size={18} />
          <span className="font-bold text-sm">{copyFeedback}</span>
        </div>
      )}
    </div>
  );
}
