import { useState, useEffect, useCallback } from 'react';
import { Farmer, DailyLog, Advance } from '@/types/dairy';
import * as store from '@/lib/store';

export function useFarmers() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await store.getFarmers();
    setFarmers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addFarmer = async (farmer: Omit<Farmer, 'id' | 'createdAt'>) => {
    const newFarmer = await store.saveFarmer(farmer);
    if (newFarmer) {
      await refresh();
    }
    return newFarmer;
  };

  const updateFarmer = async (farmer: Farmer) => {
    const success = await store.updateFarmer(farmer);
    if (success) {
      await refresh();
    }
    return success;
  };

  const removeFarmer = async (id: string) => {
    const success = await store.deleteFarmer(id);
    if (success) {
      await refresh();
    }
    return success;
  };

  return { farmers, loading, addFarmer, updateFarmer, removeFarmer, refresh };
}

export function useDailyLogs(date?: string) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = date 
      ? await store.getLogsByDate(date)
      : await store.getDailyLogs();
    setLogs(data);
    setLoading(false);
  }, [date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveLog = async (log: Omit<DailyLog, 'id'>) => {
    const newLog = await store.saveLog(log);
    if (newLog) {
      await refresh();
    }
    return newLog;
  };

  const removeLog = async (id: string) => {
    const success = await store.deleteLog(id);
    if (success) {
      await refresh();
    }
    return success;
  };

  return { logs, loading, saveLog, removeLog, refresh };
}

export function useAdvances(farmerId?: string) {
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = farmerId 
      ? await store.getAdvancesByFarmer(farmerId)
      : await store.getAdvances();
    setAdvances(data);
    setLoading(false);
  }, [farmerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addAdvance = async (advance: Omit<Advance, 'id'>) => {
    const newAdvance = await store.saveAdvance(advance);
    if (newAdvance) {
      await refresh();
    }
    return newAdvance;
  };

  const removeAdvance = async (id: string, farmerId: string) => {
    const success = await store.deleteAdvance(id, farmerId);
    if (success) {
      await refresh();
    }
    return success;
  };

  return { advances, loading, addAdvance, removeAdvance, refresh };
}
