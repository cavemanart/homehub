import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { UserCircle } from 'lucide-react';

const Profile = ({ currentUser, updateUser }) => {
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setAbout(currentUser.about || '');
      setAvatarUrl(currentUser.avatar_url || '');
    }
  }, [currentUser]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.id) {
      toast({ variant: "destructive", title: "Error", description: "User not found." });
      return;
    }
    setIsLoading(true);

    try {
      const updates = {
        id: currentUser.id,
        name,
        about,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      
      updateUser({ name, about, avatar_url: avatarUrl }); 
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-6"
    >
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex items-center space-x-4">
            {avatarUrl ? (
              <img-replace src={avatarUrl} alt={name} className="h-20 w-20 rounded-full object-cover border-2 border-primary" />
            ) : (
              <UserCircle className="h-20 w-20 text-muted-foreground" />
            )}
            <div>
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                {currentUser?.name || 'Your Profile'}
              </CardTitle>
              <CardDescription>Update your personal information and preferences.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-medium">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-lg font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentUser?.email || ''}
                disabled
                className="text-base bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="about" className="text-lg font-medium">About Me</Label>
              <Textarea
                id="about"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us a little about yourself..."
                className="min-h-[100px] text-base"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="avatarUrl" className="text-lg font-medium">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/your-avatar.png"
                className="text-base"
              />
            </div>
            <Button type="submit" className="w-full text-lg py-3" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Your information is securely managed.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default Profile;