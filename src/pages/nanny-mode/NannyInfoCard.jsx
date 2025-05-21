import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Users2 } from 'lucide-react';

const NannyInfoCard = ({ info, onEdit, onDelete, index, getCategoryIcon, canEdit }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" } }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  return (
    <motion.div custom={index} initial="hidden" animate="visible" exit="exit" variants={cardVariants} layout>
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              {getCategoryIcon(info.category)}
              <span>{info.title}</span>
            </CardTitle>
            {canEdit && (
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => onEdit(info)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(info.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5">
            {info.createdBy && <p>Added by: {info.createdBy}</p>}
            {info.category === 'kids_info' && info.kidsNames && (
              <p className="flex items-center gap-1"><Users2 className="h-3 w-3" /> For: {info.kidsNames}</p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{info.content}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NannyInfoCard;