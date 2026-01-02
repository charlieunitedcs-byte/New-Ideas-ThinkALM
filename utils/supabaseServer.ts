/**
 * Supabase Server Utility
 *
 * Backend-only Supabase client using service_role key
 * This bypasses Row Level Security for admin operations
 *
 * IMPORTANT: NEVER import this in frontend code!
 * Only use in /api/* endpoints (Vercel serverless functions)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get server-side credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Server-side Supabase credentials missing!');
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  console.error('Make sure these are set in Vercel environment variables');
}

/**
 * Server-side Supabase client with admin privileges
 * Uses service_role key which bypasses Row Level Security
 */
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  }
);

/**
 * Database user interface (matches Supabase schema)
 */
export interface DatabaseUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'AGENT' | 'CLIENT';
  team: string;
  plan: 'INDIVIDUAL' | 'TEAM' | 'ENTERPRISE';
  status: 'Active' | 'Trialing' | 'Cancelled';
  created_at: string;
  last_login: string | null;
  avatar_url: string | null;
}

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseServiceKey);
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<DatabaseUser | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data as DatabaseUser;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<DatabaseUser | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as DatabaseUser;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};

/**
 * Create new user
 */
export const createUser = async (userData: {
  email: string;
  password_hash: string;
  name: string;
  role: string;
  team: string;
  plan: string;
  status?: string;
}): Promise<DatabaseUser | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email: userData.email.toLowerCase(),
          password_hash: userData.password_hash,
          name: userData.name,
          role: userData.role,
          team: userData.team,
          plan: userData.plan,
          status: userData.status || 'Active',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw error;
    }

    return data as DatabaseUser;
  } catch (error: any) {
    // Handle duplicate email error
    if (error.code === '23505') {
      throw new Error('Email already exists');
    }
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update user's last login timestamp
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating last login:', error);
    }
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

/**
 * Update user data
 */
export const updateUser = async (
  userId: string,
  updates: Partial<DatabaseUser>
): Promise<DatabaseUser | null> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return data as DatabaseUser;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<DatabaseUser[]> => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }

    return data as DatabaseUser[];
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

console.log('✅ Supabase server utility initialized');
console.log('📍 Configured:', isSupabaseConfigured() ? 'Yes' : 'No');
