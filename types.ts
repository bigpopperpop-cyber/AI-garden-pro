export type SystemType = 'Hydroponic' | 'Aquaponic' | 'Aeroponic' | 'Kratky' | 'DWC' | 'NFT';

export interface WaterLog {
  id: string;
  date: string;
  ph: number;
  ec: number; // PPM or mS/cm
  temp: number; // Celsius or Fahrenheit
  notes?: string;
}

export interface Setup {
  id: string;
  name: string;
  type: SystemType;
  startDate: string;
  reservoirSize: string;
  location: string;
  notes: string;
  cost?: number;
  waterLogs: WaterLog[]; // New: Track water parameters
}

export interface HarvestRecord {
  id: string;
  date: string;
  amount: number; // weight or count
  unit: string;   // g, kg, pieces
}

export interface Plant {
  id: string;
  setupId: string;
  name: string;
  variety: string;
  plantedDate: string;
  germinatedDate?: string;
  floweredDate?: string;
  status: 'Healthy' | 'Needs Attention' | 'Struggling' | 'Harvested';
  lastChecked: string;
  notes: string;
  harvestRecords: HarvestRecord[];
  cost?: number;
  // Projections
  projectedGerminationDate?: string;
  projectedFloweringDate?: string;
  projectedHarvestDate?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: 'Lighting' | 'Pump' | 'Monitoring' | 'Structural' | 'Other';
  purchaseDate: string;
  status: 'Active' | 'Backup' | 'Broken';
  notes: string;
  cost?: number;
  setupId?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  brand: string;
  quantity: string;
  unit: string;
  purpose: 'Nutrient' | 'pH Adjuster' | 'Additive' | 'Water Treatment';
  notes: string;
  cost?: number;
}

export interface Task {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
}

export type ViewState = 'dashboard' | 'setups' | 'plants' | 'inventory' | 'troubleshoot' | 'calendar' | 'settings' | 'support' | 'guide' | 'reports';