import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { Pin } from 'lucide-react';

const NoteForm = ({ note, onSubmit, onCancel, currentUser }) => {
  const [formData, setFormData] = useState(
    note || { title: '', content: '', isPinned: false, sharedWith: ['family'] }
  );

  const availableShareRoles = ['family', 'nanny', 'child', 'roommate'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleShareChange = (role) => {
    setFormData(prev => {
      const currentSharedWith = prev.sharedWith || [];
      if (currentSharedWith.includes(role)) {
        return { ...prev, sharedWith: currentSharedWith.filter(r => r !== role) };
      } else {
        return { ...prev, sharedWith: [...currentSharedWith, role] };
      }
    });
  };
  
  const togglePin = () => {
    setFormData(prev => ({ ...prev, isPinned: !prev.isPinned }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter note title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea id="content" name="content" value={formData.content} onChange={handleInputChange} placeholder="Enter note content" rows={5} />
      </div>
      <div className="space-y-2">
        <Label>Share With</Label>
        <div className="flex flex-wrap gap-2">
          {availableShareRoles.map(role => (
            <Button
              key={role}
              type="button"
              variant={(formData.sharedWith || []).includes(role) ? "default" : "outline"}
              size="sm"
              onClick={() => handleShareChange(role)}
              disabled={currentUser?.role === 'child' && role !== 'child' && role !== 'family'} 
            >
              {role === 'child' ? 'Child' : role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          ))}
        </div>
         {currentUser?.role === 'child' && <p className="text-xs text-muted-foreground">As a Child, you can share notes with Family or keep them private (just for "Child").</p>}
      </div>
      <div className="flex items-center space-x-2">
        <Button type="button" variant={formData.isPinned ? "default" : "outline"} size="sm" onClick={togglePin} className="flex items-center gap-2">
          <Pin className="h-4 w-4" />{formData.isPinned ? "Pinned" : "Pin Note"}
        </Button>
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{note ? 'Update Note' : 'Add Note'}</Button>
      </DialogFooter>
    </form>
  );
};

export default NoteForm;