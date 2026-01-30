import { useState } from 'react';
import { useFarmers } from '@/hooks/useDairyData';
import { Farmer } from '@/types/dairy';
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
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getNextFarmerNo } from '@/lib/store';

export function FarmerManagement() {
  const { farmers, loading, addFarmer, updateFarmer, removeFarmer } = useFarmers();
  const [isOpen, setIsOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [formData, setFormData] = useState({
    farmerNo: '',
    name: '',
    fixedRate: '16.0',
  });
  const [submitting, setSubmitting] = useState(false);

  const resetForm = async () => {
    const nextNo = await getNextFarmerNo();
    setFormData({
      farmerNo: nextNo.toString(),
      name: '',
      fixedRate: '16.0',
    });
    setEditingFarmer(null);
  };

  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open);
    if (open && !editingFarmer) {
      await resetForm();
    }
  };

  const handleEdit = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setFormData({
      farmerNo: farmer.farmerNo.toString(),
      name: farmer.name,
      fixedRate: farmer.fixedRate.toString(),
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Farmer name is required');
      return;
    }

    setSubmitting(true);

    if (editingFarmer) {
      await updateFarmer({
        ...editingFarmer,
        farmerNo: parseInt(formData.farmerNo),
        name: formData.name,
        fixedRate: parseFloat(formData.fixedRate),
      });
      toast.success('Farmer updated successfully');
    } else {
      await addFarmer({
        farmerNo: parseInt(formData.farmerNo),
        name: formData.name,
        fixedRate: parseFloat(formData.fixedRate),
        advanceBalance: 0,
      });
      toast.success('Farmer added successfully');
    }

    setSubmitting(false);
    setIsOpen(false);
    await resetForm();
  };

  const handleDelete = async (farmer: Farmer) => {
    if (window.confirm(`Delete farmer #${farmer.farmerNo} - ${farmer.name}?`)) {
      await removeFarmer(farmer.id);
      toast.success('Farmer deleted');
    }
  };

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
          <Users className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Farmer Management</h2>
          <Badge variant="secondary">{farmers.length} farmers</Badge>
        </div>

        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Farmer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingFarmer ? 'Edit Farmer' : 'Add New Farmer'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Farmer No.</label>
                <Input
                  type="number"
                  value={formData.farmerNo}
                  onChange={(e) =>
                    setFormData({ ...formData, farmerNo: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter farmer name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fixed Rate (per Fat Unit)</label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.fixedRate}
                  onChange={(e) =>
                    setFormData({ ...formData, fixedRate: e.target.value })
                  }
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
                    `${editingFarmer ? 'Update' : 'Add'} Farmer`
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
                  <TableHead className="text-table-header-foreground font-bold">No.</TableHead>
                  <TableHead className="text-table-header-foreground font-bold">Name</TableHead>
                  <TableHead className="text-table-header-foreground font-bold">Rate</TableHead>
                  <TableHead className="text-table-header-foreground font-bold">Advance</TableHead>
                  <TableHead className="text-table-header-foreground font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farmers
                  .sort((a, b) => a.farmerNo - b.farmerNo)
                  .map((farmer, idx) => (
                    <TableRow
                      key={farmer.id}
                      className={idx % 2 === 1 ? 'bg-table-row-alt' : ''}
                    >
                      <TableCell className="font-mono font-bold">
                        {farmer.farmerNo}
                      </TableCell>
                      <TableCell>{farmer.name}</TableCell>
                      <TableCell>Rs. {farmer.fixedRate.toFixed(2)}</TableCell>
                      <TableCell>
                        {farmer.advanceBalance > 0 ? (
                          <Badge variant="destructive">
                            Rs. {farmer.advanceBalance.toFixed(2)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(farmer)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(farmer)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {farmers.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              No farmers registered yet. Click "Add Farmer" to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
