import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, StickyNote } from 'lucide-react';
import NoteForm from '@/pages/notes/NoteForm';
import NoteCard from '@/pages/notes/NoteCard';
import { Link } from 'react-router-dom';


const Notes = ({ currentUser }) => {
  const [notes, setNotes] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const { toast } = useToast();
  
  const householdId = currentUser?.householdId;

  useEffect(() => {
    if (!householdId) return;
    const savedNotes = JSON.parse(localStorage.getItem(`homeNotes_${householdId}`) || '[]');
    setNotes(savedNotes);
  }, [householdId]);

  const saveNotes = (updatedNotes) => {
    if (!householdId) return;
    localStorage.setItem(`homeNotes_${householdId}`, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  const handleFormSubmit = (noteData) => {
    if (!noteData.title) {
      toast({ variant: "destructive", title: "Error", description: "Note title is required." });
      return;
    }
    
    let finalSharedWith = noteData.sharedWith || [];
    if (currentUser?.role === 'child') {
      finalSharedWith = noteData.sharedWith.filter(r => r === 'family' || r === 'child');
      if (!finalSharedWith.includes('child') && !finalSharedWith.includes('family')) {
         finalSharedWith = ['child']; 
      } else if (finalSharedWith.length === 0) {
         finalSharedWith = ['child']; 
      }
    }


    if (editingNote) {
      const updatedNotes = notes.map(n => n.id === editingNote.id ? { ...editingNote, ...noteData, sharedWith: finalSharedWith } : n);
      saveNotes(updatedNotes);
      toast({ title: "Note updated", description: "The note has been updated successfully." });
    } else {
      const now = new Date();
      saveNotes([...notes, { ...noteData, sharedWith: finalSharedWith, id: Date.now(), createdAt: now.toISOString(), createdBy: currentUser?.name || 'Unknown', createdByRole: currentUser?.role || 'unknown' }]);
      toast({ title: "Note added", description: "A new note has been added successfully." });
    }
    handleDialogClose();
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setIsDialogOpen(true);
  };

  const handleDeleteNote = (id) => {
    const noteToDelete = notes.find(n => n.id === id);
    if (currentUser?.role !== 'family' && noteToDelete?.createdBy !== currentUser?.name) {
      toast({variant: "destructive", title: "Error", description: "You can only delete your own notes."});
      return;
    }
    saveNotes(notes.filter(n => n.id !== id));
    toast({ title: "Note deleted", description: "The note has been deleted successfully." });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingNote(null);
  };
  
  const visibleNotes = notes.filter(note => {
    if (!currentUser) return false;
    if (currentUser.role === 'guest') return false; 
    if (currentUser.role === 'family') return true; 
    return note.sharedWith?.includes(currentUser.role) || note.createdBy === currentUser.name;
  });


  const sortedNotes = [...visibleNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (!householdId && currentUser?.role !== 'guest') {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="mt-4 text-lg font-semibold">Household Not Set</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            It seems your household information is not fully set up. Please try logging out and back in.
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
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">Share important information with your household.</p>
        </div>
        {currentUser?.role !== 'guest' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 shimmer-button" onClick={() => { setEditingNote(null); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4" /><span>Add Note</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
                <DialogDescription>{editingNote ? 'Update note details.' : 'Create a new note.'}</DialogDescription>
              </DialogHeader>
              <NoteForm note={editingNote} onSubmit={handleFormSubmit} onCancel={handleDialogClose} currentUser={currentUser} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {currentUser?.role === 'guest' && (
         <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay: 0.2, type: "spring" }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-300 dark:from-yellow-700 dark:to-amber-700 mb-4">
                <StickyNote className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="mt-4 text-lg font-semibold">Notes are Private</h3>
            <p className="mt-2 text-sm text-muted-foreground">Please log in or create an account to view and share notes.</p>
            <Link to="/login">
              <Button className="mt-6 shimmer-button">Login / Create Account</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {currentUser?.role !== 'guest' && sortedNotes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
             <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay: 0.2, type: "spring" }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-amber-300 dark:from-yellow-700 dark:to-amber-700 mb-4">
                <StickyNote className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="mt-4 text-lg font-semibold">No notes visible to you yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Add your first note or check sharing permissions.</p>
            <Button className="mt-6 shimmer-button" onClick={() => { setEditingNote(null); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />Add Note
            </Button>
          </CardContent>
        </Card>
      )}
      
      {currentUser?.role !== 'guest' && sortedNotes.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {sortedNotes.map((note, index) => (
              <NoteCard key={note.id} note={note} onEdit={handleEditNote} onDelete={handleDeleteNote} index={index} currentUser={currentUser} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Notes;