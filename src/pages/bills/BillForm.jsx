import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BillForm = ({ bill, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(
    bill || { name: '', amount: '', dueDate: '', status: 'unpaid', paidBy: '' }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">Bill Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Rent, Electricity" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" name="amount" type="number" value={formData.amount} onChange={handleInputChange} placeholder="e.g., 1200" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input id="dueDate" name="dueDate" type="date" value={formData.dueDate} onChange={handleInputChange} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={handleStatusChange}>
            <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {formData.status === 'paid' && (
          <div className="space-y-2">
            <Label htmlFor="paidBy">Paid By</Label>
            <Input id="paidBy" name="paidBy" value={formData.paidBy} onChange={handleInputChange} placeholder="Who paid?" />
          </div>
        )}
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{bill ? 'Update Bill' : 'Add Bill'}</Button>
      </DialogFooter>
    </form>
  );
};

export default BillForm;