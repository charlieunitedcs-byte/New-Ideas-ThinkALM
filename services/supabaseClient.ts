/**
 * Supabase Client Configuration
 *
 * This service provides a configured Supabase client for database operations.
 * Used throughout the app to interact with PostgreSQL database.
 *
 * Week 2: Database Migration
 * Replaces localStorage with persistent Supabase database
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables missing!');
  console.error('Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.error('Please add these to your .env.local file');
  console.error('See SUPABASE_SETUP_INSTRUCTIONS.md for details');
}

/**
 * Supabase client instance
 * Used for all frontend database operations
 *
 * This uses the "anon" key which is safe to expose in frontend code.
 * Row Level Security (RLS) policies protect data access.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      // Auto-refresh tokens
      autoRefreshToken: true,
      // Persist session in localStorage
      persistSession: true,
      // Detect session from URL (useful for email confirmations)
      detectSessionInUrl: true,
    },
    db: {
      // Use our custom schema (default is 'public')
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'think-abc-sales',
      },
    },
  }
);

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

/**
 * Log Supabase configuration status
 */
if (isSupabaseConfigured()) {
  console.log('✅ Supabase client initialized');
  console.log('📍 URL:', supabaseUrl);
} else {
  console.warn('⚠️ Supabase not configured - using localStorage fallback');
  console.warn('To enable database: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local');
}

/**
 * Database table types
 * These match the schema created in Supabase
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

export interface DatabaseCall {
  id: string;
  user_id: string;
  team: string;
  agent_name: string | null;
  prospect_name: string | null;
  transcript: string;
  score: number;
  summary: string | null;
  strengths: string[] | null;
  improvements: string[] | null;
  tone: string | null;
  emotional_intelligence: number | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseClient {
  id: string;
  user_id: string;
  company_name: string;
  industry: string | null;
  size: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  status: string;
  last_contact: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseCampaign {
  id: string;
  user_id: string;
  name: string;
  type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  target_audience: string | null;
  goals: any;
  metrics: any;
  created_at: string;
  updated_at: string;
}

/**
 * Database tables enum for type safety
 */
export enum Tables {
  USERS = 'users',
  CALLS = 'calls',
  CLIENTS = 'clients',
  CAMPAIGNS = 'campaigns',
}

/**
 * Helper function to handle Supabase errors
 */
export const handleSupabaseError = (error: any, operation: string): never => {
  console.error(`❌ Supabase ${operation} error:`, error);

  // Provide user-friendly error messages
  if (error.code === '23505') {
    throw new Error('This record already exists');
  } else if (error.code === '23503') {
    throw new Error('Referenced record not found');
  } else if (error.code === 'PGRST116') {
    throw new Error('Record not found');
  } else if (error.message?.includes('JWT')) {
    throw new Error('Session expired. Please login again');
  } else if (error.message?.includes('network')) {
    throw new Error('Network error. Please check your connection');
  }

  throw new Error(error.message || `Database ${operation} failed`);
};

export default supabase;
