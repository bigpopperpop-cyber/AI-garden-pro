
export type GardenType = 'Indoor' | 'Outdoor';

export interface Plant {
  id: string;
  name: string;
  variety?: string;
  plantedDate: string;
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

export type ViewState = 'dashboard' | 'gardens' | 'troubleshoot' | 'settings';
