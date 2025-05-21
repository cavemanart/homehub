import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, CheckSquare, StickyNote, Heart, Baby, Menu, X, LogOut, Moon, Sun, DollarSign, ListChecks, Users, ClipboardList, Share2, Brain, CalendarCheck, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';

const Layout = ({ children, onLogout, user, updateUser }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const navConfig = {
    family: [
      { path: '/', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
      { path: '/tasks', label: 'Tasks', icon: <CheckSquare className="h-5 w-5" /> },
      { path: '/notes', label: 'Notes', icon: <StickyNote className="h-5 w-5" /> },
      { path: '/bills', label: 'Bills', icon: <DollarSign className="h-5 w-5" /> },
      { path: '/chores', label: 'Chores', icon: <ListChecks className="h-5 w-5" /> },
      { path: '/appreciation', label: 'Appreciation', icon: <Heart className="h-5 w-5" /> },
      { path: '/weekly-sync', label: 'Weekly Sync', icon: <CalendarCheck className="h-5 w-5" /> },
      { path: '/mental-load', label: 'Mental Load', icon: <Brain className="h-5 w-5" /> },
      { path: '/nanny-mode', label: 'Nanny Mode', icon: <Baby className="h-5 w-5" /> },
      { path: '/kids-dashboard', label: 'Child\'s View', icon: <Users className="h-5 w-5" /> },
      { path: '/profile', label: 'My Profile', icon: <UserCircle className="h-5 w-5" /> },
    ],
    roommate: [
      { path: '/', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
      { path: '/tasks', label: 'Tasks', icon: <CheckSquare className="h-5 w-5" /> },
      { path: '/notes', label: 'Notes', icon: <StickyNote className="h-5 w-5" /> },
      { path: '/bills', label: 'Bills', icon: <DollarSign className="h-5 w-5" /> },
      { path: '/profile', label: 'My Profile', icon: <UserCircle className="h-5 w-5" /> },
    ],
    nanny: [
      { path: '/', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
      { path: '/notes', label: 'Notes', icon: <StickyNote className="h-5 w-5" /> },
      { path: '/nanny-mode', label: 'Nanny Mode', icon: <Baby className="h-5 w-5" /> },
      { path: '/profile', label: 'My Profile', icon: <UserCircle className="h-5 w-5" /> },
    ],
    child: [
      { path: '/', label: 'My Dashboard', icon: <Home className="h-5 w-5" /> },
      { path: '/chores', label: 'My Chores', icon: <ClipboardList className="h-5 w-5" /> },
      { path: '/notes', label: 'Notes', icon: <StickyNote className="h-5 w-5" /> },
      { path: '/appreciation', label: 'Send Thanks', icon: <Heart className="h-5 w-5" /> },
      { path: '/profile', label: 'My Profile', icon: <UserCircle className="h-5 w-5" /> },
    ],
    guest: [
      { path: '/', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    ]
  };
  
  const navItems = navConfig[user?.role || 'guest'] || navConfig.guest;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleShareJoinCode = () => {
    const householdId = user?.householdId || "DEMOJOIN123";
    const joinCode = householdId.split('-').pop().substring(0,8).toUpperCase(); 

    navigator.clipboard.writeText(`${window.location.origin}/join/${joinCode}`)
      .then(() => {
        toast({
          title: "Household Join Link Copied!",
          description: `Share this link (or code: ${joinCode}) with new members to join your household: ${user?.householdId ? user.householdId.substring(0,8) : 'Demo Household'}.`,
        });
      })
      .catch(err => {
        toast({
          variant: "destructive",
          title: "Failed to copy",
          description: "Could not copy the join link. Please try again.",
        });
      });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/" className="flex items-center gap-2">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, ease: "easeInOut" }}
                className="h-8 w-8 rounded-full bg-primary flex items-center justify-center"
              >
                <Home className="h-4 w-4 text-white" />
              </motion.div>
              <span className="font-bold text-xl hidden sm:inline-block">Hublie</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {user?.role === 'family' && (
              <Button variant="outline" size="sm" onClick={handleShareJoinCode} className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share Invite</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
            
            <Link to="/profile" className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user?.avatar} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <span className="font-medium hidden md:block">{user?.name || 'User'} ({user?.role === 'child' ? 'Child' : user?.role || 'guest'})</span>
            </Link>
            
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          className="fixed inset-y-0 left-0 z-40 w-64 bg-background border-r shadow-lg md:hidden"
        >
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-xl">Menu</span>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </motion.div>
      )}

      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 flex-col border-r bg-background">
          <div className="p-4 space-y-4">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          {React.cloneElement(children, { currentUser: user, updateUser: updateUser })}
        </main>
      </div>
    </div>
  );
};

export default Layout;