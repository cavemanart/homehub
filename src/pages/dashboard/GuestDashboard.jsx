import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';

const GuestDashboard = ({ onCopyJoinCode }) => {
  return (
    <div className="space-y-6 text-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold tracking-tight">Welcome to HomeShare!</h1>
        <p className="text-xl text-muted-foreground mt-2">
          A simple way to manage your shared home.
        </p>
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <Card className="max-w-lg mx-auto mt-8 glass-card">
          <CardHeader>
            <CardTitle className="text-2xl">You are browsing as a Guest</CardTitle>
            <CardDescription>To access all features and save your data, please log in or create an account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <img  alt="Happy family using a tablet" class="rounded-md mx-auto" src="https://images.unsplash.com/photo-1546179063-13beae6993e0" />
            <p>HomeShare helps you organize tasks, notes, bills, and more with your household members.</p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">Login or Create Account</Button>
            </Link>
            <Button size="lg" variant="outline" onClick={onCopyJoinCode} className="w-full sm:w-auto">
              <UserPlus className="mr-2 h-5 w-5" /> Received a Join Code?
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default GuestDashboard;