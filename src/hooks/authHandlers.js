import { supabase } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const handleGuestLoginLogic = () => {
  const guestProfile = {
    id: 'guest-' + uuidv4(), // Using uuidv4 for unique guest ID
    name: 'Guest',
    role: 'guest',
    avatar_url: '',
    household_id: 'guest-household', 
    about: '',
    email: `guest-${uuidv4()}@example.com` // Unique email for guest session
  };
  return {
    profile: guestProfile,
    session: { user: { id: guestProfile.id, email: guestProfile.email, aud: 'authenticated' } } // Mock session
  };
};

export const handleUserSignupLogic = async (credentials, householdId) => {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      data: {
        name: credentials.name,
        role: credentials.role,
        household_id: householdId,
        avatar_url: credentials.avatar_url || '',
        about: credentials.about || '',
      },
    },
  });
  if (error) throw error;
  return data;
};

export const handleUserSignInLogic = async (credentials) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });
  if (error) throw error;
  return data;
};
