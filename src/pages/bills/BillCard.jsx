import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import { format, differenceInDays, parseISO, isPast } from 'date-fns';

const BillCard = ({ bill, onEdit, onDelete, onToggleStatus, index }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" } }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const getStatusColor = (status, dueDate) => {
    if (status === 'paid') return 'border-l-4 border-green-500';
    if (status === 'pending') return 'border-l-4 border-yellow-500';
    if (dueDate && isPast(parseISO(dueDate)) && status === 'unpaid') return 'border-l-4 border-red-500';
    return 'border-l-4 border-gray-300 dark:border-gray-600';
  };

  const daysUntilDue = bill.dueDate ? differenceInDays(parseISO(bill.dueDate), new Date()) : null;

  return (
    <motion.div custom={index} initial="hidden" animate="visible" exit="exit" variants={cardVariants} layout>
      <Card className={`h-full card-hover ${getStatusColor(bill.status, bill.dueDate)} ${bill.status === 'paid' ? 'opacity-70 bg-muted/30' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className={`text-xl ${bill.status === 'paid' ? 'line-through' : ''}`}>{bill.name}</CardTitle>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(bill)} className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(bill.id)} className="h-7 w-7"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
          <CardDescription className="text-lg font-semibold flex items-center">
            <DollarSign className="h-5 w-5 mr-1" />{bill.amount}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="text-xs text-muted-foreground space-y-1">
            {bill.dueDate && (
              <p className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Due: {format(parseISO(bill.dueDate), 'MMM dd, yyyy')}
                {bill.status === 'unpaid' && daysUntilDue !== null && daysUntilDue < 0 && <span className="ml-1 text-red-500 font-semibold">(Overdue)</span>}
                {bill.status === 'unpaid' && daysUntilDue !== null && daysUntilDue >= 0 && daysUntilDue <= 3 && <span className="ml-1 text-yellow-500 font-semibold">({daysUntilDue === 0 ? 'Due today' : `Due in ${daysUntilDue} days`})</span>}
              </p>
            )}
            <p>Status: <span className={`font-medium ${bill.status === 'paid' ? 'text-green-600' : bill.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>{bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}</span></p>
            {bill.status === 'paid' && bill.paidBy && <p>Paid by: {bill.paidBy}</p>}
          </div>
        </CardContent>
        <CardFooter>
          {bill.status !== 'paid' && (
            <Button variant="default" size="sm" onClick={() => onToggleStatus(bill.id, 'paid')} className="w-full">
              Mark as Paid
            </Button>
          )}
          {bill.status === 'paid' && (
             <Button variant="secondary" size="sm" onClick={() => onToggleStatus(bill.id, 'unpaid')} className="w-full">
              Mark as Unpaid
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default BillCard;