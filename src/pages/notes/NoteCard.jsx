import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Pin, Calendar, Users } from 'lucide-react';

const NoteCard = ({ note, onEdit, onDelete, index, currentUser }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" } }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };
  
  const canEditOrDelete = currentUser?.role === 'family' || (currentUser?.role !== 'guest' && note.createdBy === currentUser?.name);

  return (
    <motion.div custom={index} initial="hidden" animate="visible" exit="exit" variants={cardVariants} layout>
      <Card className={`h-full card-hover ${note.isPinned ? 'border-primary shadow-lg shadow-primary/20' : ''} note-card-dynamic group`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              {note.title}
              {note.isPinned && <Pin className="h-4 w-4 text-primary animate-pulse" />}
            </CardTitle>
            {canEditOrDelete && (
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button variant="ghost" size="icon" onClick={() => onEdit(note)} className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(note.id)} className="h-7 w-7"><Trash2 className="h-4 w-4" /></Button>
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5">
            {note.createdAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(note.createdAt).toLocaleDateString()}
                {note.createdBy && ` • By: ${note.createdBy}`}
              </div>
            )}
            {note.sharedWith && note.sharedWith.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Shared with: {note.sharedWith.map(r => r.charAt(0).toUpperCase() + r.slice(1)).join(', ')}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{note.content}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NoteCard;