import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit, Brain, User, Users, Calendar, Check, AlertCircle, Info } from 'lucide-react';
import { format, differenceInDays, parseISO, isPast } from 'date-fns';
import { Link } from 'react-router-dom';

const MentalLoad = ({ currentUser }) => {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    status: 'todo', 
    category: 'household', 
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [familyMembers, setFamilyMembers] = useState(['Partner 1', 'Partner 2', 'Both']); 
  const { toast } = useToast();
  const householdId = currentUser?.householdId;

  useEffect(() => {
    if (!householdId) return;
    const savedItems = JSON.parse(localStorage.getItem(`homeMentalLoad_${householdId}`) || '[]');
    setItems(savedItems);
  }, [householdId]);

  const saveItems = (updatedItems) => {
    if (!householdId) return;
    localStorage.setItem(`homeMentalLoad_${householdId}`, JSON.stringify(updatedItems));
    setItems(updatedItems);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitItem = () => {
    if (!newItem.title.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Item title is required." });
      return;
    }
    const itemData = {
      ...newItem,
      id: editingItem ? editingItem.id : Date.now(),
      lastUpdated: new Date().toISOString(),
      addedBy: editingItem ? editingItem.addedBy : currentUser?.name || 'Unknown',
    };

    if (editingItem) {
      saveItems(items.map(item => item.id === editingItem.id ? itemData : item));
      toast({ title: "Item Updated", description: "Mental load item has been updated." });
    } else {
      saveItems([...items, itemData]);
      toast({ title: "Item Added", description: "New mental load item tracked." });
    }
    setNewItem({ title: '', description: '', assignedTo: '', dueDate: '', status: 'todo', category: 'household' });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({ ...item });
    setIsDialogOpen(true);
  };

  const handleDeleteItem = (id) => {
    saveItems(items.filter(item => item.id !== id));
    toast({ title: "Item Removed", description: "Mental load item has been removed." });
  };

  const handleStatusChange = (id, newStatus) => {
    saveItems(items.map(item => item.id === id ? { ...item, status: newStatus, lastUpdated: new Date().toISOString() } : item));
    toast({ title: "Status Updated", description: `Item marked as ${newStatus}.` });
  };
  
  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date(); today.setHours(0,0,0,0);
    const itemDueDate = parseISO(dueDate);
    const daysDiff = differenceInDays(itemDueDate, today);

    if (daysDiff < 0) return { text: `Overdue`, color: 'text-red-500', icon: <AlertCircle className="h-4 w-4 mr-1" /> };
    if (daysDiff === 0) return { text: `Due today`, color: 'text-orange-500', icon: <AlertCircle className="h-4 w-4 mr-1" /> };
    if (daysDiff <= 3) return { text: `Due in ${daysDiff} day(s)`, color: 'text-yellow-500', icon: <Info className="h-4 w-4 mr-1" /> };
    return null; 
  };


  const itemCategories = {
    household: "Household",
    kids: "Children",
    finances: "Finances",
    work: "Work/Appointments",
    personal: "Personal/Other"
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: (i) => ({ opacity: 1, scale: 1, transition: { delay: i * 0.05 } }),
    exit: { opacity: 0, scale: 0.95 },
  };

  if (!householdId && currentUser?.role !== 'guest') {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="mt-4 text-lg font-semibold">Household Not Set</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Mental Load requires household data. Please log in again or join a household.
          </p>
          <Link to="/login">
            <Button className="mt-4">Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
       <motion.div initial="hidden" animate="visible" variants={cardVariants} className="text-center">
        <h1 className="text-4xl font-bold tracking-tight gradient-text-mental-load">Shared Mental Load</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Visualize, delegate, and conquer the invisible work together.
        </p>
      </motion.div>
      
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)} className="shimmer-button-subtle">
          <Plus className="mr-2 h-4 w-4" /> Add Mental Load Item
        </Button>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed py-12 text-center">
          <CardContent>
            <Brain className="h-16 w-16 mx-auto text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold">Lighten the Load, Together</h3>
            <p className="text-muted-foreground mt-2">Start by adding tasks, thoughts, or responsibilities you're juggling.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {items.sort((a,b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)).map((item, index) => {
              const dueDateInfo = getDueDateStatus(item.dueDate);
              return (
              <motion.div key={item.id} custom={index} initial="hidden" animate="visible" exit="exit" variants={cardVariants} layout>
                <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 ${item.status === 'done' ? 'bg-green-50 dark:bg-green-900/20 opacity-70' : 'bg-card'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className={`text-xl ${item.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{item.title}</CardTitle>
                      <Select value={item.status} onValueChange={(value) => handleStatusChange(item.id, value)}>
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue placeholder="Set status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="inProgress">In Progress</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <CardDescription className="text-xs">Category: {itemCategories[item.category] || item.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                    <div className="text-xs space-y-1">
                      {item.assignedTo && <p className="flex items-center"><User className="h-3 w-3 mr-1.5 text-muted-foreground" /> Assigned to: {item.assignedTo}</p>}
                      {item.dueDate && (
                        <p className={`flex items-center ${dueDateInfo?.color || ''}`}>
                           {dueDateInfo?.icon}
                           <Calendar className="h-3 w-3 mr-1.5 text-muted-foreground" /> Due: {format(parseISO(item.dueDate), "MMM dd, yyyy")} {dueDateInfo?.text && `(${dueDateInfo.text})`}
                        </p>
                      )}
                      <p className="flex items-center"><Users className="h-3 w-3 mr-1.5 text-muted-foreground" /> Added by: {item.addedBy}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )})}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Mental Load Item' : 'Add New Mental Load Item'}</DialogTitle>
            <DialogDescription>Track thoughts, tasks, and responsibilities.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title*</Label>
              <Input id="title" name="title" value={newItem.title} onChange={handleInputChange} className="col-span-3" placeholder="e.g., Plan birthday party" />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">Description</Label>
              <Textarea id="description" name="description" value={newItem.description} onChange={handleInputChange} className="col-span-3" placeholder="Details, steps, notes..." />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select value={newItem.category} onValueChange={(value) => handleSelectChange('category', value)}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(itemCategories).map(([key, value]) => (
                     <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignedTo" className="text-right">Assigned To</Label>
              <Select value={newItem.assignedTo} onValueChange={(value) => handleSelectChange('assignedTo', value)}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select assignee" /></SelectTrigger>
                <SelectContent>
                  {familyMembers.map(member => <SelectItem key={member} value={member}>{member}</SelectItem>)}
                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">Due Date</Label>
              <Input id="dueDate" name="dueDate" type="date" value={newItem.dueDate} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select value={newItem.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="inProgress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditingItem(null); setNewItem({ title: '', description: '', assignedTo: '', dueDate: '', status: 'todo', category: 'household' }); }}>Cancel</Button>
            <Button onClick={handleSubmitItem}>{editingItem ? 'Update Item' : 'Add Item'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <style jsx="true">{`
        .gradient-text-mental-load {
          background: -webkit-linear-gradient(45deg, #3b82f6, #14b8a6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .shimmer-button-subtle {
          position: relative;
          overflow: hidden;
        }
        .shimmer-button-subtle::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            120deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: all 0.6s;
        }
        .shimmer-button-subtle:hover::before {
          left: 100%;
        }
      `}</style>
    </div>
  );
};

export default MentalLoad;