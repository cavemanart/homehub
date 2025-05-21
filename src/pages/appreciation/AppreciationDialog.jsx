import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';

const AppreciationDialog = ({ isOpen, setIsOpen, newAppreciation, handleInputChange, handleSelectChange, handleAddAppreciation, currentUser, familyMembers }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 shimmer-button">
          <Plus className="h-4 w-4" /><span>Send Appreciation</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Some Kindness</DialogTitle>
          <DialogDescription>Brighten someone's day with a thoughtful message.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Select onValueChange={handleSelectChange} value={newAppreciation.toId || newAppreciation.to}>
              <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
              <SelectContent>
                {familyMembers.map(member => (
                  <SelectItem key={member.id || member.name} value={member.id || member.name}>
                    {member.name} {member.role && member.role !== 'family' ? `(${member.role === 'child' ? 'Child' : member.role})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" name="message" value={newAppreciation.message} onChange={handleInputChange} placeholder="Write your appreciation message..." rows={5} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleAddAppreciation}>Send Message</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AppreciationDialog;