import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
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
  ExternalLink,
  Download,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Loader2,
  MessageSquare,
  Send,
  Camera,
  Activity,
  FileText,
  Printer,
  FileSpreadsheet,
  HelpCircle,
  Heart,
  Info,
  ShieldCheck,
  Repeat,
  Upload,
  Smartphone,
  Laptop,
  BarChart3,
  History,
  ClipboardList,
  Share2,
  Link as LinkIcon,
  Copy,
  Check,
  Globe
} from 'lucide-react';
import { ViewState, Garden, Notification, GardenType, Plant, LifecycleStage, GrowthProjection, GardenNote } from './types.ts';
import { predictGrowthTimeline } from './services/geminiService.ts';
import { GoogleGenAI } from "@google/genai";

// --- Shared UI Components ---

const Card = ({ children, className = "", onClick }: any) => (
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

// --- Helper Functions ---
const calculateAge = (date: string) => {
  const start = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 0 : diff;
};

// --- Dashboard View ---

const DashboardView = ({ gardens, notifications, setView, onGardenSelect, onExportPDF, onExportExcel, onShareWorkspace, onShareApp }: any) => {
  const allPlants = gardens.flatMap((g: Garden) => g.plants);
  const totalPlants = allPlants.length;
  
  // Summary Metrics
  const avgAge = totalPlants > 0 
    ? Math.round(allPlants.reduce((acc: number, p: Plant) => acc + calculateAge(p.plantedDate), 0) / totalPlants) 
    : 0;
  
  const stageCounts = allPlants.reduce((acc: any, p: Plant) => {
    acc[p.stage] = (acc[p.stage] || 0) + 1;
    return acc;
  }, {});

  const floweringCount = stageCounts['Flowering'] || 0;
  const germinationCount = stageCounts['Germination'] || 0;

  const latestNotes = gardens
    .flatMap((g: Garden) => g.plants.flatMap((p: Plant) => p.notes.map(n => ({ ...n, plantName: p.name }))))
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-emerald-600 p-10 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
        <Leaf className="absolute -bottom-6 -right-6 w-32 h-32 text-emerald-500/20 rotate-12" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black bg-emerald-500 text-white">
                G
             </div>
             <span className="font-bold text-emerald-100 uppercase tracking-widest text-[10px]">Grower Mode Active</span>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-black mb-2 tracking-tight">Growth Dashboard</h2>
              <p className="text-emerald-50/90 font-medium italic text-lg opacity-80">"Track your growing Journey effortlessly."</p>
            </div>
            <button 
              onClick={onShareApp}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all border border-white/10 flex items-center gap-2 text-xs font-black uppercase tracking-widest"
              title="Share App"
            >
              <Globe size={16} /> Share Tool
            </button>
          </div>
          
          <div className="flex gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl">
              <p className="text-[10px] font-black uppercase text-emerald-200">Gardens</p>
              <p className="text-2xl font-black">{gardens.length}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl">
              <p className="text-[10px] font-black uppercase text-emerald-200">Total Specimens</p>
              <p className="text-2xl font-black">{totalPlants}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Operations Summary Card --- */}
      <Card className="border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/20">
        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="text-emerald-600" size={24} />
              <h3 className="text-xl font-black text-slate-800">Operations Summary</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Status</p>
                <p className="text-lg font-black text-emerald-600">{totalPlants > 0 ? 'Active' : 'Standby'}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Flowering</p>
                <p className="text-lg font-black text-blue-600">{floweringCount}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">New Seeds</p>
                <p className="text-lg font-black text-amber-500">{germinationCount}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Avg Age</p>
                <p className="text-lg font-black text-slate-700">{avgAge}d</p>
              </div>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl italic">
              Currently monitoring <span className="font-bold text-slate-800">{gardens.length} gardens</span> with <span className="font-bold text-slate-800">{totalPlants} specimen(s)</span>. 
              {floweringCount > 0 ? ` You have ${floweringCount} specimen(s) in the flowering stage—ensure nutrient concentrations are adjusted.` : ' All systems are within normal parameters.'}
            </p>
          </div>
          <div className="lg:w-72 space-y-3">
            <Button onClick={onExportPDF} className="w-full py-4 shadow-xl">
              <Printer size={18} /><span>Generate PDF Report</span>
            </Button>
            <Button onClick={onShareWorkspace} variant="outline" className="w-full py-4 bg-white border-emerald-100 text-emerald-600">
              <Share2 size={18} /><span>Share Workspace</span>
            </Button>
            <p className="text-[10px] text-center text-slate-400 uppercase font-black tracking-widest">Workspace includes all data</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
          <Card className="bg-slate-900 text-white">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={20} className="text-emerald-400" />
              <h3 className="text-lg font-black uppercase tracking-tight">Growth Analytics</h3>
            </div>
            <div className="space-y-4">
              <div className="pt-2">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-4">Phase Distribution</p>
                <div className="space-y-2">
                  {Object.entries(stageCounts).map(([stage, count]: any) => (
                    <div key={stage} className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${(count / totalPlants) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 w-16 truncate">{stage}</span>
                      <span className="text-[10px] font-black text-white">{count}</span>
                    </div>
                  ))}
                  {allPlants.length === 0 && <p className="text-xs text-slate-500 italic">No data to display.</p>}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <History size={18} className="text-emerald-600" /> Recent Activity
              </h3>
            </div>
            <div className="space-y-4">
              {latestNotes.map((note: any) => (
                <div key={note.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black text-emerald-600 uppercase truncate max-w-[120px]">{note.plantName}</span>
                    <span className="text-[9px] text-slate-400">{note.date.split(',')[0]}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed italic">"{note.content}"</p>
                </div>
              ))}
              {latestNotes.length === 0 && <p className="text-slate-400 text-center py-6 text-sm">No recent logs recorded.</p>}
            </div>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800">Your Gardens</h3>
              <button onClick={() => setView('gardens')} className="text-emerald-600 text-xs font-black uppercase hover:underline">Manage All</button>
            </div>
            <div className="space-y-4">
              {gardens.slice(0, 4).map((g: Garden) => (
                <button key={g.id} onClick={() => onGardenSelect(g.id)} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all text-left outline-none group">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${g.type === 'Indoor' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                      {g.type === 'Indoor' ? <Home size={18} /> : <Sun size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{g.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase">{g.plants?.length || 0} Specimens</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </button>
              ))}
              {gardens.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm mb-4">No gardens established yet.</p>
                  <Button variant="outline" onClick={() => setView('gardens')}>Establish Garden</Button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800">Environmental Alerts</h3>
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
              {notifications.length === 0 && <p className="text-slate-400 text-center py-6">All systems optimal.</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  
  const [gardens, setGardens] = useState<Garden[]>(() => {
    try {
      const saved = localStorage.getItem('hydro_gardens_single_user');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.warn(e); }
    return [];
  });

  const [notifications] = useState<Notification[]>([
    { id: '1', title: 'pH Check', message: 'Time to calibrate your reservoir pH levels.', date: new Date().toISOString(), read: false, type: 'maintenance' }
  ]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlantModalOpen, setIsPlantModalOpen] = useState(false);
  const [isPlantDetailOpen, setIsPlantDetailOpen] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<Garden[] | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  
  const [selectedGardenId, setSelectedGardenId] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [editingGarden, setEditingGarden] = useState<Garden | null>(null);
  const [plantDetailTab, setPlantDetailTab] = useState<'overview' | 'notes'>('overview');
  const [newNoteText, setNewNoteText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedGarden = gardens.find(g => g.id === selectedGardenId);
  const inspectedPlant = selectedGarden?.plants.find(p => p.id === selectedPlantId);

  // Persistence & URL Import Handling
  useEffect(() => {
    localStorage.setItem('hydro_gardens_single_user', JSON.stringify(gardens));
  }, [gardens]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedData = urlParams.get('workspace');
    if (sharedData) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(sharedData)));
        if (Array.isArray(decoded)) {
          setPendingImportData(decoded);
          setIsImportModalOpen(true);
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error("Failed to decode shared workspace:", err);
      }
    }
  }, []);

  const handleGardenSelect = (id: string) => {
    setSelectedGardenId(id);
    setView('gardens');
  };

  const handleShareWorkspace = () => {
    try {
      const json = JSON.stringify(gardens);
      const encoded = btoa(encodeURIComponent(json));
      const shareUrl = `${window.location.origin}${window.location.pathname}?workspace=${encoded}`;
      
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopyFeedback("Workspace link copied to clipboard!");
        setTimeout(() => setCopyFeedback(null), 3000);
      });
    } catch (err) {
      alert("Failed to generate share link. Your workspace might be too large for a URL.");
    }
  };

  const handleShareApp = () => {
    const appUrl = `${window.location.origin}${window.location.pathname}`;
    navigator.clipboard.writeText(appUrl).then(() => {
      setCopyFeedback("App link copied to clipboard!");
      setTimeout(() => setCopyFeedback(null), 3000);
    });
  };

  const handleImportWorkspace = (merge: boolean) => {
    if (!pendingImportData) return;
    if (merge) {
      setGardens(prev => [...prev, ...pendingImportData]);
    } else {
      setGardens(pendingImportData);
    }
    setIsImportModalOpen(false);
    setPendingImportData(null);
    alert("Workspace successfully imported!");
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const summaryHtml = `
      <html>
      <head>
        <title>HydroGrow Garden Summary</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
          .header { border-bottom: 4px solid #10b981; padding-bottom: 20px; margin-bottom: 40px; }
          .header h1 { margin: 0; color: #059669; font-size: 32px; font-weight: 900; }
          .header p { margin: 5px 0 0; color: #64748b; text-transform: uppercase; font-size: 10px; font-weight: 800; letter-spacing: 1px; }
          .garden-block { margin-bottom: 50px; page-break-inside: avoid; }
          .garden-header { background: #f8fafc; padding: 20px; border-radius: 15px; margin-bottom: 20px; border-left: 5px solid #10b981; }
          .garden-header h2 { margin: 0; font-size: 24px; font-weight: 800; }
          .garden-meta { font-size: 12px; color: #64748b; margin-top: 5px; font-weight: 600; }
          .plant-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .plant-table th { text-align: left; font-size: 10px; text-transform: uppercase; color: #94a3b8; padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .plant-table td { padding: 15px 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top; }
          .tag { display: inline-block; padding: 2px 8px; border-radius: 5px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
          .tag-phase { background: #ecfdf5; color: #059669; }
          .note-list { margin: 0; padding: 0; list-style: none; font-size: 12px; color: #64748b; }
          .note-item { margin-bottom: 4px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 2px; }
          .note-date { font-weight: 800; font-size: 9px; color: #94a3b8; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>HydroGrow Pro Report</h1>
          <p>Full Garden Status & History • Generated ${new Date().toLocaleDateString()}</p>
        </div>
        ${gardens.map(g => `
          <div class="garden-block">
            <div class="garden-header">
              <h2>${g.name}</h2>
              <div class="garden-meta">${g.type} Environment • Established ${g.startedDate}</div>
            </div>
            <table class="plant-table">
              <thead>
                <tr>
                  <th width="15%">Specimen</th>
                  <th width="10%">Age</th>
                  <th width="15%">Phase</th>
                  <th width="60%">Log History</th>
                </tr>
              </thead>
              <tbody>
                ${g.plants.map(p => `
                  <tr>
                    <td style="font-weight: 700;">${p.name}<br/><span style="font-weight: 400; font-size: 10px; color: #64748b;">${p.variety || 'Heirloom'}</span></td>
                    <td>${calculateAge(p.plantedDate)} Days</td>
                    <td><span class="tag tag-phase">${p.stage}</span></td>
                    <td>
                      <div class="note-list">
                        ${p.notes && p.notes.length > 0 ? p.notes.slice(0, 5).map(n => `
                          <div class="note-item">
                            <span class="note-date">${n.date}</span><br/>
                            ${n.content}
                          </div>
                        `).join('') : '<span style="color: #cbd5e1; italic">No history recorded.</span>'}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
        <script>window.print();</script>
      </body>
      </html>
    `;

    printWindow.document.write(summaryHtml);
    printWindow.document.close();
  };

  const handleExportExcel = () => {
    const headers = ["Garden Name", "Type", "Plant Name", "Variety", "Planted Date", "Stage", "Age (Days)", "History Logs"];
    const rows: string[][] = [];
    
    gardens.forEach(g => {
      g.plants.forEach(p => {
        const age = calculateAge(p.plantedDate);
        const historyText = p.notes && p.notes.length > 0 
          ? p.notes.map(n => `[${n.date}] ${n.content}`).join(' | ').replace(/"/g, '""') 
          : "No logs recorded";
        
        rows.push([
          g.name,
          g.type,
          p.name,
          p.variety || 'Heirloom',
          p.plantedDate,
          p.stage,
          age.toString(),
          `"${historyText}"`
        ]);
      });
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hydrogrow_complete_history_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json) && confirm("This will replace all current garden data. Continue?")) {
          setGardens(json);
          alert("Database successfully restored!");
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Failed to parse the backup file.");
      }
    };
    reader.readAsText(file);
  };

  const saveGarden = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const nameInput = f.elements.namedItem('gname') as HTMLInputElement;
    const typeSelect = f.elements.namedItem('gtype') as HTMLSelectElement;
    const dateInput = f.elements.namedItem('gdate') as HTMLInputElement;

    const name = nameInput.value;
    const type = typeSelect.value as GardenType;
    const startedDate = dateInput.value;

    if (editingGarden) {
      setGardens(prev => prev.map(g => g.id === editingGarden.id ? { ...g, name, type, startedDate } : g));
    } else {
      const newGarden: Garden = {
        id: Date.now().toString(),
        name,
        type,
        startedDate,
        description: "",
        plants: [],
        notes: []
      };
      setGardens(prev => [...prev, newGarden]);
    }
    setIsModalOpen(false);
    setEditingGarden(null);
  };

  const savePlant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedGardenId) return;
    
    const f = e.currentTarget;
    const name = (f.elements.namedItem('pname') as HTMLInputElement).value;
    const variety = (f.elements.namedItem('pvariety') as HTMLInputElement).value;
    const plantedDate = (f.elements.namedItem('pdate') as HTMLInputElement).value;

    setIsAiLoading(true);
    const projection = await predictGrowthTimeline(name, variety, plantedDate);
    
    const newPlant: Plant = { 
      id: Date.now().toString(), 
      name, 
      variety, 
      plantedDate, 
      stage: 'Germination', 
      harvests: [],
      projection: projection || undefined,
      notes: []
    };

    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g, plants: [...(g.plants || []), newPlant]
    } : g));
    
    setIsAiLoading(false);
    setIsPlantModalOpen(false);
  };

  const addPlantNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGardenId || !selectedPlantId || !newNoteText.trim()) return;
    submitNote(newNoteText.trim());
    setNewNoteText('');
  };

  const submitNote = (content: string) => {
    if (!selectedGardenId || !selectedPlantId) return;
    const newNote: GardenNote = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      content: content
    };

    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g,
      plants: g.plants.map(p => p.id === selectedPlantId ? {
        ...p,
        notes: [newNote, ...(p.notes || [])]
      } : p)
    } : g));
  };

  const deletePlantNote = (noteId: string) => {
    if (!selectedGardenId || !selectedPlantId) return;
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g,
      plants: g.plants.map(p => p.id === selectedPlantId ? {
        ...p,
        notes: (p.notes || []).filter(n => n.id !== noteId)
      } : p)
    } : g));
  };

  const handleAiScan = async () => {
    if (!selectedGardenId || !selectedPlantId) return;
    setIsScanning(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        await new Promise(r => setTimeout(r, 1000));
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (canvas && video) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext('2d')?.drawImage(video, 0, 0);
          const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
          stream.getTracks().forEach(track => track.stop());

          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
              parts: [
                { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
                { text: `Analyze the health of this "${inspectedPlant?.name}" plant. Identify any nutrient deficiencies, pests, or growth issues. Keep the response concise and grower-focused.` }
              ]
            }
          });

          const result = response.text || "Scan complete. No obvious issues detected.";
          submitNote(`🤖 AI Health Scan: ${result}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Camera access failed or AI analysis was interrupted.");
    } finally {
      setIsScanning(false);
    }
  };

  const updateStage = (stage: LifecycleStage) => {
    if (!selectedGardenId || !selectedPlantId) return;
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g,
      plants: (g.plants || []).map(p => p.id === selectedPlantId ? { ...p, stage } : p)
    } : g));
  };

  const deletePlant = (plantId: string) => {
    if (!selectedGardenId || !confirm("Permanently remove this specimen?")) return;
    setGardens(prev => prev.map(g => g.id === selectedGardenId ? {
      ...g,
      plants: (g.plants || []).filter(p => p.id !== plantId)
    } : g));
    setIsPlantDetailOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportData} 
        accept=".json" 
        className="hidden" 
      />

      {/* --- Sidebar --- */}
      <nav className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col p-4 md:p-6 space-y-8 z-50">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
            <Sprout size={24} />
          </div>
          <span className="text-xl font-black text-emerald-600 hidden md:block tracking-tight">HydroGrow</span>
        </div>
        
        <div className="flex-1 space-y-2">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'gardens', icon: Leaf, label: 'Gardens' },
            { id: 'settings', icon: Settings, label: 'System' }
          ].map(item => (
            <button key={item.id} onClick={() => { setView(item.id as ViewState); setSelectedGardenId(null); }} className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all ${view === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>
              <item.icon size={20} />
              <span className="font-bold hidden md:block">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 pb-32 relative">
        {/* Copy Feedback Toast */}
        {copyFeedback && (
          <div className="fixed top-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 z-[300]">
            <Check size={18} />
            <span className="font-bold">{copyFeedback}</span>
          </div>
        )}

        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight capitalize">{selectedGarden ? selectedGarden.name : view}</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
              Indoor Hydroponic Assistant
            </p>
          </div>
          {view === 'gardens' && !selectedGarden && (
            <Button onClick={() => { setEditingGarden(null); setIsModalOpen(true); }}><Plus size={20} /><span>New Garden</span></Button>
          )}
        </header>

        {view === 'dashboard' && <DashboardView gardens={gardens} notifications={notifications} setView={setView} onGardenSelect={handleGardenSelect} onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} onShareWorkspace={handleShareWorkspace} onShareApp={handleShareApp} />}

        {view === 'gardens' && !selectedGarden && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
            {gardens.map(g => (
              <Card key={g.id} className="relative group cursor-pointer hover:border-emerald-200 transition-all" onClick={() => handleGardenSelect(g.id)}>
                <div className={`w-12 h-12 mb-4 rounded-2xl flex items-center justify-center ${g.type === 'Indoor' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                  {g.type === 'Indoor' ? <Home size={24} /> : <Sun size={24} />}
                </div>
                <h3 className="text-xl font-bold text-slate-800">{g.name}</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{g.plants?.length || 0} Specimens • {g.type}</p>
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
                  <div className="grid grid-cols-1 gap-6">
                    {(selectedGarden.plants || []).map(p => (
                      <div key={p.id} className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-6 flex flex-col hover:border-emerald-200 transition-all group overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-5">
                            <div className="w-14 h-14 bg-white text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                              <Sprout size={28} />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-800 text-lg leading-tight">{p.name}</h4>
                              <p className="text-xs text-slate-400 font-bold uppercase">{p.variety || 'Heirloom'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => { setSelectedPlantId(p.id); setPlantDetailTab('notes'); setIsPlantDetailOpen(true); }}
                              className="p-2.5 bg-white text-slate-400 hover:text-emerald-600 rounded-xl shadow-sm border border-slate-100 transition-all"
                              title="Quick Note"
                            >
                              <MessageSquare size={18} />
                            </button>
                            <button 
                              onClick={() => { setSelectedPlantId(p.id); setPlantDetailTab('overview'); setIsPlantDetailOpen(true); }}
                              className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-105 transition-transform" 
                              title="Manage Specimen"
                            >
                              <ExternalLink size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                           <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100">
                             <span className="block text-[8px] text-slate-400 uppercase font-black">Age</span>
                             <span className="text-xs font-black text-slate-700">{calculateAge(p.plantedDate)} Days</span>
                           </div>
                           <div className="bg-white px-4 py-2 rounded-2xl border border-slate-100">
                             <span className="block text-[8px] text-slate-400 uppercase font-black">Phase</span>
                             <span className="text-xs font-black text-emerald-600">{p.stage}</span>
                           </div>
                        </div>

                        {p.notes && p.notes.length > 0 ? (
                          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50 italic text-slate-600 text-[11px] line-clamp-2">
                             <span className="font-black uppercase text-[8px] text-emerald-700 block mb-1">Latest Log ({p.notes[0].date})</span>
                             "{p.notes[0].content}"
                          </div>
                        ) : (
                          <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-slate-300 text-[10px] text-center uppercase font-black">
                            No logs yet
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="bg-slate-900 text-white h-fit">
                  <h4 className="font-black mb-6 flex items-center gap-2 border-b border-white/10 pb-4"><Calendar size={18}/> Garden Profile</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Established On</p>
                      <p className="font-bold text-emerald-400">{selectedGarden.startedDate}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl">
                      <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Type</p>
                      <p className="font-bold">{selectedGarden.type}</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-4xl mx-auto py-10 space-y-8 animate-in slide-in-from-bottom-6">
            
            {/* Privacy and Data Safety Panel */}
            <Card className="p-8 border-l-8 border-l-emerald-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">Your Data is Private</h3>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Local-First Architecture</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-slate-600 leading-relaxed">
                <div>
                  <p className="font-bold text-slate-800 mb-2">Zero Cloud Storage</p>
                  <p>All garden logs, specimen details, and environmental settings are stored directly in your browser's <span className="font-mono bg-slate-100 px-1 rounded">localStorage</span>. We never send your personal garden data to our servers.</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 mb-2">AI Processing Safety</p>
                  <p>When you use the AI Health Scan, only the specific image and question are processed via the Gemini API to provide diagnostics. This session is transient and not stored permanently.</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sharable Link Section */}
              <Card className="p-8 bg-emerald-50/30 border border-emerald-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-emerald-600 text-white rounded-2xl">
                    <Share2 size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">Sharing & Export</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400 mb-2">Workspace (Data Sync)</p>
                    <Button onClick={handleShareWorkspace} className="w-full py-4 bg-emerald-600 text-white">
                      <Copy size={18}/><span>Copy Workspace Link</span>
                    </Button>
                    <p className="text-[9px] text-slate-500 mt-1 italic">Includes all gardens, plants, and history in the URL.</p>
                  </div>
                  <div className="pt-2 border-t border-emerald-100">
                    <p className="text-xs font-black uppercase text-slate-400 mb-2">Application Link</p>
                    <Button onClick={handleShareApp} variant="outline" className="w-full py-4 bg-white border-emerald-200 text-emerald-700">
                      <Globe size={18}/><span>Copy App Link</span>
                    </Button>
                    <p className="text-[9px] text-slate-500 mt-1 italic">Share a clean link to this tool without your data.</p>
                  </div>
                </div>
              </Card>

              {/* Migration Guide Card */}
              <Card className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                    <Repeat size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-800">Data Migration</h3>
                </div>
                <p className="text-sm text-slate-500 mb-6 italic">Moving to a new device? Follow these steps:</p>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <Laptop size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Step 1: Export Database</p>
                      <p className="text-xs text-slate-500">Save a <span className="font-bold">.json</span> file from the panel below.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <Upload size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Step 2: Restore Elsewhere</p>
                      <p className="text-xs text-slate-500">Open this tool elsewhere and import that file.</p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-8">
                {/* Export/Import Controls */}
                <Card className="p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mb-6"><Activity size={32} /></div>
                  <h3 className="text-xl font-black mb-6">Manage Records</h3>
                  <div className="space-y-3 w-full">
                    <Button variant="secondary" className="w-full" onClick={() => {
                       const data = JSON.stringify(gardens, null, 2);
                       const blob = new Blob([data], { type: 'application/json' });
                       const url = URL.createObjectURL(blob);
                       const a = document.createElement('a');
                       a.href = url;
                       a.download = `hydrogrow-backup-${new Date().toISOString().split('T')[0]}.json`;
                       a.click();
                    }}><Download size={18}/><span>Backup Database (.json)</span></Button>
                    
                    <Button variant="outline" className="w-full border-slate-200 text-slate-600 bg-white" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={18}/><span>Restore Database</span>
                    </Button>
                  </div>
                </Card>

                {/* Donation Card */}
                <Card className="p-8 bg-slate-900 text-white relative overflow-hidden">
                   <Heart className="absolute -bottom-4 -right-4 w-24 h-24 text-rose-500/10 -rotate-12" />
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-rose-500 text-white rounded-xl">
                          <Heart size={20} fill="currentColor" />
                        </div>
                        <h3 className="text-xl font-black">Support the Project</h3>
                      </div>
                      <p className="text-slate-400 text-xs mb-6 leading-relaxed">Your support helps us keep building features for the community!</p>
                      <a 
                        href="#" 
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all border border-slate-700"
                        onClick={(e) => {
                          e.preventDefault();
                          alert("Send your donation to gizmooo@yahoo.com via PayPal. Thank you for your support!");
                          window.open(`https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=gizmooo@yahoo.com&currency_code=USD`, '_blank');
                        }}
                      >
                        <Heart size={18} className="text-rose-500" />
                        <span>Donate via PayPal</span>
                      </a>
                   </div>
                </Card>
              </div>
            </div>

            {/* Danger Zone */}
            <Card className="p-10 border-rose-100 bg-rose-50/20 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><Trash2 size={32} /></div>
              <h3 className="text-2xl font-black mb-4 text-rose-900">Danger Zone</h3>
              <p className="text-rose-700/60 text-sm mb-6 max-w-sm mx-auto">This action cannot be undone. All gardens and specimen history will be permanently erased from this browser.</p>
              <Button variant="danger" className="px-10" onClick={() => { if(confirm("Permanently wipe local user data?")) { localStorage.clear(); window.location.reload(); } }}>Wipe App Storage</Button>
            </Card>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* Import Confirmation Modal */}
      {isImportModalOpen && pendingImportData && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner">
                 <LinkIcon size={40} />
              </div>
              <h3 className="text-3xl font-black text-center text-slate-800 mb-4 tracking-tight">Shared Workspace Detected</h3>
              <p className="text-slate-500 text-center font-medium mb-10">
                You've opened a link containing <span className="text-emerald-600 font-bold">{pendingImportData.length} shared gardens</span>. How would you like to proceed?
              </p>
              <div className="space-y-4">
                 <Button onClick={() => handleImportWorkspace(true)} className="w-full py-5 text-lg">Merge with Current Gardens</Button>
                 <Button onClick={() => handleImportWorkspace(false)} variant="secondary" className="w-full py-4 text-slate-600">Replace Current Gardens</Button>
                 <button onClick={() => setIsImportModalOpen(false)} className="w-full py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase text-xs tracking-widest">Discard Shared Data</button>
              </div>
           </div>
        </div>
      )}

      {isPlantDetailOpen && inspectedPlant && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95">
              <div className="p-10 pb-0 flex justify-between items-start bg-slate-50/50">
                 <div className="flex items-center space-x-6 pb-6">
                    <div className="w-16 h-16 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center shadow-lg">
                       <Sprout size={32} />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none mb-1">{inspectedPlant.name}</h3>
                       <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-500 font-bold uppercase tracking-widest">{inspectedPlant.variety || 'Heirloom'}</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={() => setIsPlantDetailOpen(false)} className="p-3 bg-white text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm outline-none transition-all"><X size={24}/></button>
              </div>

              <div className="flex px-10 border-b border-slate-100 bg-slate-50/50">
                 <button 
                  onClick={() => setPlantDetailTab('overview')}
                  className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${plantDetailTab === 'overview' ? 'text-emerald-600' : 'text-slate-400'}`}
                 >
                    Overview
                    {plantDetailTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 rounded-t-full" />}
                 </button>
                 <button 
                  onClick={() => setPlantDetailTab('notes')}
                  className={`px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${plantDetailTab === 'notes' ? 'text-emerald-600' : 'text-slate-400'}`}
                 >
                    Care Logs
                    {plantDetailTab === 'notes' && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 rounded-t-full" />}
                 </button>
              </div>

              <div className="px-10 overflow-y-auto flex-1 space-y-8 pb-10 pt-8">
                 {plantDetailTab === 'overview' ? (
                   <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center">
                          <Calendar size={20} className="text-slate-300 mx-auto mb-2" />
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Planted</p>
                          <p className="font-black text-slate-700">{inspectedPlant.plantedDate}</p>
                        </div>
                        <div className="p-6 bg-blue-50 rounded-[2.5rem] border border-blue-100 text-center">
                          <Clock size={20} className="text-blue-300 mx-auto mb-2" />
                          <p className="text-[10px] font-black uppercase text-blue-600 mb-1 tracking-widest">Age</p>
                          <p className="font-black text-blue-700">{calculateAge(inspectedPlant.plantedDate)} Days</p>
                        </div>
                      </div>

                      {inspectedPlant.projection && (
                        <div className="bg-emerald-50/30 rounded-[2.5rem] p-8 border border-emerald-100">
                            <div className="flex items-center gap-2 mb-6">
                              <Sparkles size={18} className="text-emerald-600" />
                              <h4 className="text-sm font-black uppercase text-emerald-600 tracking-widest">AI Projected Timeline</h4>
                            </div>
                            <div className="relative">
                              <div className="absolute top-1/2 left-0 w-full h-1 bg-emerald-100 -translate-y-1/2 rounded-full"></div>
                              <div className="relative flex justify-between">
                                  {['Germination', 'Vegetative', 'Flowering', 'Harvest'].map((milestone, idx) => (
                                      <div key={idx} className="flex flex-col items-center z-10">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 bg-white border-2 border-emerald-100 text-emerald-200`}>
                                            <div className="w-2 h-2 rounded-full bg-current" />
                                          </div>
                                          <p className="text-[10px] font-black uppercase text-slate-400 text-center leading-tight">{milestone}</p>
                                      </div>
                                  ))}
                              </div>
                            </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Update Lifecycle Phase</label>
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
                   </>
                 ) : (
                   <div className="space-y-8 animate-in slide-in-from-right-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                         <div className="sm:col-span-3">
                            <form onSubmit={addPlantNote} className="relative">
                              <textarea 
                                value={newNoteText}
                                onChange={(e) => setNewNoteText(e.target.value)}
                                placeholder="Log specimen progress, feeding changes..."
                                className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2.5rem] outline-none focus:border-emerald-500 font-medium text-slate-700 resize-none min-h-[140px] pr-16"
                              />
                              <button 
                                type="submit"
                                disabled={!newNoteText.trim()}
                                className="absolute bottom-4 right-4 w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all disabled:opacity-30"
                              >
                                <Send size={20} />
                              </button>
                            </form>
                         </div>
                         <div className="sm:col-span-1">
                            <button 
                              onClick={handleAiScan}
                              disabled={isScanning}
                              className={`w-full h-full flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 border-dashed transition-all ${isScanning ? 'border-emerald-500 bg-emerald-50 animate-pulse-subtle' : 'border-slate-200 hover:border-emerald-400'}`}
                            >
                               {isScanning ? (
                                 <Loader2 className="animate-spin text-emerald-600 mb-2" size={32} />
                               ) : (
                                 <Camera className="text-slate-400 mb-2" size={32} />
                               )}
                               <span className="text-[10px] font-black uppercase text-center">AI Scan</span>
                            </button>
                         </div>
                      </div>

                      <div className="space-y-4">
                        {(inspectedPlant.notes || []).map(note => (
                          <div key={note.id} className="group relative bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-emerald-100 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">{note.date}</span>
                              <button onClick={() => deletePlantNote(note.id)} className="text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                            </div>
                            <p className="text-slate-700 font-medium leading-relaxed">{note.content}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
              </div>
              
              <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                 <button onClick={() => deletePlant(inspectedPlant.id)} className="text-rose-400 hover:text-rose-600 font-black text-[10px] uppercase flex items-center gap-2 outline-none">
                    <Trash2 size={16} /> Delete Specimen
                 </button>
                 <Button onClick={() => setIsPlantDetailOpen(false)} className="px-10">Close Detail</Button>
              </div>
           </div>
        </div>
      )}

      {/* --- FORMS --- */}

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
                    <input name="gname" defaultValue={editingGarden?.name} placeholder="E.g. Basil Tower" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Environment</label>
                       <select name="gtype" defaultValue={editingGarden?.type || 'Indoor'} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none">
                          <option value="Indoor">Indoor</option>
                          <option value="Outdoor">Outdoor</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Date Established</label>
                       <input name="gdate" type="date" defaultValue={editingGarden?.startedDate || new Date().toISOString().split('T')[0]} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none" />
                    </div>
                 </div>
                 <Button type="submit" className="w-full py-5 text-xl shadow-lg">Confirm Garden</Button>
              </form>
           </div>
        </div>
      )}

      {isPlantModalOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in-95">
              <div className="flex items-center gap-3 mb-4">
                 <Sprout className="text-emerald-600" />
                 <h3 className="text-3xl font-black text-slate-800">Add Specimen</h3>
              </div>
              <p className="text-slate-500 text-sm mb-10 font-medium">Gemini AI will automatically predict growth stages for you.</p>
              
              <form onSubmit={savePlant} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Common Name</label>
                    <input name="pname" placeholder="E.g. Basil" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Strain/Variety</label>
                    <input name="pvariety" placeholder="E.g. Genovese" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-1.5 block">Planted On</label>
                    <input name="pdate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none" />
                 </div>
                 
                 <Button type="submit" className="w-full py-5 text-xl shadow-lg" disabled={isAiLoading}>
                    {isAiLoading ? (
                       <>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Generating AI Timeline...</span>
                       </>
                    ) : (
                       <>
                          <Sparkles size={20} />
                          <span>Save & Predict Growth</span>
                       </>
                    )}
                 </Button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
