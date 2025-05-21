import { supabase } from '@/lib/supabaseClient';

export const fetchUserProfile = async (authUser, toast) => {
  if (!authUser) {
    return null;
  }
  try {
    const { data, error, status } = await supabase
      .from('profiles')
      .select(`name, role, household_id, avatar_url, about`)
      .eq('id', authUser.id)
      .single();

    if (error && status !== 406) {
      console.error('Error fetching profile:', error);
      if (toast) {
        toast({
          variant: "destructive",
          title: "Error fetching user data",
          description: error.message || 'Could not retrieve profile.',
        });
      }
      return null;
    }

    if (data) {
      return {
        id: authUser.id,
        email: authUser.email,
        ...data,
      };
    } else {
      console.warn(`Profile not found for user ${authUser.id}. This might be new user/trigger delay.`);
      return null;
    }
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    if (toast) {
      toast({
        variant: "destructive",
        title: "Error fetching user data",
        description: error.message || 'An unexpected error occurred.',
      });
    }
    return null;
  }
};
