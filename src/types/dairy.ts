export interface Farmer {
  id: string;
  farmerNo: number;
  name: string;
  fixedRate: number; // Default 16.0
  advanceBalance: number;
  createdAt: string;
}

export interface DailyLog {
  id: string;
  date: string; // BS format YYYY-MM-DD
  farmerId: string;
  farmerNo: number;
  shift: 'morning' | 'evening';
  milk: number; // Liters
  fat: number; // Percentage
}

export interface Advance {
  id: string;
  farmerId: string;
  farmerNo: number;
  date: string;
  amount: number;
  remarks: string;
}

export interface DailyEntry {
  date: string;
  morningMilk: number;
  morningFat: number;
  eveningMilk: number;
  eveningFat: number;
  totalFatUnits: number;
  amount: number;
  remarks?: string;
}

export interface FarmerStatement {
  farmer: Farmer;
  entries: DailyEntry[];
  totalFatUnits: number;
  totalAmount: number;
  pendingAdvance: number;
}

// Calculate fat units for a single entry
export function calculateFatUnits(
  morningMilk: number,
  morningFat: number,
  eveningMilk: number,
  eveningFat: number
): number {
  return Number(((morningMilk * morningFat) + (eveningMilk * eveningFat)).toFixed(2));
}

// Calculate amount based on fat units and rate
export function calculateAmount(fatUnits: number, rate: number): number {
  return Number((fatUnits * rate).toFixed(2));
}
