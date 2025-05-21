import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, StickyNote, Smile, CheckCircle, XCircle } from 'lucide-react';

const KidsDashboard = ({ currentUser }) => {
  const [stats, setStats] = useState({
    choresTotal: 0,
    choresCompleted: 0,
    notesShared: 0,
  });

  useEffect(() => {
    if (!currentUser || !currentUser.householdId) return;

    const allChores = JSON.parse(localStorage.getItem(`homeChores_${currentUser.householdId}`) || '[]');
    const kidChores = allChores.filter(chore => chore.assignedTo === currentUser?.name);
    
    const allNotes = JSON.parse(localStorage.getItem(`homeNotes_${currentUser.householdId}`) || '[]');
    const kidNotes = allNotes.filter(note => note.sharedWith?.includes('child') || note.createdBy === currentUser?.name);

    setStats({
      choresTotal: kidChores.length,
      choresCompleted: kidChores.filter(c => c.completed).length,
      notesShared: kidNotes.length,
    });
  }, [currentUser]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };
  
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }

  const dashboardCards = [
    {
      title: "My Chores",
      description: `${stats.choresCompleted} of ${stats.choresTotal} done!`,
      icon: <ClipboardList className="h-10 w-10 text-blue-500" />,
      count: stats.choresTotal,
      link: "/chores",
      className: "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700",
      textColor: "text-blue-800 dark:text-blue-200"
    },
    {
      title: "My Notes",
      description: `View shared notes`,
      icon: <StickyNote className="h-10 w-10 text-yellow-500" />,
      count: stats.notesShared,
      link: "/notes",
      className: "bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700",
      textColor: "text-yellow-800 dark:text-yellow-200"
    },
  ];

  return (
    <div className="space-y-8 p-4 md:p-6">
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight gradient-text">
          {greeting()}, {currentUser?.name || 'Kiddo'}! <Smile className="inline-block h-10 w-10 text-yellow-400" />
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Ready for an awesome day? Let's see what's up!
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {dashboardCards.map((card, i) => (
          <motion.div
            key={card.title}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
          >
            <Link to={card.link} className="block h-full">
              <Card className={`h-full card-hover ${card.className} ${card.textColor}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-2xl font-semibold">{card.title}</CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent>
                  <p className="text-md opacity-90">{card.description}</p>
                  <div className="text-4xl font-bold mt-3">{card.count}</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: dashboardCards.length * 0.1 + 0.2, duration: 0.5 }}
      >
        <Card className="bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-700">
            <CardHeader>
                <CardTitle className="text-xl text-green-700 dark:text-green-300 flex items-center">
                    <CheckCircle className="h-6 w-6 mr-2"/> Chores Progress
                </CardTitle>
            </CardHeader>
            <CardContent>
                {stats.choresTotal > 0 ? (
                    <>
                        <p className="text-green-600 dark:text-green-400">
                            You've completed <span className="font-bold">{stats.choresCompleted}</span> out of <span className="font-bold">{stats.choresTotal}</span> chores. Keep up the great work!
                        </p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mt-3">
                            <motion.div 
                                className="bg-green-500 h-4 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${(stats.choresCompleted / Math.max(1,stats.choresTotal)) * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </>
                ) : (
                    <p className="text-muted-foreground">No chores assigned to you yet. Relax for now! <XCircle className="inline-block h-5 w-5 ml-1 text-red-500"/></p>
                )}
            </CardContent>
        </Card>
      </motion.div>
      
       <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <img  alt="Happy child with stars" class="mx-auto w-1/2 md:w-1/4 rounded-lg" src="https://images.unsplash.com/photo-1577036928974-451f829ca1b0" />
        <p className="text-muted-foreground mt-2">Remember to always try your best and have fun!</p>
      </motion.div>

      <style jsx="true">{`
        .gradient-text {
          background: -webkit-linear-gradient(45deg, #6366f1, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default KidsDashboard;