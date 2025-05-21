import Dashboard from '@/pages/dashboard';
import Tasks from '@/pages/tasks';
import Notes from '@/pages/notes';
import Appreciation from '@/pages/appreciation';
import NannyMode from '@/pages/nanny-mode';
import Bills from '@/pages/bills';
import Chores from '@/pages/chores';
import KidsDashboard from '@/pages/kids-dashboard';
import WeeklySync from '@/pages/weekly-sync';
import MentalLoad from '@/pages/mental-load';
import Profile from '@/pages/profile';

const RouteConfig = [
  {
    path: '/',
    element: (props) => props.currentUser?.role === 'child' ? <KidsDashboard {...props} /> : <Dashboard {...props} />,
    allowedRoles: ['family', 'roommate', 'nanny', 'child', 'guest'],
  },
  { path: '/tasks', element: Tasks, allowedRoles: ['family', 'roommate'] },
  { path: '/notes', element: Notes, allowedRoles: ['family', 'roommate', 'nanny', 'child'] },
  { path: '/appreciation', element: Appreciation, allowedRoles: ['family', 'child'] },
  { path: '/nanny-mode', element: NannyMode, allowedRoles: ['family', 'nanny'] },
  { path: '/bills', element: Bills, allowedRoles: ['family', 'roommate'] },
  { path: '/chores', element: Chores, allowedRoles: ['family', 'child'] },
  { path: '/kids-dashboard', element: KidsDashboard, allowedRoles: ['child', 'family'] },
  { path: '/weekly-sync', element: WeeklySync, allowedRoles: ['family'] },
  { path: '/mental-load', element: MentalLoad, allowedRoles: ['family'] },
  { path: '/profile', element: Profile, allowedRoles: ['family', 'roommate', 'nanny', 'child'] },
];

export default RouteConfig;