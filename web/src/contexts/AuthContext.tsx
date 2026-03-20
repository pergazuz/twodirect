"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, Profile, getProfile } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await getProfile(user.id);
      setProfile(profileData);
    }
  }, [user]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (mounted && currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);

          let profileData = await getProfile(currentSession.user.id);
          if (mounted) {
            const meta = currentSession.user.user_metadata;
            if (!profileData) {
              // No profile row — build from user_metadata
              profileData = {
                id: currentSession.user.id,
                email: currentSession.user.email || null,
                full_name: meta?.full_name || meta?.name || null,
                avatar_url: meta?.avatar_url || meta?.picture || null,
                provider: currentSession.user.app_metadata?.provider || null,
                created_at: currentSession.user.created_at,
                updated_at: currentSession.user.updated_at || currentSession.user.created_at,
              };
            } else {
              // Update profile with fresh data from metadata if missing
              const freshAvatar = meta?.avatar_url || meta?.picture;
              const freshName = meta?.full_name || meta?.name;

              if (freshAvatar && freshAvatar !== profileData.avatar_url) {
                profileData.avatar_url = freshAvatar;
              }
              if (freshName && !profileData.full_name) {
                profileData.full_name = freshName;
              }
            }
            setProfile(profileData);
          }
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setTimeout(async () => {
            if (!mounted) return;
            let profileData = await getProfile(newSession.user.id);
            if (mounted) {
              const meta = newSession.user.user_metadata;
              if (!profileData) {
                profileData = {
                  id: newSession.user.id,
                  email: newSession.user.email || null,
                  full_name: meta?.full_name || meta?.name || null,
                  avatar_url: meta?.avatar_url || meta?.picture || null,
                  provider: newSession.user.app_metadata?.provider || null,
                  created_at: newSession.user.created_at,
                  updated_at: newSession.user.updated_at || newSession.user.created_at,
                };
              } else {
                // Update profile with fresh data from metadata if missing
                const freshAvatar = meta?.avatar_url || meta?.picture;
                const freshName = meta?.full_name || meta?.name;

                if (freshAvatar && freshAvatar !== profileData.avatar_url) {
                  profileData.avatar_url = freshAvatar;
                }
                if (freshName && !profileData.full_name) {
                  profileData.full_name = freshName;
                }
              }
              setProfile(profileData);
            }
          }, 0);
        } else {
          setProfile(null);
        }

        if (mounted) {
          setIsLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async (redirectTo?: string) => {
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (redirectTo) {
      callbackUrl.searchParams.set("next", redirectTo);
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

