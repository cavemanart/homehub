import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { fetchUserProfile as fetchUserProfileService } from '@/hooks/authService';
import { handleGuestLoginLogic, handleUserSignupLogic, handleUserSignInLogic } from '@/hooks/authHandlers';

export const useAuth = () => {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser) {
      // console.log("useAuth/fetchUserProfile: No authUser, setting profile to null");
      setUserProfile(null);
      return null;
    }
    // console.log("useAuth/fetchUserProfile: Fetching profile for user:", authUser.id);
    try {
      const profile = await fetchUserProfileService(authUser, toast);
      // console.log("useAuth/fetchUserProfile: Profile service returned:", profile);
      setUserProfile(profile);
      return profile;
    } catch (error) {
      // console.error("useAuth/fetchUserProfile: Error from service:", error);
      setUserProfile(null);
      return null;
    }
  }, [toast]);

  useEffect(() => {
    // console.log("useAuth useEffect: Mounting or deps changed. Initial loadingAuth:", loadingAuth);
    let isMounted = true;
    setLoadingAuth(true); // Explicitly set true at the start of every effect run.

    // console.log("useAuth useEffect: Calling getSession.");
    supabase.auth.getSession()
      .then(async ({ data: { session: currentSession }, error: sessionError }) => {
        // console.log("useAuth useEffect/getSession.then: isMounted:", isMounted, "Session Error:", sessionError, "Current Session:", currentSession ? "Exists" : "Null");
        if (!isMounted) return;

        if (sessionError) {
          console.error("Error in getSession:", sessionError);
          setSession(null);
          setUserProfile(null);
        } else {
          setSession(currentSession);
          if (currentSession?.user) {
            // console.log("useAuth useEffect/getSession.then: Session exists, fetching profile for user:", currentSession.user.id);
            await fetchUserProfile(currentSession.user);
          } else {
            // console.log("useAuth useEffect/getSession.then: No session user, setting profile to null.");
            setUserProfile(null);
          }
        }
      })
      .catch(error => {
        // console.error("useAuth useEffect/getSession.catch: isMounted:", isMounted, "Error:", error);
        if (isMounted) {
          console.error("Error during initial auth setup (getSession chain):", error);
          toast({
            variant: "destructive",
            title: "Initialization Error",
            description: "Could not load user session.",
          });
          setSession(null);
          setUserProfile(null);
        }
      })
      .finally(() => {
        // console.log("useAuth useEffect/getSession.finally: isMounted:", isMounted);
        if (isMounted) {
          // console.log("useAuth useEffect/getSession.finally: Setting loadingAuth to false.");
          setLoadingAuth(false);
        }
      });

    // console.log("useAuth useEffect: Setting up onAuthStateChange listener.");
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        // console.log("useAuth onAuthStateChange: Event received. isMounted:", isMounted, "New session:", newSession ? "Exists" : "Null", "Event:", _event, "Current loadingAuth:", loadingAuth);
        if (!isMounted) return;
        
        setSession(newSession);
        if (newSession?.user) {
          // console.log("useAuth onAuthStateChange: New session user exists, fetching profile for user:", newSession.user.id);
          await fetchUserProfile(newSession.user);
        } else {
          // console.log("useAuth onAuthStateChange: No new session user, setting profile to null.");
          setUserProfile(null);
        }
        
        // This is a safeguard. If the initial getSession().finally() hasn't run yet,
        // or if loadingAuth somehow got set back to true, this will try to correct it.
        if (loadingAuth && isMounted) {
          // console.log("useAuth onAuthStateChange: loadingAuth was true, setting to false.");
          setLoadingAuth(false);
        }
      }
    );

    return () => {
      // console.log("useAuth useEffect: Cleanup. Unsubscribing listener. isMounted was true.");
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserProfile, toast]); // fetchUserProfile & toast are stable or memoized


  const updateUserProfileState = useCallback((profileData) => {
    // console.log("useAuth updateUserProfileState: Called with data:", profileData);
    setUserProfile(prevProfile => ({
      ...prevProfile,
      ...profileData
    }));
  }, []);

  const handleLogin = useCallback(async (loginCredentials, isGuest = false, householdData = null, isSignup = false) => {
    // console.log("useAuth handleLogin: Called. isGuest:", isGuest, "isSignup:", isSignup);
    setLoadingAuth(true); // Set loading true at the start of login/signup attempt
    try {
      let success = false;
      if (isGuest) {
        const guestProfileData = handleGuestLoginLogic();
        setUserProfile(guestProfileData.profile);
        setSession(guestProfileData.session);
        toast({ title: "Welcome, Guest!", description: "You are browsing in guest mode." });
        success = true;
        setLoadingAuth(false); // Guest login is synchronous for state, so set false immediately.
      } else if (isSignup) {
        const householdIdToUse = householdData?.householdId || loginCredentials.householdId || uuidv4();
        await handleUserSignupLogic(loginCredentials, householdIdToUse);
        toast({ title: "Account Created!", description: `Welcome, ${loginCredentials.name}! Check email to confirm.` });
        success = true; 
        // For signup, onAuthStateChange will fire. It, or the main useEffect's finally, will handle setLoadingAuth(false).
      } else { // Signin
        await handleUserSignInLogic(loginCredentials);
        toast({ title: "Welcome back!", description: `Successfully logged in.` });
        success = true; 
        // For signin, onAuthStateChange will fire. It, or the main useEffect's finally, will handle setLoadingAuth(false).
      }
      
      // If not guest, successful signup/signin relies on onAuthStateChange and useEffect's finally
      // to set loadingAuth to false. It's not done here to avoid race conditions.
      return success;
    } catch (error) {
      console.error("handleLogin: Error:", error);
      toast({
        variant: "destructive",
        title: isSignup ? "Signup Failed" : "Login Failed",
        description: error.message,
      });
      setLoadingAuth(false); // CRITICAL: set loadingAuth to false on error
      return false;
    }
  }, [toast, fetchUserProfile]); // Added fetchUserProfile as it's used indirectly by onAuthStateChange

  const handleLogout = useCallback(async () => {
    // console.log("useAuth handleLogout: Called.");
    setLoadingAuth(true); // Set loading true at the start of logout attempt
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("handleLogout: Error:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: error.message });
    } else {
      toast({ title: "Logged out", description: "You've been successfully logged out." });
      // setSession(null); // Handled by onAuthStateChange
      // setUserProfile(null); // Handled by onAuthStateChange
    }
    // Regardless of success or failure of signOut, ensure loading is false.
    // onAuthStateChange will also fire and update session/profile.
    setLoadingAuth(false); // CRITICAL: set loadingAuth to false after attempt
  }, [toast]);

  return {
    session,
    userProfile,
    loadingAuth,
    handleLogin,
    handleLogout,
    updateUserProfileState,
    fetchUserProfile, 
  };
};