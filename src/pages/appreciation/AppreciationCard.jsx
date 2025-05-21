import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageSquare, ThumbsUp, Trash2 } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';

const AppreciationCard = ({ app, index, currentUser, familyMembers, onHeart, onDelete, onReply, replyingTo, setReplyingTo, replyMessage, setReplyMessage }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" } }),
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const canDelete = currentUser?.role === 'family' || currentUser?.name === app.from;
  const canHeartOrReply = currentUser?.role !== 'child';

  return (
    <motion.div key={app.id} custom={index} initial="hidden" animate="visible" exit="exit" variants={cardVariants} layout>
      <Card className="h-full card-hover appreciation-card-dynamic group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <ThumbsUp className="h-5 w-5 text-primary group-hover:animate-bounce" />
                <span>To: {app.to}</span>
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                From: {app.from} ({app.fromRole === 'kid' ? 'Child' : app.fromRole}) on {new Date(app.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            {canDelete && (
              <Button variant="ghost" size="icon" onClick={() => onDelete(app.id)} className="opacity-50 group-hover:opacity-100">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="whitespace-pre-wrap text-base">{app.message}</p>
        </CardContent>
        <CardFooter className="pt-2 flex flex-col items-start gap-3">
          <div className="flex items-center gap-2">
            <Button variant={app.hearts?.includes(currentUser?.name) ? "default" : "outline"} size="sm" onClick={() => onHeart(app.id)} disabled={!canHeartOrReply} className="flex items-center gap-1">
              <Heart className={`h-4 w-4 ${app.hearts?.includes(currentUser?.name) ? 'fill-destructive text-destructive' : ''}`} />
              {app.hearts?.length || 0}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setReplyingTo(replyingTo === app.id ? null : app.id)} disabled={!canHeartOrReply} className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" /> {app.replies?.length || 0} Replies
            </Button>
          </div>
          {replyingTo === app.id && canHeartOrReply && (
            <div className="w-full space-y-2 pt-2 border-t">
              {app.replies?.map((reply, rIndex) => (
                <div key={rIndex} className="text-xs p-2 bg-muted/50 rounded-md">
                  <strong>{reply.from}:</strong> {reply.message}
                  <span className="text-muted-foreground ml-1">({new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                </div>
              ))}
              <div className="flex gap-2 items-end">
                <TextareaAutosize value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Write a reply..." className="flex-grow !min-h-[40px] text-sm p-2 border rounded-md resize-none" minRows={1} maxRows={3} />
                <Button size="sm" onClick={() => onReply(app.id)}>Reply</Button>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default AppreciationCard;