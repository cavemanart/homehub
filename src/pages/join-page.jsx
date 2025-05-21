import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Home, UserPlus } from 'lucide-react';

const JoinPage = ({ joinCode, onLogin, householdData }) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Attempting to join with code:", joinCode, "Household Data:", householdData);
  }, [joinCode, householdData]);

  const handleProceedToLogin = () => {
    navigate('/login', { state: { fromJoinLink: true, householdData: householdData } });
  };
  
  const handleGuestAccess = () => {
    onLogin(null, true); 
    navigate('/');
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="glass-card text-center">
          <CardHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto h-16 w-16 rounded-full bg-primary flex items-center justify-center mb-4"
            >
              <UserPlus className="h-8 w-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-bold">You're Invited!</CardTitle>
            <CardDescription className="text-lg">
              You've been invited to join household: 
              <strong className="block text-primary text-xl mt-1">{householdData?.householdName || `Household ${joinCode}`}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p>
              To accept this invitation, please create an account or log in if you already have one for this household.
            </p>
             <img  alt="Illustration of people collaborating" class="rounded-md mx-auto w-3/4" src="https://images.unsplash.com/photo-1665938225843-f4126f08d303" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleProceedToLogin} className="w-full sm:w-auto">
                Create Account / Login
              </Button>
              <Button size="lg" variant="outline" onClick={handleGuestAccess} className="w-full sm:w-auto">
                <Home className="mr-2 h-5 w-5"/> Explore as Guest
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default JoinPage;