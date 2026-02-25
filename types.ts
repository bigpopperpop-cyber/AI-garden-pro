export type GardenType = 'Indoor' | 'Outdoor';
export type LifecycleStage = 'Germination' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvested';

export interface UserProfile {
  id: string;
  name: string;
  avatarColor: string;
}

export interface HarvestRecord {
  id: string;
  date: string;
  amount: number; // in grams or count
  unit: string;
}

export interface GardenNote {
  id: string;
  date: string;
  content: string;
  image?: string; // Base64 compressed string
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Plant {
  id: string;
  name: string;
  variety?: string;
  plantedDate: string;
  projectedHarvestDate?: string;
  stage: LifecycleStage;
  totalYield?: number;
  yieldUnit?: string;
  harvests: HarvestRecord[];
  notes: GardenNote[];
  phasePhotos?: Partial<Record<LifecycleStage, string>>; // Base64 compressed strings
}

export interface Garden {
  id: string;
  name: string;
  type: GardenType;
  startedDate: string;
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

export type ViewState = 'dashboard' | 'gardens' | 'calendar' | 'settings' | 'assistant' | 'manual';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface AIAnalysisResult {
  healthStatus: 'Healthy' | 'Warning' | 'Critical';
  diagnosis: string;
  recommendations: string[];
  detectedPests?: string[];
  detectedDeficiencies?: string[];
  stageVerification?: LifecycleStage;
}

export interface GrowthInsights {
  nutrientAdvice: string;
  phTarget: string;
  ecTarget: string;
  harvestPrediction: string;
  generalTips: string[];
}
