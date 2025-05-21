import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckSquare, StickyNote, Heart, DollarSign, ListChecks } from 'lucide-react';

const ActivitySummaryCard = ({ stats, visibleCards, currentUser }) => {
  const totalActivity = stats.tasks + stats.notes + stats.appreciation + stats.bills + stats.chores;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>Recent Activity Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {totalActivity === 0 ? (
              <p className="text-muted-foreground">No recent activity. Start by adding items to relevant sections.</p>
            ) : (
              <>
                {visibleCards.find(c => c.link === '/tasks') && stats.tasks > 0 && (
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span>{stats.tasks} tasks need attention</span>
                  </div>
                )}
                {visibleCards.find(c => c.link === '/notes') && stats.notes > 0 && (
                  <div className="flex items-center gap-2">
                    <StickyNote className="h-4 w-4 text-green-500" />
                    <span>{stats.notes} notes shared with you</span>
                  </div>
                )}
                {visibleCards.find(c => c.link === '/appreciation') && stats.appreciation > 0 && (
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-rose-500" />
                    <span>{stats.appreciation} appreciation messages</span>
                  </div>
                )}
                {visibleCards.find(c => c.link === '/bills') && stats.bills > 0 && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>{stats.bills} bills upcoming</span>
                  </div>
                )}
                {visibleCards.find(c => c.link === '/chores') && stats.chores > 0 && (
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-yellow-600" />
                    <span>{stats.chores} chores {currentUser?.role === 'child' ? 'for you' : 'assigned'}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActivitySummaryCard;