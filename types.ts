
export type GardenType = 'Indoor' | 'Outdoor';
export type LifecycleStage = 'Germination' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvested';

export interface UserProfile {
  id: string;
  name: string;
  avatarColor: string;
}

export interface GrowthProjection {
  germinationDate: string;
  vegetativeDate: string;
  floweringDate: string;
  harvestDate: string;
  notes: string;
}

export interface HarvestRecord {
  id: string;
  date: string;
  amount: number; // in grams or count
  unit: string;
}

export interface Plant {
  id: string;
  name: string;
  variety?: string;
  plantedDate: string;
  stage: LifecycleStage;
  harvests: HarvestRecord[];
  projection?: GrowthProjection;
}

export interface GardenNote {
  id: string;
  date: string;
  content: string;
}

export interface Garden {
  id: string;
  name: string;
  type: GardenType;
  startedDate: string;
  description: string;
  plants: Plant[];
  notes: GardenNote[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'maintenance' | 'alert' | 'tip';
}

export type ViewState = 'dashboard' | 'gardens' | 'settings';
