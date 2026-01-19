export type SystemType = 'Hydroponic' | 'Aquaponic' | 'Aeroponic' | 'Kratky' | 'DWC' | 'NFT';

export interface Setup {
  id: string;
  name: string;
  type: SystemType;
  startDate: string;
  reservoirSize: string;
  location: string;
  notes: string;
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
}

export interface Equipment {
  id: string;
  name: string;
  category: 'Lighting' | 'Pump' | 'Monitoring' | 'Structural' | 'Other';
  purchaseDate: string;
  status: 'Active' | 'Backup' | 'Broken';
  notes: string;
}

export interface Ingredient {
  id: string;
  name: string;
  brand: string;
  quantity: string;
  unit: string;
  purpose: 'Nutrient' | 'pH Adjuster' | 'Additive' | 'Water Treatment';
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
}

export type ViewState = 'dashboard' | 'setups' | 'plants' | 'inventory' | 'troubleshoot' | 'calendar' | 'settings' | 'support' | 'guide' | 'reports';