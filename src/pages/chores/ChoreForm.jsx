import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ChoreForm = ({ chore, onSubmit, onCancel, familyMembers }) => {
  const [formData, setFormData] = useState(
    chore || { title: '', description: '', assignedTo: '', frequency: 'weekly', reward: '', lastCompleted: null }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Chore Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g., Take out trash" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="e.g., All bins, Monday morning" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Select value={formData.assignedTo} onValueChange={(value) => handleSelectChange('assignedTo', value)}>
            <SelectTrigger id="assignedTo"><SelectValue placeholder="Select member" /></SelectTrigger>
            <SelectContent>
              {familyMembers.map(member => <SelectItem key={member.id || member.name} value={member.name}>{member.name}</SelectItem>)}
              <SelectItem value="Anyone">Anyone</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={formData.frequency} onValueChange={(value) => handleSelectChange('frequency', value)}>
            <SelectTrigger id="frequency"><SelectValue placeholder="Select frequency" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="as-needed">As Needed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reward">Reward (optional)</Label>
        <Input id="reward" name="reward" value={formData.reward} onChange={handleInputChange} placeholder="e.g., Extra screen time, $5" />
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{chore ? 'Update Chore' : 'Add Chore'}</Button>
      </DialogFooter>
    </form>
  );
};

export default ChoreForm;