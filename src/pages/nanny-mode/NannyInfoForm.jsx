import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { Key, Pill, Phone, Clock, Info, Users2 } from 'lucide-react';

const NannyInfoForm = ({ info, onSubmit, onCancel, currentCategory, canEdit }) => {
  const [formData, setFormData] = useState(
    info || { category: currentCategory, title: '', content: '', kidsNames: '' }
  );

  useEffect(() => {
    if (!info) {
      setFormData(prev => ({ ...prev, category: currentCategory, kidsNames: prev.kidsNames || '' }));
    } else {
      setFormData(prev => ({ ...prev, kidsNames: prev.kidsNames || '' }));
    }
  }, [currentCategory, info]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category) => {
    setFormData(prev => ({ ...prev, category }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const categoryButtons = [
    { value: 'kids_info', label: "Children's Info", icon: <Users2 className="h-4 w-4" /> },
    { value: 'passcodes', label: 'Passcodes', icon: <Key className="h-4 w-4" /> },
    { value: 'medication', label: 'Medication', icon: <Pill className="h-4 w-4" /> },
    { value: 'contacts', label: 'Contacts', icon: <Phone className="h-4 w-4" /> },
    { value: 'schedule', label: 'Schedule', icon: <Clock className="h-4 w-4" /> },
    { value: 'other', label: 'Other', icon: <Info className="h-4 w-4" /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Category</Label>
        <div className="flex flex-wrap gap-2">
          {categoryButtons.map(catBtn => (
            <Button key={catBtn.value} type="button" variant={formData.category === catBtn.value ? "default" : "outline"} size="sm" onClick={() => handleCategoryChange(catBtn.value)} className="flex items-center gap-2" disabled={!canEdit}>
              {catBtn.icon} {catBtn.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter title (e.g., Wifi Password, Allergies)" disabled={!canEdit} />
      </div>
       {formData.category === 'kids_info' && (
        <div className="space-y-2">
          <Label htmlFor="kidsNames">Child(ren)'s Name(s)</Label>
          <Input id="kidsNames" name="kidsNames" value={formData.kidsNames} onChange={handleInputChange} placeholder="e.g., Alex, Bailey (comma separated)" disabled={!canEdit} />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="content">Content / Details</Label>
        <Textarea id="content" name="content" value={formData.content} onChange={handleInputChange} placeholder="Enter detailed information" rows={5} disabled={!canEdit} />
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        {canEdit && <Button type="submit">{info ? 'Update Information' : 'Add Information'}</Button>}
      </DialogFooter>
    </form>
  );
};

export default NannyInfoForm;