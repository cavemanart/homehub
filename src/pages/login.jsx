import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const Login = ({ onLogin }) => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'family',
    name: '',
    householdId: location.state?.householdData?.householdId || null,
    about: '',
  });
  const [isSignup, setIsSignup] = useState(location.state?.fromJoinLink || false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!formData.email || !formData.password) {
       toast({ variant: "destructive", title: "Missing fields", description: "Please enter email and password." });
       setIsLoading(false);
       return;
    }
    if (isSignup && !formData.name) {
       toast({ variant: "destructive", title: "Signup failed", description: "Please enter your name." });
       setIsLoading(false);
       return;
    }

    const userData = {
      name: formData.name || formData.email.split('@')[0],
      email: formData.email,
      password: formData.password, 
      role: formData.role,
      householdId: formData.householdId, 
      about: formData.about || '',
    };

    await onLogin(userData, false, location.state?.householdData, isSignup);
    
    setIsLoading(false);
  };

  const handleGuestLogin = () => {
    onLogin(null, true); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Hublie</CardTitle>
            <CardDescription className="text-center">
              {location.state?.fromJoinLink 
                ? `Joining Household: ${location.state.householdData?.householdName || 'New Household'}. Create your account.`
                : isSignup ? 'Create an account for your new household' : 'Sign in to your household dashboard'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" type="text" placeholder="Your Name" value={formData.name} onChange={handleChange} required={isSignup} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="name@example.com" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">I am a...</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger id="role"><SelectValue placeholder="Select your role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family Member</SelectItem>
                    <SelectItem value="roommate">Roommate</SelectItem>
                    <SelectItem value="nanny">Nanny</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (isSignup ? 'Creating Account...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Sign In')}
              </Button>
            </form>
            
            {!location.state?.fromJoinLink && (
              <div className="mt-4 text-center">
                <Button variant="link" onClick={() => setIsSignup(!isSignup)}>
                  {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Create One"}
                </Button>
              </div>
            )}

            <div className="mt-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={handleGuestLogin} disabled={isLoading}>
                Continue as Guest
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;