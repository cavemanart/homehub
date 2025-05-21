import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Trash2, Edit, CalendarCheck, Target, CheckCircle, Award, Sparkles } from 'lucide-react';
import { format, startOfWeek, endOfWeek, subWeeks, isWithinInterval } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // Added Dialog imports
import { Link } from 'react-router-dom';

const WeeklySync = ({ currentUser }) => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({ text: '', type: 'weekly' }); 
  const [editingGoal, setEditingGoal] = useState(null);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [accomplishments, setAccomplishments] = useState([]);
  const { toast } = useToast();
  const householdId = currentUser?.householdId;

  useEffect(() => {
    if (!householdId) return;

    const savedGoals = JSON.parse(localStorage.getItem(`homeGoals_${householdId}`) || '[]');
    setGoals(savedGoals);

    const chores = JSON.parse(localStorage.getItem(`homeChores_${householdId}`) || '[]');
    const appreciations = JSON.parse(localStorage.getItem(`homeAppreciation_${householdId}`) || '[]');
    
    const today = new Date();
    const lastWeekStart = startOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subWeeks(today, 1), { weekStartsOn: 1 });

    const recentChores = chores.filter(c => 
      c.completed && c.lastCompleted && isWithinInterval(new Date(c.lastCompleted), { start: lastWeekStart, end: lastWeekEnd })
    );
    const recentAppreciations = appreciations.filter(a => 
      a.createdAt && isWithinInterval(new Date(a.createdAt), { start: lastWeekStart, end: lastWeekEnd })
    );
    
    setAccomplishments([
      ...recentChores.map(c => ({ type: 'chore', text: `${c.title} (by ${c.assignedTo})`, date: c.lastCompleted, icon: <CheckCircle className="h-4 w-4 text-green-500" /> })),
      ...recentAppreciations.map(a => ({ type: 'appreciation', text: `To ${a.to} from ${a.from}: "${a.message.substring(0,30)}..."`, date: a.createdAt, icon: <Award className="h-4 w-4 text-yellow-500" /> }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)));

  }, [householdId]);

  const saveGoals = (updatedGoals) => {
    if (!householdId) return;
    localStorage.setItem(`homeGoals_${householdId}`, JSON.stringify(updatedGoals));
    setGoals(updatedGoals);
  };

  const handleGoalInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGoalTypeChange = (type) => {
     setNewGoal(prev => ({...prev, type}));
  };

  const handleAddGoal = () => {
    if (!newGoal.text.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Goal cannot be empty." });
      return;
    }
    if (editingGoal) {
      saveGoals(goals.map(g => g.id === editingGoal.id ? { ...editingGoal, ...newGoal } : g));
      toast({ title: "Goal Updated", description: "The goal has been successfully updated." });
    } else {
      saveGoals([...goals, { ...newGoal, id: Date.now(), addedBy: currentUser?.name, createdAt: new Date().toISOString() }]);
      toast({ title: "Goal Added", description: "New goal set for the household!" });
    }
    setNewGoal({ text: '', type: 'weekly' });
    setEditingGoal(null);
    setIsGoalDialogOpen(false);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setNewGoal({ text: goal.text, type: goal.type });
    setIsGoalDialogOpen(true);
  };

  const handleDeleteGoal = (id) => {
    saveGoals(goals.filter(g => g.id !== id));
    toast({ title: "Goal Removed", description: "The goal has been removed." });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
  };

  if (!householdId && currentUser?.role !== 'guest') {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <CalendarCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="mt-4 text-lg font-semibold">Household Not Set</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Weekly Sync requires household data. Please log in again or join a household.
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
        <h1 className="text-4xl font-bold tracking-tight gradient-text-sync">Weekly Sync & Goals</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Review accomplishments and set new aspirations for your household.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div initial="hidden" animate="visible" variants={cardVariants} custom={1}>
          <Card className="h-full shadow-xl border-purple-300 dark:border-purple-700">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Sparkles className="h-6 w-6" /> Last Week's Highlights
              </CardTitle>
              <CardDescription>Celebrating our collective efforts and achievements!</CardDescription>
            </CardHeader>
            <CardContent>
              {accomplishments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No specific accomplishments logged from last week. Let's make this week great!</p>
              ) : (
                <ul className="space-y-3">
                  {accomplishments.slice(0, 5).map((acc, index) => ( 
                    <motion.li 
                      key={index} 
                      className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      {acc.icon}
                      <div>
                        <p className="font-medium text-sm text-purple-800 dark:text-purple-200">{acc.text}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(acc.date), "MMM dd, yyyy")}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={cardVariants} custom={2}>
          <Card className="h-full shadow-xl border-green-300 dark:border-green-700">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Target className="h-6 w-6" /> Household Goals
                </CardTitle>
                <CardDescription>Define and track your collective aspirations.</CardDescription>
              </div>
              <Button onClick={() => setIsGoalDialogOpen(true)} size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-1 h-4 w-4" /> Add Goal
              </Button>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No goals set yet. Let's aim high!</p>
              ) : (
                <ul className="space-y-3">
                  {goals.map((goal, index) => (
                    <motion.li 
                      key={goal.id} 
                      className="flex items-start justify-between gap-3 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      <div>
                        <p className={`font-medium text-sm ${goal.type === 'monthly' ? 'text-blue-600 dark:text-blue-400' : 'text-green-800 dark:text-green-200'}`}>{goal.text}</p>
                        <p className="text-xs text-muted-foreground">
                          {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)} Goal by {goal.addedBy || 'Family'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditGoal(goal)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDeleteGoal(goal.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Set New Household Goal'}</DialogTitle>
            <DialogDescription>What does your family want to achieve together?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goalText">Goal Description</Label>
              <Textarea id="goalText" name="text" value={newGoal.text} onChange={handleGoalInputChange} placeholder="e.g., Read 3 books together, Save $50 for a family outing" />
            </div>
            <div className="space-y-2">
              <Label>Goal Type</Label>
              <div className="flex gap-2">
                <Button variant={newGoal.type === 'weekly' ? 'default' : 'outline'} onClick={() => handleGoalTypeChange('weekly')}>Weekly</Button>
                <Button variant={newGoal.type === 'monthly' ? 'default' : 'outline'} onClick={() => handleGoalTypeChange('monthly')}>Monthly</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsGoalDialogOpen(false); setEditingGoal(null); setNewGoal({ text: '', type: 'weekly'}); }}>Cancel</Button>
            <Button onClick={handleAddGoal}>{editingGoal ? 'Update Goal' : 'Add Goal'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <style jsx="true">{`
        .gradient-text-sync {
          background: -webkit-linear-gradient(45deg, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default WeeklySync;