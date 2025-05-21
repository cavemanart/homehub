import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, DollarSign } from 'lucide-react';
import BillForm from '@/pages/bills/BillForm';
import BillCard from '@/pages/bills/BillCard';
import { Link } from 'react-router-dom';

const Bills = ({ currentUser }) => {
  const [bills, setBills] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const { toast } = useToast();
  const householdId = currentUser?.householdId;

  useEffect(() => {
    if (!householdId) return;
    const savedBills = JSON.parse(localStorage.getItem(`homeBills_${householdId}`) || '[]');
    setBills(savedBills);
  }, [householdId]);

  const saveBills = (updatedBills) => {
    if (!householdId) return;
    localStorage.setItem(`homeBills_${householdId}`, JSON.stringify(updatedBills));
    setBills(updatedBills);
  };

  const handleFormSubmit = (billData) => {
    if (!billData.name || !billData.amount) {
      toast({ variant: "destructive", title: "Error", description: "Bill name and amount are required." });
      return;
    }
    if (editingBill) {
      saveBills(bills.map(b => b.id === editingBill.id ? { ...editingBill, ...billData } : b));
      toast({ title: "Bill updated", description: "The bill has been updated successfully." });
    } else {
      saveBills([...bills, { ...billData, id: Date.now(), createdAt: new Date().toISOString() }]);
      toast({ title: "Bill added", description: "A new bill has been added successfully." });
    }
    handleDialogClose();
  };

  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setIsDialogOpen(true);
  };

  const handleDeleteBill = (id) => {
    saveBills(bills.filter(b => b.id !== id));
    toast({ title: "Bill deleted", description: "The bill has been deleted successfully." });
  };

  const handleToggleStatus = (id, newStatus) => {
    saveBills(bills.map(b => b.id === id ? { ...b, status: newStatus, paidBy: newStatus === 'paid' ? (b.paidBy || currentUser?.name || 'N/A') : '' } : b));
    toast({ title: "Bill status updated", description: `Bill marked as ${newStatus}.` });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingBill(null);
  };

  const sortedBills = [...bills].sort((a, b) => {
    if (a.status === 'paid' && b.status !== 'paid') return 1;
    if (a.status !== 'paid' && b.status === 'paid') return -1;
    return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
  });

  if (!householdId && currentUser?.role !== 'guest') {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="mt-4 text-lg font-semibold">Household Not Set</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Bills require household data. Please log in again or join a household.
          </p>
          <Link to="/login">
            <Button className="mt-4">Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bill Reminders</h1>
          <p className="text-muted-foreground">Track upcoming bills and payments for your household.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 shimmer-button" onClick={() => { setEditingBill(null); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4" /><span>Add Bill</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBill ? 'Edit Bill' : 'Add New Bill'}</DialogTitle>
              <DialogDescription>{editingBill ? 'Update bill details.' : 'Add a new bill to track.'}</DialogDescription>
            </DialogHeader>
            <BillForm bill={editingBill} onSubmit={handleFormSubmit} onCancel={handleDialogClose} />
          </DialogContent>
        </Dialog>
      </div>

      {bills.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
             <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay: 0.2, type: "spring" }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-600 dark:to-emerald-700 mb-4">
                <DollarSign className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="mt-4 text-lg font-semibold">No bills tracked yet!</h3>
            <p className="mt-2 text-sm text-muted-foreground">Add your first bill to stay organized.</p>
            <Button className="mt-6 shimmer-button" onClick={() => { setEditingBill(null); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />Add First Bill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {sortedBills.map((bill, index) => (
              <BillCard key={bill.id} bill={bill} onEdit={handleEditBill} onDelete={handleDeleteBill} onToggleStatus={handleToggleStatus} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Bills;