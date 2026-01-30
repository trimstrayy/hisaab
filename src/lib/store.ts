import { supabase } from '@/integrations/supabase/client';
import { Farmer, DailyLog, Advance } from '@/types/dairy';

// Farmers
export async function getFarmers(): Promise<Farmer[]> {
  const { data, error } = await supabase
    .from('farmers')
    .select('*')
    .order('farmer_no', { ascending: true });
  
  if (error) {
    console.error('Error fetching farmers:', error);
    return [];
  }
  
  return data.map(f => ({
    id: f.id,
    farmerNo: f.farmer_no,
    name: f.name,
    fixedRate: Number(f.fixed_rate),
    advanceBalance: Number(f.advance_balance),
    createdAt: f.created_at,
  }));
}

export async function saveFarmer(farmer: Omit<Farmer, 'id' | 'createdAt'>): Promise<Farmer | null> {
  const { data, error } = await supabase
    .from('farmers')
    .insert({
      farmer_no: farmer.farmerNo,
      name: farmer.name,
      fixed_rate: farmer.fixedRate,
      advance_balance: farmer.advanceBalance,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving farmer:', error);
    return null;
  }
  
  return {
    id: data.id,
    farmerNo: data.farmer_no,
    name: data.name,
    fixedRate: Number(data.fixed_rate),
    advanceBalance: Number(data.advance_balance),
    createdAt: data.created_at,
  };
}

export async function updateFarmer(farmer: Farmer): Promise<boolean> {
  const { error } = await supabase
    .from('farmers')
    .update({
      farmer_no: farmer.farmerNo,
      name: farmer.name,
      fixed_rate: farmer.fixedRate,
      advance_balance: farmer.advanceBalance,
    })
    .eq('id', farmer.id);
  
  if (error) {
    console.error('Error updating farmer:', error);
    return false;
  }
  
  return true;
}

export async function deleteFarmer(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('farmers')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting farmer:', error);
    return false;
  }
  
  return true;
}

export async function getNextFarmerNo(): Promise<number> {
  const { data, error } = await supabase
    .from('farmers')
    .select('farmer_no')
    .order('farmer_no', { ascending: false })
    .limit(1);
  
  if (error || !data || data.length === 0) {
    return 1;
  }
  
  return data[0].farmer_no + 1;
}

// Daily Logs
export async function getDailyLogs(): Promise<DailyLog[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching daily logs:', error);
    return [];
  }
  
  return data.map(l => ({
    id: l.id,
    date: l.date,
    farmerId: l.farmer_id,
    farmerNo: l.farmer_no,
    shift: l.shift as 'morning' | 'evening',
    milk: Number(l.milk),
    fat: Number(l.fat),
  }));
}

export async function getLogsByDate(date: string): Promise<DailyLog[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('date', date);
  
  if (error) {
    console.error('Error fetching logs by date:', error);
    return [];
  }
  
  return data.map(l => ({
    id: l.id,
    date: l.date,
    farmerId: l.farmer_id,
    farmerNo: l.farmer_no,
    shift: l.shift as 'morning' | 'evening',
    milk: Number(l.milk),
    fat: Number(l.fat),
  }));
}

export async function getLogsByFarmerAndDateRange(
  farmerId: string, 
  startDate: string, 
  endDate: string
): Promise<DailyLog[]> {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('farmer_id', farmerId)
    .gte('date', startDate)
    .lte('date', endDate);
  
  if (error) {
    console.error('Error fetching logs by date range:', error);
    return [];
  }
  
  return data.map(l => ({
    id: l.id,
    date: l.date,
    farmerId: l.farmer_id,
    farmerNo: l.farmer_no,
    shift: l.shift as 'morning' | 'evening',
    milk: Number(l.milk),
    fat: Number(l.fat),
  }));
}

export async function saveLog(log: Omit<DailyLog, 'id'>): Promise<DailyLog | null> {
  // Upsert to handle updates
  const { data, error } = await supabase
    .from('daily_logs')
    .upsert({
      date: log.date,
      farmer_id: log.farmerId,
      farmer_no: log.farmerNo,
      shift: log.shift,
      milk: log.milk,
      fat: log.fat,
    }, {
      onConflict: 'date,farmer_id,shift',
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving log:', error);
    return null;
  }
  
  return {
    id: data.id,
    date: data.date,
    farmerId: data.farmer_id,
    farmerNo: data.farmer_no,
    shift: data.shift as 'morning' | 'evening',
    milk: Number(data.milk),
    fat: Number(data.fat),
  };
}

export async function deleteLog(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting log:', error);
    return false;
  }
  
  return true;
}

// Advances
export async function getAdvances(): Promise<Advance[]> {
  const { data, error } = await supabase
    .from('advances')
    .select('*')
    .order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching advances:', error);
    return [];
  }
  
  return data.map(a => ({
    id: a.id,
    farmerId: a.farmer_id,
    farmerNo: a.farmer_no,
    date: a.date,
    amount: Number(a.amount),
    remarks: a.remarks || '',
  }));
}

export async function getAdvancesByFarmer(farmerId: string): Promise<Advance[]> {
  const { data, error } = await supabase
    .from('advances')
    .select('*')
    .eq('farmer_id', farmerId);
  
  if (error) {
    console.error('Error fetching advances by farmer:', error);
    return [];
  }
  
  return data.map(a => ({
    id: a.id,
    farmerId: a.farmer_id,
    farmerNo: a.farmer_no,
    date: a.date,
    amount: Number(a.amount),
    remarks: a.remarks || '',
  }));
}

export async function saveAdvance(advance: Omit<Advance, 'id'>): Promise<Advance | null> {
  const { data, error } = await supabase
    .from('advances')
    .insert({
      farmer_id: advance.farmerId,
      farmer_no: advance.farmerNo,
      date: advance.date,
      amount: advance.amount,
      remarks: advance.remarks,
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving advance:', error);
    return null;
  }
  
  // Update farmer's advance balance
  const { data: advancesData } = await supabase
    .from('advances')
    .select('amount')
    .eq('farmer_id', advance.farmerId);
  
  if (advancesData) {
    const totalAdvance = advancesData.reduce((sum, a) => sum + Number(a.amount), 0);
    await supabase
      .from('farmers')
      .update({ advance_balance: totalAdvance })
      .eq('id', advance.farmerId);
  }
  
  return {
    id: data.id,
    farmerId: data.farmer_id,
    farmerNo: data.farmer_no,
    date: data.date,
    amount: Number(data.amount),
    remarks: data.remarks || '',
  };
}

export async function deleteAdvance(id: string, farmerId: string): Promise<boolean> {
  const { error } = await supabase
    .from('advances')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting advance:', error);
    return false;
  }
  
  // Update farmer's advance balance
  const { data: advancesData } = await supabase
    .from('advances')
    .select('amount')
    .eq('farmer_id', farmerId);
  
  if (advancesData) {
    const totalAdvance = advancesData.reduce((sum, a) => sum + Number(a.amount), 0);
    await supabase
      .from('farmers')
      .update({ advance_balance: totalAdvance })
      .eq('id', farmerId);
  }
  
  return true;
}
