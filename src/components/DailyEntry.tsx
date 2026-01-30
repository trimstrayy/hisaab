import { useState, useEffect, useCallback } from 'react';
import { useFarmers, useDailyLogs, useAdvances } from '@/hooks/useDairyData';
import { getCurrentBSDate } from '@/lib/bsDate';
import { Farmer, DailyLog, Advance } from '@/types/dairy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface EntryState {
  morningMilk: string;
  morningFat: string;
  eveningMilk: string;
  eveningFat: string;
  advance: string;
  saved: boolean;
  advanceSaved: boolean;
}

export function DailyEntry() {
  const [selectedDate, setSelectedDate] = useState(getCurrentBSDate());
  const { farmers, loading: farmersLoading, refresh: refreshFarmers } = useFarmers();
  const { logs, saveLog, refresh: refreshLogs } = useDailyLogs(selectedDate);
  const { addAdvance, refresh: refreshAdvances } = useAdvances();
  const [entries, setEntries] = useState<Record<string, EntryState>>({});
  const [saving, setSaving] = useState<string | null>(null);

  // Initialize entries from logs
  useEffect(() => {
    const newEntries: Record<string, EntryState> = {};
    farmers.forEach((farmer) => {
      const morningLog = logs.find(
        (l) => l.farmerId === farmer.id && l.shift === 'morning'
      );
      const eveningLog = logs.find(
        (l) => l.farmerId === farmer.id && l.shift === 'evening'
      );
      newEntries[farmer.id] = {
        morningMilk: morningLog?.milk?.toString() || '',
        morningFat: morningLog?.fat?.toString() || '',
        eveningMilk: eveningLog?.milk?.toString() || '',
        eveningFat: eveningLog?.fat?.toString() || '',
        advance: '',
        saved: !!(morningLog || eveningLog),
        advanceSaved: false,
      };
    });
    setEntries(newEntries);
  }, [farmers, logs]);

  // Refresh logs when date changes
  useEffect(() => {
    refreshLogs();
  }, [selectedDate, refreshLogs]);

  const handleSaveRow = async (farmer: Farmer) => {
    const entry = entries[farmer.id];
    if (!entry) return;

    setSaving(farmer.id);
    let success = true;

    // Save morning log if values exist
    if (entry.morningMilk || entry.morningFat) {
      const morningLog: Omit<DailyLog, 'id'> = {
        date: selectedDate,
        farmerId: farmer.id,
        farmerNo: farmer.farmerNo,
        shift: 'morning',
        milk: parseFloat(entry.morningMilk) || 0,
        fat: parseFloat(entry.morningFat) || 0,
      };
      const result = await saveLog(morningLog);
      if (!result) success = false;
    }

    // Save evening log if values exist
    if (entry.eveningMilk || entry.eveningFat) {
      const eveningLog: Omit<DailyLog, 'id'> = {
        date: selectedDate,
        farmerId: farmer.id,
        farmerNo: farmer.farmerNo,
        shift: 'evening',
        milk: parseFloat(entry.eveningMilk) || 0,
        fat: parseFloat(entry.eveningFat) || 0,
      };
      const result = await saveLog(eveningLog);
      if (!result) success = false;
    }

    // Save advance if value exists
    if (entry.advance && parseFloat(entry.advance) > 0) {
      const advance: Omit<Advance, 'id'> = {
        farmerId: farmer.id,
        farmerNo: farmer.farmerNo,
        date: selectedDate,
        amount: parseFloat(entry.advance),
        remarks: '',
      };
      const result = await addAdvance(advance);
      if (result) {
        setEntries((prev) => ({
          ...prev,
          [farmer.id]: { ...prev[farmer.id], advance: '', advanceSaved: true },
        }));
        await refreshFarmers();
        await refreshAdvances();
      } else {
        success = false;
      }
    }

    if (success) {
      setEntries((prev) => ({
        ...prev,
        [farmer.id]: { ...prev[farmer.id], saved: true },
      }));
      toast.success(`Saved entry for #${farmer.farmerNo}`);
    } else {
      toast.error('Failed to save entry');
    }

    setSaving(null);
  };

  const handleSaveAll = async () => {
    for (const farmer of farmers) {
      const entry = entries[farmer.id];
      if (entry && (entry.morningMilk || entry.morningFat || entry.eveningMilk || entry.eveningFat || entry.advance)) {
        await handleSaveRow(farmer);
      }
    }
  };

  const updateEntry = (
    farmerId: string,
    field: keyof Omit<EntryState, 'saved' | 'advanceSaved'>,
    value: string
  ) => {
    setEntries((prev) => ({
      ...prev,
      [farmerId]: {
        ...prev[farmerId],
        [field]: value,
        saved: false,
      },
    }));
  };

  const getTotals = useCallback(() => {
    let totalMorningMilk = 0;
    let totalEveningMilk = 0;

    logs.forEach((log) => {
      if (log.shift === 'morning') {
        totalMorningMilk += log.milk;
      } else {
        totalEveningMilk += log.milk;
      }
    });

    return {
      morningMilk: totalMorningMilk.toFixed(1),
      eveningMilk: totalEveningMilk.toFixed(1),
      totalMilk: (totalMorningMilk + totalEveningMilk).toFixed(1),
    };
  }, [logs]);

  const totals = getTotals();

  if (farmersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            placeholder="YYYY-MM-DD"
            className="w-36"
          />
        </div>

        <Button onClick={handleSaveAll} className="gap-2 ml-auto">
          <Save className="h-4 w-4" />
          Save All
        </Button>
      </div>

      {/* Entry Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-table-header hover:bg-table-header">
                  <TableHead className="text-table-header-foreground font-bold text-center w-16" rowSpan={2}>
                    No.
                  </TableHead>
                  <TableHead className="text-table-header-foreground font-bold text-center border-l" colSpan={2}>
                    Morning
                  </TableHead>
                  <TableHead className="text-table-header-foreground font-bold text-center border-l" colSpan={2}>
                    Evening
                  </TableHead>
                  <TableHead className="text-table-header-foreground font-bold text-center border-l w-24" rowSpan={2}>
                    Advance
                  </TableHead>
                  <TableHead className="text-table-header-foreground font-bold text-center border-l w-20" rowSpan={2}>
                    Action
                  </TableHead>
                </TableRow>
                <TableRow className="bg-table-header hover:bg-table-header">
                  <TableHead className="text-table-header-foreground font-bold text-center border-l">
                    Milk
                  </TableHead>
                  <TableHead className="text-table-header-foreground font-bold text-center">
                    Fat
                  </TableHead>
                  <TableHead className="text-table-header-foreground font-bold text-center border-l">
                    Milk
                  </TableHead>
                  <TableHead className="text-table-header-foreground font-bold text-center">
                    Fat
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farmers
                  .sort((a, b) => a.farmerNo - b.farmerNo)
                  .map((farmer, idx) => {
                    const entry = entries[farmer.id] || {
                      morningMilk: '',
                      morningFat: '',
                      eveningMilk: '',
                      eveningFat: '',
                      advance: '',
                      saved: false,
                      advanceSaved: false,
                    };
                    const isSaving = saving === farmer.id;

                    return (
                      <TableRow
                        key={farmer.id}
                        className={`${idx % 2 === 1 ? 'bg-table-row-alt' : ''} ${entry.saved ? 'bg-primary/5' : ''}`}
                      >
                        <TableCell className="font-mono font-bold text-center">
                          {farmer.farmerNo}
                        </TableCell>
                        <TableCell className="border-l p-1">
                          <Input
                            type="number"
                            step="0.1"
                            value={entry.morningMilk}
                            onChange={(e) => updateEntry(farmer.id, 'morningMilk', e.target.value)}
                            className="h-8 text-center"
                            placeholder="0.0"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Input
                            type="number"
                            step="0.1"
                            value={entry.morningFat}
                            onChange={(e) => updateEntry(farmer.id, 'morningFat', e.target.value)}
                            className="h-8 text-center"
                            placeholder="0.0"
                          />
                        </TableCell>
                        <TableCell className="border-l p-1">
                          <Input
                            type="number"
                            step="0.1"
                            value={entry.eveningMilk}
                            onChange={(e) => updateEntry(farmer.id, 'eveningMilk', e.target.value)}
                            className="h-8 text-center"
                            placeholder="0.0"
                          />
                        </TableCell>
                        <TableCell className="p-1">
                          <Input
                            type="number"
                            step="0.1"
                            value={entry.eveningFat}
                            onChange={(e) => updateEntry(farmer.id, 'eveningFat', e.target.value)}
                            className="h-8 text-center"
                            placeholder="0.0"
                          />
                        </TableCell>
                        <TableCell className="border-l p-1">
                          <Input
                            type="number"
                            step="1"
                            value={entry.advance}
                            onChange={(e) => updateEntry(farmer.id, 'advance', e.target.value)}
                            className="h-8 text-center"
                            placeholder="0"
                          />
                        </TableCell>
                        <TableCell className="border-l p-1 text-center">
                          <Button
                            onClick={() => handleSaveRow(farmer)}
                            disabled={isSaving}
                            size="sm"
                            variant={entry.saved ? 'outline' : 'default'}
                            className="h-8 w-full"
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Save'
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                {/* Totals Row */}
                <TableRow className="bg-primary/10 font-bold">
                  <TableCell className="text-center">Total</TableCell>
                  <TableCell className="text-center border-l font-mono" colSpan={2}>
                    {totals.morningMilk} L
                  </TableCell>
                  <TableCell className="text-center border-l font-mono" colSpan={2}>
                    {totals.eveningMilk} L
                  </TableCell>
                  <TableCell className="text-center border-l font-mono text-primary" colSpan={2}>
                    Total: {totals.totalMilk} L
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {farmers.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-muted-foreground">
            No farmers registered. Add farmers first to start daily entries.
          </p>
        </Card>
      )}
    </div>
  );
}
