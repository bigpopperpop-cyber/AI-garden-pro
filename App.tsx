
import React, { useState, useEffect } from 'react';
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
  Bell,
  Search,
  FlaskConical,
  Droplets,
  Thermometer,
  Trash2,
  Edit2,
  Clock,
  FileText,
  Info
} from 'lucide-react';
import { 
  ViewState, Setup, Plant, Equipment, Ingredient, Task, SystemType 
} from './types';
import { troubleshootPlant, getDailyTip } from './services/geminiService';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
        : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const Card = ({ children, title, action }: { children?: React.ReactNode, title?: string, action?: React.ReactNode }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
    {(title || action) && (
      <div className="flex justify-between items-center mb-6">
        {title && <h3 className="text-lg font-semibold text-slate-800">{title}</h3>}
        {action}
      </div>
    )}
    <div className="flex-1">{children}</div>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
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

// --- Main App ---

export default function App() {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dailyTip, setDailyTip] = useState<string>("Gathering gardening intelligence...");
  
  // Data State
  const [setups, setSetups] = useState<Setup[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [inventory, setInventory] = useState<{equipment: Equipment[], ingredients: Ingredient[]}>({
    equipment: [],
    ingredients: []
  });
  const [tasks, setTasks] = useState<Task[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ViewState | 'item_equip' | 'item_ingred' | 'edit_setup' | 'edit_plant'>('dashboard');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Load Data
  useEffect(() => {
    const savedSetups = localStorage.getItem('hydro_setups');
    const savedPlants = localStorage.getItem('hydro_plants');
    const savedInventory = localStorage.getItem('hydro_inventory');
    const savedTasks = localStorage.getItem('hydro_tasks');

    if (savedSetups) setSetups(JSON.parse(savedSetups));
    if (savedPlants) setPlants(JSON.parse(savedPlants));
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedTasks) setTasks(JSON.parse(savedTasks));

    getDailyTip().then(setDailyTip);
  }, []);

  // Save Data
  useEffect(() => {
    localStorage.setItem('hydro_setups', JSON.stringify(setups));
    localStorage.setItem('hydro_plants', JSON.stringify(plants));
    localStorage.setItem('hydro_inventory', JSON.stringify(inventory));
    localStorage.setItem('hydro_tasks', JSON.stringify(tasks));
  }, [setups, plants, inventory, tasks]);

  const addSetup = (setup: Omit<Setup, 'id'>) => {
    setSetups([...setups, { ...setup, id: Date.now().toString() }]);
    setIsModalOpen(false);
  };

  const updateSetup = (id: string, updatedData: Partial<Setup>) => {
    setSetups(setups.map(s => s.id === id ? { ...s, ...updatedData } : s));
    setIsModalOpen(false);
  };

  const addPlant = (plant: Omit<Plant, 'id'>) => {
    setPlants([...plants, { ...plant, id: Date.now().toString() }]);
    setIsModalOpen(false);
  };

  const updatePlant = (id: string, updatedData: Partial<Plant>) => {
    setPlants(plants.map(p => p.id === id ? { ...p, ...updatedData } : p));
    setIsModalOpen(false);
  };

  const addTask = (title: string, date: string) => {
    setTasks([...tasks, { id: Date.now().toString(), title, date, completed: false, priority: 'Medium' }]);
  };

  const addEquipment = (equip: Omit<Equipment, 'id'>) => {
    setInventory({ ...inventory, equipment: [...inventory.equipment, { ...equip, id: Date.now().toString() }] });
    setIsModalOpen(false);
  };

  const addIngredient = (ingred: Omit<Ingredient, 'id'>) => {
    setInventory({ ...inventory, ingredients: [...inventory.ingredients, { ...ingred, id: Date.now().toString() }] });
    setIsModalOpen(false);
  };

  const removeSetup = (id: string) => {
    if(confirm("Are you sure? This will also remove plants linked to this setup.")) {
      setSetups(setups.filter(s => s.id !== id));
      setPlants(plants.filter(p => p.setupId !== id));
    }
  };
  const removePlant = (id: string) => confirm("Remove this plant?") && setPlants(plants.filter(p => p.id !== id));
  const removeInventoryItem = (id: string, type: 'equip' | 'ingred') => {
    if (confirm("Remove this item?")) {
      if (type === 'equip') {
        setInventory({ ...inventory, equipment: inventory.equipment.filter(e => e.id !== id) });
      } else {
        setInventory({ ...inventory, ingredients: inventory.ingredients.filter(i => i.id !== id) });
      }
    }
  };

  // --- Views ---

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-500 p-6 rounded-2xl text-white shadow-lg shadow-emerald-100 flex items-center justify-between">
          <div><p className="opacity-80 text-sm font-medium">Active Setups</p><h4 className="text-3xl font-bold">{setups.length}</h4></div>
          <Layers className="opacity-50" size={32} />
        </div>
        <div className="bg-sky-500 p-6 rounded-2xl text-white shadow-lg shadow-sky-100 flex items-center justify-between">
          <div><p className="opacity-80 text-sm font-medium">Plants Growing</p><h4 className="text-3xl font-bold">{plants.filter(p => p.status !== 'Harvested').length}</h4></div>
          <Sprout className="opacity-50" size={32} />
        </div>
        <div className="bg-amber-500 p-6 rounded-2xl text-white shadow-lg shadow-amber-100 flex items-center justify-between">
          <div><p className="opacity-80 text-sm font-medium">Pending Tasks</p><h4 className="text-3xl font-bold">{tasks.filter(t => !t.completed).length}</h4></div>
          <Calendar className="opacity-50" size={32} />
        </div>
        <div className="bg-indigo-500 p-6 rounded-2xl text-white shadow-lg shadow-indigo-100 flex items-center justify-between">
          <div><p className="opacity-80 text-sm font-medium">Health Issues</p><h4 className="text-3xl font-bold">{plants.filter(p => p.status === 'Needs Attention' || p.status === 'Struggling').length}</h4></div>
          <Stethoscope className="opacity-50" size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Upcoming Tasks" action={<button onClick={() => setActiveView('calendar')} className="text-emerald-600 text-sm font-semibold hover:underline">Manage All</button>}>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-slate-400"><Calendar className="mx-auto mb-2 opacity-20" size={48} /><p>All caught up!</p></div>
              ) : (
                tasks.filter(t => !t.completed).slice(0, 4).map(task => (
                  <div key={task.id} className="flex items-center space-x-4 p-4 border border-slate-50 rounded-xl hover:bg-slate-50">
                    <input type="checkbox" className="w-5 h-5 accent-emerald-500" onChange={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: true} : t))} />
                    <div className="flex-1"><p className="font-medium text-slate-700">{task.title}</p><p className="text-xs text-slate-400">{new Date(task.date).toLocaleDateString()}</p></div>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${task.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>{task.priority}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        <div>
          <Card title="Quick AI Advice">
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-inner">
              <div className="flex items-start space-x-3">
                <div className="bg-emerald-600 p-2 rounded-lg text-white mt-1"><Stethoscope size={18} /></div>
                <p className="text-sm text-emerald-800 leading-relaxed italic">"{dailyTip}"</p>
              </div>
              <button onClick={() => setActiveView('troubleshoot')} className="mt-6 w-full bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm">Troubleshoot Symptoms</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const SetupsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">My System Setups</h2>
        <button onClick={() => { setModalType('setups'); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 font-semibold shadow-lg shadow-emerald-100"><Plus size={20} /><span>New Setup</span></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {setups.map(setup => (
          <div key={setup.id} className="group relative bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100">
              <button onClick={() => { setSelectedItem(setup); setModalType('edit_setup'); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-500"><Edit2 size={16} /></button>
              <button onClick={() => removeSetup(setup.id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><Layers size={24} /></div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">{setup.name}</h3>
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full uppercase mb-4">{setup.type}</span>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><p className="text-slate-400">Reservoir</p><p className="font-semibold text-slate-700">{setup.reservoirSize}</p></div>
              <div><p className="text-slate-400">Location</p><p className="font-semibold text-slate-700">{setup.location}</p></div>
            </div>
            {setup.notes && (
              <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 italic">
                {setup.notes}
              </div>
            )}
            <button onClick={() => setActiveView('plants')} className="w-full flex items-center justify-center space-x-2 text-emerald-600 font-semibold text-sm hover:bg-emerald-50 py-2 rounded-xl transition-colors"><span>View Plants</span><ChevronRight size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );

  const TroubleshootView = () => {
    const [issue, setIssue] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<string | null>(null);

    const handleTroubleshoot = async () => {
      if (!issue && !image) return;
      setLoading(true);
      const base64 = image ? image.split(',')[1] : undefined;
      const result = await troubleshootPlant(issue, base64);
      setDiagnosis(result);
      setLoading(false);
    };

    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center"><h2 className="text-3xl font-bold text-slate-800">AI Plant Consultant</h2><p className="text-slate-500 mt-2">Upload a photo or describe symptoms to get instant diagnosis.</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card title="Describe the Problem">
            <textarea value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="e.g. Yellowing leaf tips on my lettuce..." className="w-full h-40 p-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 mb-4" />
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Plant Photo (Optional)</label>
              <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center">
                {image ? (
                  <div className="relative w-full aspect-square"><img src={image} className="w-full h-full object-cover rounded-xl" /><button onClick={() => setImage(null)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X size={16}/></button></div>
                ) : (
                  <><input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onloadend = () => setImage(r.result as string); r.readAsDataURL(f); }}} className="absolute inset-0 opacity-0 cursor-pointer" /><Plus className="text-slate-300" /><p className="text-xs text-slate-400">Click to upload photo</p></>
                )}
              </div>
            </div>
            <button onClick={handleTroubleshoot} disabled={loading} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg disabled:opacity-50">{loading ? "Analyzing..." : "Run Diagnostic"}</button>
          </Card>
          <Card title="AI Findings">
            <div className="prose prose-emerald max-w-none">
              {diagnosis ? <div className="text-slate-700 bg-slate-50 p-6 rounded-2xl border border-slate-100 whitespace-pre-wrap">{diagnosis}</div> : <div className="text-center py-20 text-slate-300"><Stethoscope size={64} className="mx-auto mb-4 opacity-10"/><p>Awaiting your query...</p></div>}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const InventoryView = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Supplies & Equipment</h2>
        <div className="flex space-x-2">
           <button onClick={() => { setModalType('item_equip'); setIsModalOpen(true); }} className="bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-semibold"><Wrench size={16}/><span>Equipment</span></button>
           <button onClick={() => { setModalType('item_ingred'); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 text-sm font-semibold"><Droplets size={16}/><span>Ingredient</span></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Equipment" action={<Wrench size={20} className="text-slate-400"/>}>
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr><th className="px-6 py-4">Item</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.equipment.map(item => (
                  <tr key={item.id} className="group hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-700">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.category} • {item.notes || 'No notes'}</div>
                    </td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{item.status}</span></td>
                    <td className="px-6 py-4"><button onClick={() => removeInventoryItem(item.id, 'equip')} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Nutrients & Ingredients" action={<FlaskConical size={20} className="text-slate-400"/>}>
          <div className="space-y-4">
            {inventory.ingredients.map(ing => (
              <div key={ing.id} className="group p-4 border border-slate-100 rounded-2xl hover:border-emerald-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><Droplets size={16} /></div>
                    <div><h4 className="font-bold text-slate-700">{ing.name}</h4><p className="text-[10px] text-slate-400">{ing.purpose} • {ing.brand}</p></div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right text-xs"><p className="font-bold text-slate-700">{ing.quantity} {ing.unit}</p><p className="text-[10px] text-slate-400 font-bold">Qty</p></div>
                    <button onClick={() => removeInventoryItem(ing.id, 'ingred')} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                  </div>
                </div>
                {ing.notes && <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start space-x-1"><Info size={12} className="mt-0.5 flex-shrink-0" /><span>{ing.notes}</span></div>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const PlantsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">My Plants</h2>
        <button onClick={() => { setModalType('plants'); setIsModalOpen(true); }} className="bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center space-x-2 font-semibold shadow-lg shadow-emerald-100"><Plus size={20} /><span>New Plant</span></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {plants.map(plant => (
          <div key={plant.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
            <div className="h-40 bg-slate-100 relative group overflow-hidden">
               <img src={`https://picsum.photos/seed/${plant.name}/400/300`} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                 <button onClick={() => { setSelectedItem(plant); setModalType('edit_plant'); setIsModalOpen(true); }} className="p-2 bg-white rounded-full mx-1"><Edit2 size={18} /></button>
                 <button onClick={() => removePlant(plant.id)} className="p-2 bg-white rounded-full mx-1 text-red-500"><Trash2 size={18} /></button>
               </div>
               <div className="absolute bottom-2 right-2"><span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase shadow-sm ${plant.status === 'Healthy' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>{plant.status}</span></div>
            </div>
            <div className="p-5 flex-1">
              <h3 className="text-lg font-bold text-slate-800">{plant.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{plant.variety}</p>
              
              {plant.notes && (
                <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100 text-[11px] text-slate-600 leading-relaxed italic relative">
                  <FileText size={12} className="absolute top-2 right-2 text-amber-300" />
                  "{plant.notes}"
                </div>
              )}

              <div className="space-y-3 pt-4 border-t border-slate-50 text-xs">
                <div className="flex justify-between"><span className="text-slate-400">Planted</span><span className="font-semibold">{new Date(plant.plantedDate).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-400">System</span><span className="font-semibold text-emerald-600">{setups.find(s => s.id === plant.setupId)?.name || 'Unknown'}</span></div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100">
               <button onClick={() => { addTask(`Maintenance: ${plant.name}`, new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]); alert("Reminder scheduled!"); }} className="w-full flex items-center justify-center space-x-2 text-slate-500 hover:text-emerald-600 text-[10px] font-bold"><Clock size={12} /><span>Schedule 3-Day Check</span></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CalendarView = () => (
    <div className="max-w-4xl mx-auto space-y-6">
       <Card title="Task Schedule">
          <div className="space-y-6">
            <div className="flex space-x-4 mb-8">
              <input type="date" className="flex-1 p-3 border border-slate-200 rounded-xl outline-none" id="newTaskDate" />
              <input type="text" placeholder="Clean reservoir, dose nutrients..." className="flex-[2] p-3 border border-slate-200 rounded-xl outline-none" id="newTaskTitle" />
              <button onClick={() => { const t = (document.getElementById('newTaskTitle') as HTMLInputElement).value; const d = (document.getElementById('newTaskDate') as HTMLInputElement).value; if(t && d) { addTask(t, d); (document.getElementById('newTaskTitle') as HTMLInputElement).value = ''; } }} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-md">Add</button>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase text-slate-400 tracking-wider">Upcoming Reminders</h4>
              {tasks.length === 0 ? <p className="text-center py-10 text-slate-300 italic">No tasks yet.</p> : tasks.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(task => (
                  <div key={task.id} className={`flex items-center justify-between p-5 rounded-2xl border ${task.completed ? 'bg-slate-50 opacity-60' : 'bg-white shadow-sm'}`}>
                    <div className="flex items-center space-x-4">
                      <input type="checkbox" checked={task.completed} onChange={() => setTasks(tasks.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))} className="w-5 h-5 accent-emerald-600" />
                      <div><p className={`font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{task.title}</p><p className="text-xs text-slate-500">{new Date(task.date).toLocaleDateString()}</p></div>
                    </div>
                    <button onClick={() => setTasks(tasks.filter(t => t.id !== task.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                  </div>
              ))}
            </div>
          </div>
       </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 transform transition-transform duration-300 lg:translate-x-0 lg:static ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200"><Sprout size={24} /></div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent">HydroGrow Pro</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2 py-4">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
            <SidebarItem icon={Layers} label="Setups" active={activeView === 'setups'} onClick={() => setActiveView('setups')} />
            <SidebarItem icon={Sprout} label="Plants" active={activeView === 'plants'} onClick={() => setActiveView('plants')} />
            <SidebarItem icon={Stethoscope} label="AI Consultant" active={activeView === 'troubleshoot'} onClick={() => setActiveView('troubleshoot')} />
            <SidebarItem icon={FlaskConical} label="Inventory" active={activeView === 'inventory'} onClick={() => setActiveView('inventory')} />
            <SidebarItem icon={Calendar} label="Calendar" active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} />
          </nav>
          <div className="p-6">
            <div className="p-4 bg-slate-900 rounded-2xl text-white">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Quick Note</p>
              <input type="text" placeholder="Tap to jot something..." className="bg-transparent border-none text-[11px] text-slate-400 outline-none w-full" />
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 glass-effect sticky top-0 z-30 flex items-center justify-between px-8 border-b border-slate-100">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-500"><Menu size={24} /></button>
            <h2 className="text-lg font-bold text-slate-800">{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h2>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative hidden md:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input type="text" placeholder="Search my growth log..." className="pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-xs outline-none w-64 focus:ring-1 focus:ring-emerald-500" />
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden"><img src="https://picsum.photos/100" /></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'setups' && <SetupsView />}
          {activeView === 'plants' && <PlantsView />}
          {activeView === 'inventory' && <InventoryView />}
          {activeView === 'troubleshoot' && <TroubleshootView />}
          {activeView === 'calendar' && <CalendarView />}
        </div>
      </main>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedItem(null); }} title={modalType.replace('_', ' ').toUpperCase()}>
        {/* SETUP FORM */}
        {(modalType === 'setups' || modalType === 'edit_setup') && (
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = {
              name: (form.elements.namedItem('name') as HTMLInputElement).value,
              type: (form.elements.namedItem('type') as HTMLSelectElement).value as SystemType,
              startDate: (form.elements.namedItem('date') as HTMLInputElement).value,
              reservoirSize: (form.elements.namedItem('size') as HTMLInputElement).value,
              location: (form.elements.namedItem('location') as HTMLInputElement).value || 'Indoor',
              notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value
            };
            modalType === 'edit_setup' ? updateSetup(selectedItem.id, data) : addSetup(data);
          }}>
            <input name="name" required placeholder="System Name" defaultValue={selectedItem?.name} className="w-full p-3 rounded-xl border" />
            <select name="type" defaultValue={selectedItem?.type || "Hydroponic"} className="w-full p-3 rounded-xl border">
              <option>Hydroponic</option><option>Aquaponic</option><option>DWC</option><option>NFT</option><option>Kratky</option>
            </select>
            <div className="grid grid-cols-2 gap-4">
               <input name="date" type="date" defaultValue={selectedItem?.startDate || new Date().toISOString().split('T')[0]} className="w-full p-3 rounded-xl border" />
               <input name="size" placeholder="Res. Size (e.g. 15L)" defaultValue={selectedItem?.reservoirSize} className="w-full p-3 rounded-xl border" />
            </div>
            <input name="location" placeholder="Location (e.g. Balcony)" defaultValue={selectedItem?.location} className="w-full p-3 rounded-xl border" />
            <textarea name="notes" placeholder="Detailed notes about lights, pumps, etc..." defaultValue={selectedItem?.notes} className="w-full p-3 rounded-xl border h-32 outline-none focus:ring-1 focus:ring-emerald-500" />
            <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold">{modalType === 'edit_setup' ? 'Save Changes' : 'Create System'}</button>
          </form>
        )}

        {/* PLANT FORM */}
        {(modalType === 'plants' || modalType === 'edit_plant') && (
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = {
              setupId: (form.elements.namedItem('setupId') as HTMLSelectElement).value,
              name: (form.elements.namedItem('name') as HTMLInputElement).value,
              variety: (form.elements.namedItem('variety') as HTMLInputElement).value,
              plantedDate: (form.elements.namedItem('date') as HTMLInputElement).value,
              status: (form.elements.namedItem('status') as HTMLSelectElement)?.value as any || 'Healthy',
              lastChecked: new Date().toISOString(),
              notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value
            };
            modalType === 'edit_plant' ? updatePlant(selectedItem.id, data) : addPlant(data);
          }}>
            <select name="setupId" defaultValue={selectedItem?.setupId} className="w-full p-3 rounded-xl border">
              {setups.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input name="name" required placeholder="Species (e.g. Kale)" defaultValue={selectedItem?.name} className="w-full p-3 rounded-xl border" />
            <input name="variety" placeholder="Variety (e.g. Curly)" defaultValue={selectedItem?.variety} className="w-full p-3 rounded-xl border" />
            <div className="grid grid-cols-2 gap-4">
               <input name="date" type="date" defaultValue={selectedItem?.plantedDate || new Date().toISOString().split('T')[0]} className="w-full p-3 rounded-xl border" />
               <select name="status" defaultValue={selectedItem?.status || 'Healthy'} className="w-full p-3 rounded-xl border">
                 <option>Healthy</option><option>Needs Attention</option><option>Struggling</option><option>Harvested</option>
               </select>
            </div>
            <textarea name="notes" placeholder="Notes on growth rate, pruning, or pests..." defaultValue={selectedItem?.notes} className="w-full p-3 rounded-xl border h-32" />
            <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold">Save Plant</button>
          </form>
        )}

        {/* EQUIPMENT FORM */}
        {modalType === 'item_equip' && (
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget;
            addEquipment({
              name: (f.elements.namedItem('name') as HTMLInputElement).value,
              category: (f.elements.namedItem('category') as HTMLSelectElement).value as any,
              status: (f.elements.namedItem('status') as HTMLSelectElement).value as any,
              purchaseDate: new Date().toISOString(),
              notes: (f.elements.namedItem('notes') as HTMLTextAreaElement).value
            });
          }}>
            <input name="name" required placeholder="Equipment Name (e.g. VIPARSPECTRA P1000)" className="w-full p-3 rounded-xl border" />
            <div className="grid grid-cols-2 gap-4">
              <select name="category" className="p-3 rounded-xl border">
                <option>Lighting</option><option>Pump</option><option>Monitoring</option><option>Structural</option><option>Other</option>
              </select>
              <select name="status" className="p-3 rounded-xl border">
                <option>Active</option><option>Backup</option><option>Broken</option>
              </select>
            </div>
            <textarea name="notes" placeholder="Warranty info, power consumption, etc..." className="w-full p-3 rounded-xl border h-24" />
            <button type="submit" className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold">Add to Inventory</button>
          </form>
        )}

        {/* INGREDIENT FORM */}
        {modalType === 'item_ingred' && (
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const f = e.currentTarget;
            addIngredient({
              name: (f.elements.namedItem('name') as HTMLInputElement).value,
              brand: (f.elements.namedItem('brand') as HTMLInputElement).value,
              purpose: (f.elements.namedItem('purpose') as HTMLSelectElement).value as any,
              quantity: (f.elements.namedItem('qty') as HTMLInputElement).value,
              unit: (f.elements.namedItem('unit') as HTMLInputElement).value,
              notes: (f.elements.namedItem('notes') as HTMLTextAreaElement).value
            });
          }}>
            <input name="name" required placeholder="Nutrient/Chemical Name (e.g. pH Down)" className="w-full p-3 rounded-xl border" />
            <input name="brand" placeholder="Brand (e.g. General Hydroponics)" className="w-full p-3 rounded-xl border" />
            <div className="grid grid-cols-2 gap-4">
              <input name="qty" placeholder="Quantity (e.g. 500)" className="p-3 rounded-xl border" />
              <input name="unit" placeholder="Unit (e.g. ml)" className="p-3 rounded-xl border" />
            </div>
            <select name="purpose" className="w-full p-3 rounded-xl border">
              <option>Nutrient</option><option>pH Adjuster</option><option>Additive</option><option>Water Treatment</option>
            </select>
            <textarea name="notes" placeholder="Dilution ratios or mixing instructions..." className="w-full p-3 rounded-xl border h-24" />
            <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold">Add to Pantry</button>
          </form>
        )}
      </Modal>
    </div>
  );
}
