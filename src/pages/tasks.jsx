import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit, Calendar, User, CheckSquare, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TaskForm = ({ task, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    task || { title: '', description: '', dueDate: '', assignedTo: '', priority: 'medium' }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriorityChange = (value) => {
    setFormData(prev => ({ ...prev, priority: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter task title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter task description" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Input id="assignedTo" name="assignedTo" value={formData.assignedTo} onChange={handleInputChange} placeholder="Assignee name" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select value={formData.priority} onValueChange={handlePriorityChange}>
          <SelectTrigger id="priority"><SelectValue placeholder="Select priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{task ? 'Update Task' : 'Add Task'}</Button>
      </DialogFooter>
    </form>
  );
};

const TaskCard = ({ task, onEdit, onDelete, onToggleComplete, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" } }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const priorityStyles = {
    low: 'border-l-4 border-blue-500',
    medium: 'border-l-4 border-yellow-500',
    high: 'border-l-4 border-red-500',
  };

  return (
    <motion.div custom={index} initial="hidden" animate="visible" exit="exit" variants={cardVariants} layout>
      <Card className={`h-full card-hover ${priorityStyles[task.priority]} ${task.completed ? 'opacity-60 bg-muted/50' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className={`text-xl ${task.completed ? 'line-through' : ''}`}>{task.title}</CardTitle>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => onEdit(task)}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <CardDescription className="text-xs">Priority: {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="whitespace-pre-wrap text-sm">{task.description}</p>
          <div className="mt-3 text-xs text-muted-foreground space-y-1">
            {task.dueDate && <p className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Due: {new Date(task.dueDate + 'T00:00:00').toLocaleDateString()}</p>}
            {task.assignedTo && <p className="flex items-center gap-1"><User className="h-3 w-3" /> Assigned to: {task.assignedTo}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant={task.completed ? "secondary" : "default"} size="sm" onClick={() => onToggleComplete(task.id)} className="w-full">
            {task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const Tasks = ({ currentUser }) => {
  const [tasks, setTasks] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { toast } = useToast();
  const householdId = currentUser?.householdId;

  useEffect(() => {
    if (!householdId) return;
    const savedTasks = JSON.parse(localStorage.getItem(`homeTasks_${householdId}`) || '[]');
    setTasks(savedTasks);
  }, [householdId]);

  const saveTasks = (updatedTasks) => {
    if (!householdId) return;
    localStorage.setItem(`homeTasks_${householdId}`, JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const handleFormSubmit = (taskData) => {
    if (!taskData.title) {
      toast({ variant: "destructive", title: "Error", description: "Task title is required." });
      return;
    }
    if (editingTask) {
      saveTasks(tasks.map(t => t.id === editingTask.id ? { ...editingTask, ...taskData } : t));
      toast({ title: "Task updated", description: "The task has been updated successfully." });
    } else {
      saveTasks([...tasks, { ...taskData, id: Date.now(), completed: false, createdAt: new Date().toISOString() }]);
      toast({ title: "Task added", description: "A new task has been added successfully." });
    }
    handleDialogClose();
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = (id) => {
    saveTasks(tasks.filter(t => t.id !== id));
    toast({ title: "Task deleted", description: "The task has been deleted successfully." });
  };

  const handleToggleComplete = (id) => {
    saveTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
  });

  if (!householdId && currentUser?.role !== 'guest') {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="mt-4 text-lg font-semibold">Household Not Set</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Tasks require household data. Please log in again or join a household.
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
          <h1 className="text-3xl font-bold tracking-tight">Shared Tasks</h1>
          <p className="text-muted-foreground">Manage your household responsibilities together.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 shimmer-button" onClick={() => { setEditingTask(null); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4" /><span>Add Task</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
              <DialogDescription>{editingTask ? 'Update task details.' : 'Create a new task for the household.'}</DialogDescription>
            </DialogHeader>
            <TaskForm task={editingTask} onSubmit={handleFormSubmit} onCancel={handleDialogClose} />
          </DialogContent>
        </Dialog>
      </div>

      {tasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay: 0.2, type: "spring" }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary/50 dark:from-primary/60 dark:to-primary/30 mb-4">
                <CheckSquare className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="mt-4 text-lg font-semibold">No tasks yet!</h3>
            <p className="mt-2 text-sm text-muted-foreground">Add your first shared task to get started.</p>
            <Button className="mt-6 shimmer-button" onClick={() => { setEditingTask(null); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />Add First Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {sortedTasks.map((task, index) => (
              <TaskCard key={task.id} task={task} onEdit={handleEditTask} onDelete={handleDeleteTask} onToggleComplete={handleToggleComplete} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Tasks;