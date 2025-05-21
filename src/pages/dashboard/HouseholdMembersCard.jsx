import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Users, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const HouseholdMembersCard = ({ currentUser, onCopyJoinCode }) => {
  // In a real app, this would come from backend/state based on householdId
  const demoMembers = [
    { name: 'Alice (Family)', role: 'Family Member', initial: 'A' },
    { name: 'Bob (Roommate)', role: 'Roommate', initial: 'B' },
    { name: 'Charlie (Child)', role: 'Child', initial: 'C' },
    { name: 'Diana (Nanny)', role: 'Nanny', initial: 'D' },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Household Members (Demo)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {demoMembers.map(member => (
              <div key={member.name} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
                <Avatar>
                  <AvatarFallback>{member.initial}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        {currentUser?.role === 'family' && (
          <CardFooter className="flex-col items-start gap-2">
            <Button onClick={onCopyJoinCode} className="w-full sm:w-auto">
              <ExternalLink className="mr-2 h-4 w-4" /> Invite New Member
            </Button>
            <p className="text-xs text-muted-foreground">
              Share the join code to add new members to your household.
            </p>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default HouseholdMembersCard;