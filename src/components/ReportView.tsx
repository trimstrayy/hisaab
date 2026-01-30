import { useState, useMemo } from 'react';
import { useFarmers, useDailyLogs } from '@/hooks/useDairyData';
import { calculateFatUnits, calculateAmount, DailyEntry, FarmerStatement } from '@/types/dairy';
import { generateDateRange } from '@/lib/bsDate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Printer, Calendar, Loader2 } from 'lucide-react';

export function ReportView() {
  const { farmers, loading: farmersLoading } = useFarmers();
  const { logs, loading: logsLoading } = useDailyLogs();
  const [startDate, setStartDate] = useState('2081-01-16');
  const [endDate, setEndDate] = useState('2081-01-31');
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('all');

  const statements = useMemo(() => {
    const dateRange = generateDateRange(startDate, endDate);
    const filteredFarmers = selectedFarmerId === 'all' 
      ? farmers 
      : farmers.filter(f => f.id === selectedFarmerId);

    return filteredFarmers.map((farmer) => {
      const entries: DailyEntry[] = dateRange.map((date) => {
        const morningLog = logs.find(
          (l) => l.date === date && l.farmerId === farmer.id && l.shift === 'morning'
        );
        const eveningLog = logs.find(
          (l) => l.date === date && l.farmerId === farmer.id && l.shift === 'evening'
        );

        const morningMilk = morningLog?.milk || 0;
        const morningFat = morningLog?.fat || 0;
        const eveningMilk = eveningLog?.milk || 0;
        const eveningFat = eveningLog?.fat || 0;

        const totalFatUnits = calculateFatUnits(morningMilk, morningFat, eveningMilk, eveningFat);
        const amount = calculateAmount(totalFatUnits, farmer.fixedRate);

        return {
          date,
          morningMilk,
          morningFat,
          eveningMilk,
          eveningFat,
          totalFatUnits,
          amount,
        };
      });

      const totalFatUnits = entries.reduce((sum, e) => sum + e.totalFatUnits, 0);
      const totalAmount = entries.reduce((sum, e) => sum + e.amount, 0);

      return {
        farmer,
        entries,
        totalFatUnits: Number(totalFatUnits.toFixed(2)),
        totalAmount: Number(totalAmount.toFixed(2)),
        pendingAdvance: farmer.advanceBalance,
      } as FarmerStatement;
    });
  }, [farmers, logs, startDate, endDate, selectedFarmerId]);

  const handlePrint = () => {
    window.print();
  };

  const grandTotal = statements.reduce((sum, s) => sum + s.totalAmount, 0);

  if (farmersLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls - Hide on print */}
      <div className="flex flex-wrap items-center gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start Date"
            className="w-36"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="text"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End Date"
            className="w-36"
          />
        </div>

        <Select value={selectedFarmerId} onValueChange={setSelectedFarmerId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Farmers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Farmers</SelectItem>
            {farmers
              .sort((a, b) => a.farmerNo - b.farmerNo)
              .map((farmer) => (
                <SelectItem key={farmer.id} value={farmer.id}>
                  #{farmer.farmerNo} - {farmer.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Button onClick={handlePrint} variant="outline" className="gap-2 ml-auto">
          <Printer className="h-4 w-4" />
          Print Report
        </Button>
      </div>

      {/* Reports */}
      {statements.map((statement) => (
        <Card key={statement.farmer.id} className="print:shadow-none print:border-2">
          <CardHeader className="border-b bg-muted/50 print:bg-transparent">
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">Panchamrit Suppliers</h1>
              <p className="text-muted-foreground">Banepa-9, Kavre</p>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <div>
                <span className="text-muted-foreground">Farmer Name: </span>
                <span className="font-semibold">{statement.farmer.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Farmer No: </span>
                <span className="font-bold text-lg">{statement.farmer.farmerNo}</span>
              </div>
            </div>
            <CardTitle className="text-center text-lg mt-4">
              {startDate.replace(/-/g, ' ')} To {endDate.replace(/-/g, ' ')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-table-header hover:bg-table-header">
                    <TableHead className="text-table-header-foreground font-bold text-center" rowSpan={2}>
                      Date
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-bold text-center border-l" colSpan={2}>
                      Morning
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-bold text-center border-l" colSpan={2}>
                      Evening
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-bold text-center border-l" rowSpan={2}>
                      Fat Unit
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-bold text-center border-l" rowSpan={2}>
                      Amount
                    </TableHead>
                    <TableHead className="text-table-header-foreground font-bold text-center border-l" rowSpan={2}>
                      Remarks
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
                  {statement.entries.map((entry, idx) => (
                    <TableRow
                      key={entry.date}
                      className={idx % 2 === 1 ? 'bg-table-row-alt' : ''}
                    >
                      <TableCell className="font-mono text-center">{entry.date}</TableCell>
                      <TableCell className="text-center border-l">
                        {entry.morningMilk > 0 ? entry.morningMilk.toFixed(1) : ''}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.morningFat > 0 ? entry.morningFat.toFixed(1) : ''}
                      </TableCell>
                      <TableCell className="text-center border-l">
                        {entry.eveningMilk > 0 ? entry.eveningMilk.toFixed(1) : ''}
                      </TableCell>
                      <TableCell className="text-center">
                        {entry.eveningFat > 0 ? entry.eveningFat.toFixed(1) : ''}
                      </TableCell>
                      <TableCell className="text-center font-mono border-l">
                        {entry.totalFatUnits.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center font-mono border-l">
                        {entry.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center border-l">
                        {entry.remarks || ''}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Total Row */}
                  <TableRow className="bg-primary/10 font-bold">
                    <TableCell colSpan={5} className="text-right">
                      Period Total:
                    </TableCell>
                    <TableCell className="text-center font-mono border-l">
                      {statement.totalFatUnits.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center font-mono border-l text-primary">
                      {statement.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell className="border-l"></TableCell>
                  </TableRow>

                  {/* Advance Row - if any */}
                  {statement.pendingAdvance > 0 && (
                    <TableRow className="bg-destructive/10">
                      <TableCell colSpan={6} className="text-right font-medium">
                        Pending Advance:
                      </TableCell>
                      <TableCell className="text-center font-mono text-destructive font-bold border-l">
                        {statement.pendingAdvance.toFixed(2)}
                      </TableCell>
                      <TableCell className="border-l text-xs text-muted-foreground">
                        (Not deducted)
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Grand Total - Only show when viewing all farmers */}
      {selectedFarmerId === 'all' && statements.length > 1 && (
        <Card className="bg-primary text-primary-foreground print:bg-transparent print:text-foreground print:border-2">
          <CardContent className="py-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-semibold">Grand Total (All Farmers):</span>
              <span className="font-bold text-2xl font-mono">
                Rs. {grandTotal.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {statements.length === 0 && (
        <Card className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No data found for the selected date range and farmer.
          </p>
        </Card>
      )}
    </div>
  );
}
