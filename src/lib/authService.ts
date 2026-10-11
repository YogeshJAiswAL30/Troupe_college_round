import { supabase, isSupabaseConfigured } from './supabase';
import { UserProfile, UserRole } from '../types/fairwork';
import { mockUsers } from '../data/mockData';

export interface AuthSession {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isProductionBackend: boolean;
  accessToken?: string;
}

export const authService = {
  /**
   * Check whether real Supabase backend is configured and available
   */
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  /**
   * Sign up with email, password, and requested initial role.
   * Note: On backend, role assignment is validated via profile creation trigger.
   */
  async signUp(params: {
    email: string;
    password: string;
    displayName: string;
    role: UserRole;
  }): Promise<{ user: UserProfile | null; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      // Local fallback for sandbox demonstration
      const newUserId = `usr_${Date.now()}`;
      const newUser: UserProfile = {
        id: newUserId,
        email: params.email,
        displayName: params.displayName,
        role: params.role,
        verificationStatus: 'ID_VERIFIED',
        reputationScore: 100,
        createdAt: new Date().toISOString(),
      };
      return { user: newUser };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            display_name: params.displayName,
            requested_role: params.role,
          },
        },
      });

      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: 'Registration failed.' };

      // Fetch or build the profile record
      const profile = await this.fetchProfile(data.user.id);
      return { user: profile || null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up exception';
      return { user: null, error: message };
    }
  },

  /**
   * Log in with email and password
   */
  async signIn(email: string, password: string): Promise<{ user: UserProfile | null; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      // Match against mock personas
      const matched = Object.values(mockUsers).find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) return { user: matched };
      return {
        user: {
          id: `usr_${Date.now()}`,
          email,
          displayName: email.split('@')[0],
          role: 'CLIENT',
          verificationStatus: 'ID_VERIFIED',
          reputationScore: 100,
          createdAt: new Date().toISOString(),
        },
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { user: null, error: error.message };
      if (!data.user) return { user: null, error: 'Authentication failed.' };

      const profile = await this.fetchProfile(data.user.id);
      return { user: profile };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in exception';
      return { user: null, error: message };
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  },

  /**
   * Request password reset
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || !supabase) {
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?reset=true`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      return { success: false, error: message };
    }
  },

  /**
   * Fetch authenticated user profile from public.profiles table
   */
  async fetchProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured || !supabase) {
      return mockUsers.client_01;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      displayName: data.display_name,
      role: data.role as UserRole,
      verificationStatus: data.verification_status,
      bio: data.bio,
      skills: data.skills || [],
      reputationScore: data.reputation_score,
      createdAt: data.created_at,
    };
  },
};
