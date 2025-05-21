import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Heart } from 'lucide-react';
import AppreciationCard from '@/pages/appreciation/AppreciationCard';
import AppreciationDialog from '@/pages/appreciation/AppreciationDialog';
import { Link } from 'react-router-dom';

const Appreciation = ({ currentUser }) => {
  const [appreciations, setAppreciations] = useState([]);
  const [newAppreciation, setNewAppreciation] = useState({ to: '', message: '' });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const householdId = currentUser?.householdId;

  const [householdMembers, setHouseholdMembers] = useState([]);

  useEffect(() => {
    if (!householdId) return;
    const savedAppreciations = JSON.parse(localStorage.getItem(`homeAppreciation_${householdId}`) || '[]');
    setAppreciations(savedAppreciations);

    const allUsers = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('homeShareUser_') || key === 'homeShareUser') { // Include single user key too
            try {
                const user = JSON.parse(localStorage.getItem(key));
                if (user && user.householdId === householdId) {
                    allUsers.push(user);
                }
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
            }
        }
    }
    
    const memberNames = allUsers
        .filter(user => user.id !== currentUser.id) 
        .map(user => ({ id: user.id, name: user.name, role: user.role }));

    const defaultFamilyRoles = [
        { id: 'mom', name: 'Mom', role: 'family' },
        { id: 'dad', name: 'Dad', role: 'family' },
        { id: 'grandparents', name: 'Grandparents', role: 'family' }
    ];
    
    const uniqueMembers = [...defaultFamilyRoles, ...memberNames.filter(m => !defaultFamilyRoles.find(df => df.name.toLowerCase() === m.name.toLowerCase()))];
    setHouseholdMembers(uniqueMembers);

  }, [householdId, currentUser]);

  const saveAppreciations = (updatedAppreciations) => {
    if (!householdId) return;
    localStorage.setItem(`homeAppreciation_${householdId}`, JSON.stringify(updatedAppreciations));
    setAppreciations(updatedAppreciations);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAppreciation({ ...newAppreciation, [name]: value });
  };
  
  const handleSelectChange = (value) => {
    const selectedMember = householdMembers.find(m => m.id === value || m.name === value);
    setNewAppreciation({ ...newAppreciation, to: selectedMember.name, toId: selectedMember.id });
  };

  const handleAddAppreciation = () => {
    if (!newAppreciation.to || !newAppreciation.message) {
      toast({ variant: "destructive", title: "Error", description: "Please select recipient and write a message." });
      return;
    }

    let fromName = currentUser?.name;
    if (currentUser?.role === 'family') {
        const recipient = householdMembers.find(m => m.id === newAppreciation.toId || m.name === newAppreciation.to);
        if (recipient?.role === 'child') {
            if (currentUser.name.toLowerCase().includes('mom')) fromName = 'Mom';
            else if (currentUser.name.toLowerCase().includes('dad')) fromName = 'Dad';
        }
    }


    const now = new Date();
    const appreciationData = { 
      ...newAppreciation, 
      id: Date.now(),
      createdAt: now.toISOString(),
      from: fromName,
      fromId: currentUser?.id,
      fromRole: currentUser?.role,
      hearts: [],
      replies: []
    };
    saveAppreciations([...appreciations, appreciationData]);
    toast({ title: "Appreciation sent!", description: "Your kind words have been shared." });
    setNewAppreciation({ to: '', message: '' });
    setIsDialogOpen(false);
  };

  const handleDeleteAppreciation = (id) => {
    const appreciationToDelete = appreciations.find(app => app.id === id);
    if (currentUser?.role !== 'family' && appreciationToDelete?.fromId !== currentUser?.id) {
      toast({ variant: "destructive", title: "Cannot Delete", description: "You can only delete appreciations you sent." });
      return;
    }
    saveAppreciations(appreciations.filter(app => app.id !== id));
    toast({ title: "Message deleted", description: "The appreciation message has been deleted." });
  };

  const handleHeart = (id) => {
    if (currentUser?.role === 'child') {
      toast({ variant: "destructive", title: "Oops!", description: "Only grown-ups can give hearts." });
      return;
    }
    const updatedAppreciations = appreciations.map(app => {
      if (app.id === id) {
        const hasHearted = app.hearts?.includes(currentUser?.id);
        return {
          ...app,
          hearts: hasHearted 
            ? app.hearts.filter(userId => userId !== currentUser?.id)
            : [...(app.hearts || []), currentUser?.id]
        };
      }
      return app;
    });
    saveAppreciations(updatedAppreciations);
  };

  const handleReply = (id) => {
    if (currentUser?.role === 'child') {
       toast({ variant: "destructive", title: "Oops!", description: "Only grown-ups can reply to messages." });
      return;
    }
    if (!replyMessage.trim()) {
      toast({ variant: "destructive", title: "Cannot Reply", description: "Reply message cannot be empty."});
      return;
    }
    const updatedAppreciations = appreciations.map(app => {
      if (app.id === id) {
        return {
          ...app,
          replies: [...(app.replies || []), { from: currentUser?.name, fromId: currentUser?.id, message: replyMessage, createdAt: new Date().toISOString() }]
        };
      }
      return app;
    });
    saveAppreciations(updatedAppreciations);
    setReplyMessage('');
    setReplyingTo(null);
    toast({ title: "Reply Sent!", description: "Your reply has been added."});
  };
  
  const isRecipient = (app) => {
    if (app.toId === currentUser?.id) return true;
    if (currentUser?.role === 'family' && (app.to === 'Mom' || app.to === 'Dad' || app.to === 'Grandparents' || app.to === 'Family')) return true;
    return app.to === currentUser?.name;
  };

  const visibleAppreciations = appreciations.filter(app => {
    if (!currentUser) return false;
    if (app.fromId === currentUser.id) return true;
    if (isRecipient(app)) return true;
    return false;
  });

  const sortedAppreciations = [...visibleAppreciations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!householdId && currentUser?.role !== 'guest') {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
          <h1 className="text-3xl font-bold tracking-tight">Appreciation Wall</h1>
          <p className="text-muted-foreground">Share kindness and gratitude with your household.</p>
        </div>
        <AppreciationDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          newAppreciation={newAppreciation}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          handleAddAppreciation={handleAddAppreciation}
          currentUser={currentUser}
          familyMembers={householdMembers}
        />
      </div>

      {sortedAppreciations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
             <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay: 0.2, type: "spring" }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-300 to-rose-300 dark:from-pink-700 dark:to-rose-700 mb-4">
                <Heart className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="mt-4 text-lg font-semibold">The Wall is Empty... For Now!</h3>
            <p className="mt-2 text-sm text-muted-foreground">Be the first to share some kindness and appreciation.</p>
            <Button className="mt-6 shimmer-button" onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Send First Appreciation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {sortedAppreciations.map((app, index) => (
              <AppreciationCard
                key={app.id}
                app={app}
                index={index}
                currentUser={currentUser}
                familyMembers={householdMembers}
                onHeart={handleHeart}
                onDelete={handleDeleteAppreciation}
                onReply={handleReply}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyMessage={replyMessage}
                setReplyMessage={setReplyMessage}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Appreciation;