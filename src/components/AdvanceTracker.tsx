import { useState } from 'react';
import { useFarmers, useAdvances } from '@/hooks/useDairyData';
import { Advance } from '@/types/dairy';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Wallet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getCurrentBSDate } from '@/lib/bsDate';

export function AdvanceTracker() {
  const { farmers } = useFarmers();
  const { advances, loading, addAdvance, removeAdvance, refresh } = useAdvances();
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    farmerId: '',
    date: getCurrentBSDate(),
    amount: '',
    remarks: '',
  });

  const resetForm = () => {
    setFormData({
      farmerId: '',
      date: getCurrentBSDate(),
      amount: '',
      remarks: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.farmerId) {
      toast.error('Please select a farmer');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const farmer = farmers.find((f) => f.id === formData.farmerId);
    if (!farmer) return;

    setSubmitting(true);

    await addAdvance({
      farmerId: formData.farmerId,
      farmerNo: farmer.farmerNo,
      date: formData.date,
      amount: parseFloat(formData.amount),
      remarks: formData.remarks,
    });

    toast.success('Advance recorded successfully');
    setSubmitting(false);
    setIsOpen(false);
    resetForm();
  };

  const handleDelete = async (advance: Advance) => {
    if (window.confirm('Delete this advance record?')) {
      await removeAdvance(advance.id, advance.farmerId);
      toast.success('Advance deleted');
    }
  };

  const getFarmerName = (farmerId: string) => {
    const farmer = farmers.find((f) => f.id === farmerId);
    return farmer ? `#${farmer.farmerNo} - ${farmer.name}` : 'Unknown';
  };

  const totalAdvance = advances.reduce((sum, a) => sum + a.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Advance Tracker</h2>
          <Badge variant="destructive" className="text-base">
            Total: Rs. {totalAdvance.toFixed(2)}
          </Badge>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Record Advance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Advance Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Farmer</label>
                <Select
                  value={formData.farmerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, farmerId: value })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers
                      .sort((a, b) => a.farmerNo - b.farmerNo)
                      .map((farmer) => (
                        <SelectItem key={farmer.id} value={farmer.id}>
                          #{farmer.farmerNo} - {farmer.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Date (BS)</label>
                <Input
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  placeholder="YYYY-MM-DD"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount (Rs.)</label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Remarks (Optional)</label>
                <Input
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  placeholder="e.g., Festival advance"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Record Advance'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-table-header hover:bg-table-header">
                  <TableHead className="text-table-header-foreground font-bold">Date</TableHead>
                  <TableHead className="text-table-header-foreground font-bold">Farmer</TableHead>
                  <TableHead className="text-table-header-foreground font-bold">Amount</TableHead>
                  <TableHead className="text-table-header-foreground font-bold">Remarks</TableHead>
                  <TableHead className="text-table-header-foreground font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advances
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((advance, idx) => (
                    <TableRow
                      key={advance.id}
                      className={idx % 2 === 1 ? 'bg-table-row-alt' : ''}
                    >
                      <TableCell className="font-mono">{advance.date}</TableCell>
                      <TableCell>{getFarmerName(advance.farmerId)}</TableCell>
                      <TableCell className="font-bold text-destructive">
                        Rs. {advance.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {advance.remarks || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(advance)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {advances.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No advance records yet. Click "Record Advance" to add one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
