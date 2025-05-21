
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { CheckSquare, StickyNote, Heart, Baby, DollarSign, ListChecks, LogOut } from 'lucide-react';
import DashboardCard from '@/pages/dashboard/DashboardCard';
import GuestDashboard from '@/pages/dashboard/GuestDashboard';
import ActivitySummaryCard from '@/pages/dashboard/ActivitySummaryCard';
import HouseholdMembersCard from '@/pages/dashboard/HouseholdMembersCard';
// import { Link } from 'react-router-dom'; // Link removed as it's not used for the logout button
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


const Dashboard = ({ currentUser, onLogout }) => {
  const [stats, setStats] = useState({
    tasks: 0,
    notes: 0,
    appreciation: 0,
    nannyInfo: 0,
    bills: 0,
    chores: 0,
  });
  const { toast } = useToast();
  const householdId = currentUser?.household_id; // Updated to match profile data from Supabase

  useEffect(() => {
    // console.log("Dashboard currentUser:", currentUser);
    // console.log("Dashboard householdId:", householdId);
    if (!householdId || currentUser?.role === 'guest') return;
    
    // Placeholder for fetching actual data from Supabase later
    const tasks = JSON.parse(localStorage.getItem(`homeTasks_${householdId}`) || '[]');
    const notes = JSON.parse(localStorage.getItem(`homeNotes_${householdId}`) || '[]');
    const appreciation = JSON.parse(localStorage.getItem(`homeAppreciation_${householdId}`) || '[]');
    const nannyInfo = JSON.parse(localStorage.getItem(`homeNannyInfo_${householdId}`) || '[]');
    const bills = JSON.parse(localStorage.getItem(`homeBills_${householdId}`) || '[]');
    const chores = JSON.parse(localStorage.getItem(`homeChores_${householdId}`) || '[]');
    
    setStats({
      tasks: tasks.length,
      notes: notes.filter(note => {
        if (currentUser?.role === 'family') return true;
        return note.sharedWith?.includes(currentUser?.role) || note.createdBy === currentUser?.name;
      }).length,
      appreciation: appreciation.filter(app => {
         if (app.fromId === currentUser.id) return true;
         if (currentUser.role === 'family' && ['Mom', 'Dad', 'Grandma', 'Grandpa', 'Family'].includes(app.to)) return true;
         return app.to === currentUser.name;
      }).length,
      nannyInfo: nannyInfo.length,
      bills: bills.length,
      chores: chores.filter(chore => chore.assignedTo === currentUser?.name || currentUser?.role === 'family').length,
    });
  }, [currentUser, householdId]);

  const allCardsConfig = [
    { title: "Tasks", description: "Manage household responsibilities", icon: <CheckSquare className="h-8 w-8" />, link: "/tasks", className: "task-card", roles: ['family', 'roommate'], statKey: 'tasks' },
    { title: "Notes", description: "Share important information", icon: <StickyNote className="h-8 w-8" />, link: "/notes", className: "notes-card", roles: ['family', 'roommate', 'nanny', 'child'], statKey: 'notes' },
    { title: "Appreciation", description: "Show gratitude to family members", icon: <Heart className="h-8 w-8" />, link: "/appreciation", className: "appreciation-card", roles: ['family', 'child'], statKey: 'appreciation' },
    { title: "Nanny Mode", description: "Essential information for childcare", icon: <Baby className="h-8 w-8" />, link: "/nanny-mode", className: "nanny-card", roles: ['family', 'nanny'], statKey: 'nannyInfo' },
    { title: "Bills", description: "Track upcoming payments", icon: <DollarSign className="h-8 w-8" />, link: "/bills", className: "bg-green-500", roles: ['family', 'roommate'], statKey: 'bills' },
    { title: "Chores", description: "Rotating schedule & rewards", icon: <ListChecks className="h-8 w-8" />, link: "/chores", className: "bg-yellow-500", roles: ['family', 'child'], statKey: 'chores' }
  ];

  const visibleCards = allCardsConfig
    .filter(card => card.roles.includes(currentUser?.role || 'guest'))
    .map(card => ({ ...card, count: stats[card.statKey] }));


  const currentTime = new Date();
  const hours = currentTime.getHours();
  let greeting = "Good morning";
  if (hours >= 12 && hours < 17) greeting = "Good afternoon";
  else if (hours >= 17) greeting = "Good evening";

  const handleCopyJoinCode = () => {
    const householdIdForCode = currentUser?.household_id || "DEMOJOIN123"; // Updated to household_id
    const joinCode = householdIdForCode.split('-').pop().substring(0,8).toUpperCase();
    navigator.clipboard.writeText(`${window.location.origin}/join/${joinCode}`)
      .then(() => {
        toast({
          title: "Household Join Link Copied!",
          description: `Share this link (or code: ${joinCode}) for household: ${currentUser?.household_id ? currentUser.household_id.substring(0,8) : 'Demo Household'}.`,
        });
      })
      .catch(err => toast({ variant: "destructive", title: "Failed to copy", description: "Could not copy the join link." }));
  };

  if (currentUser?.role === 'guest') {
    return <GuestDashboard onCopyJoinCode={handleCopyJoinCode} />;
  }
  
  if (!householdId && currentUser?.role !== 'guest') {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="mt-4 text-lg font-semibold">Household Not Set</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your household information isn't fully loaded yet. This can happen right after confirming your email.
            If this persists, please try logging out and back in.
          </p>
          <Button className="mt-4" onClick={onLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold tracking-tight">{greeting}, {currentUser?.name || 'User'}!</h1>
        <p className="text-muted-foreground">
          Here's what's happening in your home today. Your role: {currentUser?.role === 'child' ? 'Child' : currentUser?.role}
        </p>
        <p className="text-xs text-muted-foreground">Household ID: {householdId?.substring(0,8)}</p>
      </motion.div>

      <div className={`grid gap-4 md:grid-cols-2 ${visibleCards.length > 2 ? 'lg:grid-cols-3' : ''} ${visibleCards.length > 3 ? 'xl:grid-cols-4' : ''}`}>
        {visibleCards.map((card, i) => (
          <DashboardCard key={card.title} card={card} index={i} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ActivitySummaryCard stats={stats} visibleCards={visibleCards} currentUser={currentUser} />
        <HouseholdMembersCard currentUser={currentUser} onCopyJoinCode={handleCopyJoinCode} />
      </div>
    </div>
  );
};

export default Dashboard;
