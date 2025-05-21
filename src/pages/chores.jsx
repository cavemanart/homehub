import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, ListChecks } from 'lucide-react';
import ChoreForm from '@/pages/chores/ChoreForm';
import ChoreCard from '@/pages/chores/ChoreCard';
import { Link } from 'react-router-dom';

const Chores = ({ currentUser }) => {
  const [chores, setChores] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const { toast } = useToast();
  const householdId = currentUser?.householdId;
  const [householdMembers, setHouseholdMembers] = useState([]);

  useEffect(() => {
    if (!householdId) return;
    const savedChores = JSON.parse(localStorage.getItem(`homeChores_${householdId}`) || '[]');
    setChores(savedChores);

    const allUsers = [];
     for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('homeShareUser_') || key === 'homeShareUser') {
            try {
                const user = JSON.parse(localStorage.getItem(key));
                if (user && user.householdId === householdId) {
                    allUsers.push(user);
                }
            } catch (e) {
                console.error("Error parsing user from localStorage for chores members", e);
            }
        }
    }
    setHouseholdMembers(allUsers.map(u => ({id: u.id, name: u.name, role: u.role})));

  }, [householdId]);

  const saveChores = (updatedChores) => {
    if (!householdId) return;
    localStorage.setItem(`homeChores_${householdId}`, JSON.stringify(updatedChores));
    setChores(updatedChores);
  };

  const handleFormSubmit = (choreData) => {
    if (currentUser?.role !== 'family') {
      toast({ variant: "destructive", title: "Access Denied", description: "Only family members can add or edit chores." });
      return;
    }
    if (!choreData.title || !choreData.assignedTo) {
      toast({ variant: "destructive", title: "Error", description: "Chore title and assignee are required." });
      return;
    }
    if (editingChore) {
      saveChores(chores.map(c => c.id === editingChore.id ? { ...editingChore, ...choreData } : c));
      toast({ title: "Chore updated", description: "The chore has been updated." });
    } else {
      saveChores([...chores, { ...choreData, id: Date.now(), completed: false, createdAt: new Date().toISOString() }]);
      toast({ title: "Chore added", description: "A new chore has been added." });
    }
    handleDialogClose();
  };

  const handleEditChore = (chore) => {
    if (currentUser?.role !== 'family') return;
    setEditingChore(chore);
    setIsDialogOpen(true);
  };

  const handleDeleteChore = (id) => {
    if (currentUser?.role !== 'family') {
       toast({ variant: "destructive", title: "Access Denied", description: "Only family members can delete chores." });
      return;
    }
    saveChores(chores.filter(c => c.id !== id));
    toast({ title: "Chore deleted", description: "The chore has been deleted." });
  };

  const handleToggleComplete = (id) => {
    saveChores(chores.map(c => c.id === id ? { ...c, completed: !c.completed, lastCompleted: !c.completed ? new Date().toISOString() : c.lastCompleted } : c));
    const chore = chores.find(c => c.id === id);
    if (chore && !chore.completed && chore.reward) {
      toast({ title: "Chore Done!", description: `Great job! Reward: ${chore.reward}` });
    }
  };
  
  const handleResetChore = (id) => {
    if (currentUser?.role !== 'family') return;
    saveChores(chores.map(c => c.id === id ? { ...c, completed: false } : c));
    toast({ title: "Chore Reset", description: "Chore marked as not completed." });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingChore(null);
  };

  const visibleChores = currentUser?.role === 'family' 
    ? chores 
    : chores.filter(chore => chore.assignedTo === currentUser?.name || chore.assignedTo === 'Anyone');

  const sortedChores = [...visibleChores].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  if (!householdId && currentUser?.role !== 'guest') {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <ListChecks className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="mt-4 text-lg font-semibold">Household Not Set</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Chores require household data. Please log in again or join a household.
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
          <h1 className="text-3xl font-bold tracking-tight">Household Chores</h1>
          <p className="text-muted-foreground">Manage the rotating schedule and rewards.</p>
        </div>
        {currentUser?.role === 'family' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 shimmer-button" onClick={() => { setEditingChore(null); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4" /><span>Add Chore</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingChore ? 'Edit Chore' : 'Add New Chore'}</DialogTitle>
                <DialogDescription>{editingChore ? 'Update chore details.' : 'Add a new chore to the schedule.'}</DialogDescription>
              </DialogHeader>
              <ChoreForm chore={editingChore} onSubmit={handleFormSubmit} onCancel={handleDialogClose} familyMembers={householdMembers} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {sortedChores.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
             <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay: 0.2, type: "spring" }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 dark:from-yellow-600 dark:to-amber-700 mb-4">
                <ListChecks className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="mt-4 text-lg font-semibold">No chores assigned yet!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {currentUser?.role === 'family' ? 'Add the first chore to get the schedule started.' : 'Looks like you have a break! No chores for you right now.'}
            </p>
            {currentUser?.role === 'family' && (
              <Button className="mt-6 shimmer-button" onClick={() => { setEditingChore(null); setIsDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />Add First Chore
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {sortedChores.map((chore, index) => (
              <ChoreCard 
                key={chore.id} 
                chore={chore} 
                onEdit={handleEditChore} 
                onDelete={handleDeleteChore} 
                onToggleComplete={handleToggleComplete}
                onResetChore={handleResetChore}
                index={index}
                currentUserRole={currentUser?.role}
                currentUserName={currentUser?.name}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Chores;