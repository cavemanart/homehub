import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Key, Pill, Phone, Clock, Info, Lock, Users2, Baby } from 'lucide-react';
import NannyInfoForm from '@/pages/nanny-mode/NannyInfoForm';
import NannyInfoCard from '@/pages/nanny-mode/NannyInfoCard';
import { Link } from 'react-router-dom';

const NannyMode = ({ currentUser }) => {
  const [nannyInfo, setNannyInfo] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState(null);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('kids_info');
  const householdId = currentUser?.householdId;
  const canEditNannyInfo = currentUser?.role === 'family';

  useEffect(() => {
    if (!householdId) return;
    const savedInfo = JSON.parse(localStorage.getItem(`homeNannyInfo_${householdId}`) || '[]');
    setNannyInfo(savedInfo);
  }, [householdId]);

  const saveNannyInfo = (updatedInfo) => {
    if (!householdId) return;
    localStorage.setItem(`homeNannyInfo_${householdId}`, JSON.stringify(updatedInfo));
    setNannyInfo(updatedInfo);
  };

  const handleFormSubmit = (infoData) => {
    if (!canEditNannyInfo) {
      toast({ variant: "destructive", title: "Access Denied", description: "Only family members can add or edit Nanny Info." });
      return;
    }
    if (!infoData.title || !infoData.content) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in title and content." });
      return;
    }

    if (editingInfo) {
      const updatedInfo = nannyInfo.map(i => i.id === editingInfo.id ? { ...editingInfo, ...infoData } : i);
      saveNannyInfo(updatedInfo);
      toast({ title: "Information updated", description: "Successfully updated." });
    } else {
      saveNannyInfo([...nannyInfo, { ...infoData, id: Date.now(), createdBy: currentUser?.name || 'Unknown' }]);
      toast({ title: "Information added", description: "Successfully added." });
    }
    handleDialogClose();
  };

  const handleEditInfo = (info) => {
    if (!canEditNannyInfo) return;
    setEditingInfo(info);
    setActiveTab(info.category);
    setIsDialogOpen(true);
  };

  const handleDeleteInfo = (id) => {
    if (!canEditNannyInfo) {
      toast({ variant: "destructive", title: "Access Denied", description: "Only family members can delete Nanny Info." });
      return;
    }
    saveNannyInfo(nannyInfo.filter(i => i.id !== id));
    toast({ title: "Information deleted", description: "Successfully deleted." });
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingInfo(null);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'passcodes': return <Key className="h-5 w-5" />;
      case 'medication': return <Pill className="h-5 w-5" />;
      case 'contacts': return <Phone className="h-5 w-5" />;
      case 'schedule': return <Clock className="h-5 w-5" />;
      case 'kids_info': return <Users2 className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };
  
  const tabCategories = [
    { value: 'kids_info', label: "Children's Info", icon: <Users2 className="h-4 w-4" /> },
    { value: 'passcodes', label: 'Passcodes', icon: <Key className="h-4 w-4" /> },
    { value: 'medication', label: 'Medication', icon: <Pill className="h-4 w-4" /> },
    { value: 'contacts', label: 'Contacts', icon: <Phone className="h-4 w-4" /> },
    { value: 'schedule', label: 'Schedule', icon: <Clock className="h-4 w-4" /> },
    { value: 'other', label: 'Other', icon: <Info className="h-4 w-4" /> },
  ];

  if (!householdId && currentUser?.role !== 'guest') {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Baby className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="mt-4 text-lg font-semibold">Household Not Set</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Nanny Mode requires household data. Please log in again or join a household.
          </p>
          <Link to="/login">
            <Button className="mt-4">Go to Login</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nanny Mode</h1>
          <p className="text-muted-foreground">Essential information for childcare providers.</p>
        </div>
        {canEditNannyInfo && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2" onClick={() => { setEditingInfo(null); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4" /><span>Add Information</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingInfo ? 'Edit Information' : 'Add New Information'}</DialogTitle>
                <DialogDescription>{editingInfo ? 'Update nanny info.' : 'Add new nanny info.'}</DialogDescription>
              </DialogHeader>
              <NannyInfoForm info={editingInfo} onSubmit={handleFormSubmit} onCancel={handleDialogClose} currentCategory={activeTab} canEdit={canEditNannyInfo} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6">
          {tabCategories.map(cat => (
            <TabsTrigger key={cat.value} value={cat.value} className="flex items-center gap-2">
              {cat.icon} <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabCategories.map(categoryTab => (
          <TabsContent key={categoryTab.value} value={categoryTab.value} className="mt-6">
            {nannyInfo.filter(info => info.category === categoryTab.value).length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    {getCategoryIcon(categoryTab.value)}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No {categoryTab.label.toLowerCase()} information yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Add {categoryTab.label.toLowerCase()} information for nannies.</p>
                  {canEditNannyInfo && (
                    <Button className="mt-4" onClick={() => { setEditingInfo(null); setActiveTab(categoryTab.value); setIsDialogOpen(true); }}>
                      <Plus className="mr-2 h-4 w-4" /> Add {categoryTab.label} Info
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {nannyInfo.filter(info => info.category === categoryTab.value).map((info, index) => (
                    <NannyInfoCard key={info.id} info={info} onEdit={handleEditInfo} onDelete={handleDeleteInfo} index={index} getCategoryIcon={getCategoryIcon} canEdit={canEditNannyInfo} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mt-8 bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
            <Lock className="h-5 w-5" /> Privacy Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 dark:text-blue-400">
            The information in Nanny Mode is intended for authorized childcare providers only. 
            Please ensure that sensitive information is shared responsibly and updated regularly.
          </p>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="mt-8">
        <AccordionItem value="faq-1">
          <AccordionTrigger>How do I share access with my nanny?</AccordionTrigger>
          <AccordionContent>
            Provide your nanny with login credentials for a 'nanny' role account for your household. They will only see the Dashboard and Nanny Mode relevant to your household.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-2">
          <AccordionTrigger>What information should I include?</AccordionTrigger>
          <AccordionContent>
            Include TV/device passcodes, WiFi passwords, alarm codes, medication instructions, emergency contacts, pediatrician info, allergies, routines, and special instructions, especially under "Children's Info".
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-3">
          <AccordionTrigger>How often should I update this information?</AccordionTrigger>
          <AccordionContent>
            Review and update monthly or when significant changes occur (medications, schedules, contacts). Ensure emergency contacts are always current.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default NannyMode;