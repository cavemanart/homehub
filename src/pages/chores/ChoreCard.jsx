import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, CheckCircle, Award, RotateCcw, ShieldCheck } from 'lucide-react';

const ChoreCard = ({ chore, onEdit, onDelete, onToggleComplete, onResetChore, index, currentUserRole, currentUserName }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" } }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const canEditOrDelete = currentUserRole === 'family';
  const canComplete = currentUserRole === 'family' || chore.assignedTo === currentUserName || chore.assignedTo === 'Anyone';


  return (
    <motion.div custom={index} initial="hidden" animate="visible" exit="exit" variants={cardVariants} layout>
      <Card className={`h-full card-hover ${chore.completed ? 'bg-green-50 dark:bg-green-900/30 opacity-80' : 'bg-card'}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className={`text-xl ${chore.completed ? 'line-through text-green-700 dark:text-green-400' : ''}`}>{chore.title}</CardTitle>
            {canEditOrDelete && (
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(chore)} className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(chore.id)} className="h-7 w-7"><Trash2 className="h-4 w-4" /></Button>
              </div>
            )}
          </div>
          <CardDescription className="text-xs">Assigned to: {chore.assignedTo} • Frequency: {chore.frequency}</CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          {chore.description && <p className="whitespace-pre-wrap text-sm mb-2">{chore.description}</p>}
          {chore.reward && <p className="text-sm flex items-center gap-1"><Award className="h-4 w-4 text-yellow-500" /> Reward: {chore.reward}</p>}
          {chore.lastCompleted && <p className="text-xs text-muted-foreground mt-1">Last done: {new Date(chore.lastCompleted).toLocaleDateString()}</p>}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          {canComplete && (
            <Button 
              variant={chore.completed ? "secondary" : "default"} 
              size="sm" 
              onClick={() => onToggleComplete(chore.id)} 
              className="w-full sm:flex-grow"
            >
              {chore.completed ? <ShieldCheck className="mr-2 h-4 w-4"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
              {chore.completed ? 'Completed!' : 'Mark as Done'}
            </Button>
          )}
          {canEditOrDelete && chore.completed && (
            <Button variant="outline" size="sm" onClick={() => onResetChore(chore.id)} className="w-full sm:w-auto">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ChoreCard;