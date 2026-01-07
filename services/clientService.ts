/**
 * Client Management Service
 *
 * Week 3 Session 2: Supabase-only version (localStorage removed)
 * - Stores clients in PostgreSQL (unlimited storage)
 * - Requires Supabase configuration
 * - Supports pagination and search
 */

import { Client, SubscriptionPlan } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Load clients from database with pagination
 */
export const loadClients = async (
  userId?: string,
  page: number = 1,
  pageSize: number = 100
): Promise<{ clients: Client[]; totalCount: number }> => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured - cannot load clients');
    return { clients: [], totalCount: 0 };
  }

  try {
    let query = supabase
      .from('clients')
      .select('*', { count: 'exact' })
      .order('created_date', { ascending: false });

    // Filter by user if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to load clients from Supabase:', error);
      return { clients: [], totalCount: 0 };
    }

    if (data) {
      console.log(`✅ Loaded ${data.length} clients from Supabase`);

      // Convert database format to Client format
      const clients: Client[] = data.map((row: any) => ({
        id: row.id,
        companyName: row.company_name,
        contactName: row.contact_name,
        email: row.email,
        phone: row.phone,
        plan: row.plan as SubscriptionPlan,
        status: row.status,
        subscriptionId: row.subscription_id,
        createdDate: row.created_date,
        lastActive: row.last_active,
        totalUsers: row.total_users,
        monthlyRevenue: parseFloat(row.monthly_revenue) || 0,
      }));

      return { clients, totalCount: count || 0 };
    }

    return { clients: [], totalCount: 0 };
  } catch (error) {
    console.error('Error loading clients:', error);
    return { clients: [], totalCount: 0 };
  }
};

/**
 * Create a new client
 */
export const createClient = async (
  clientData: Omit<Client, 'id' | 'createdDate' | 'lastActive'>,
  userId: string
): Promise<Client> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Database not configured. Please check your Supabase settings.');
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        user_id: userId,
        company_name: clientData.companyName,
        contact_name: clientData.contactName,
        email: clientData.email,
        phone: clientData.phone || null,
        plan: clientData.plan,
        status: clientData.status || 'Trialing',
        subscription_id: clientData.subscriptionId || null,
        total_users: clientData.totalUsers || 1,
        monthly_revenue: clientData.monthlyRevenue || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create client:', error);
      throw new Error(`Failed to create client: ${error.message}`);
    }

    console.log('✅ Client created in Supabase:', data.id);

    return {
      id: data.id,
      companyName: data.company_name,
      contactName: data.contact_name,
      email: data.email,
      phone: data.phone,
      plan: data.plan as SubscriptionPlan,
      status: data.status,
      subscriptionId: data.subscription_id,
      createdDate: data.created_date,
      lastActive: data.last_active,
      totalUsers: data.total_users,
      monthlyRevenue: parseFloat(data.monthly_revenue) || 0,
    };
  } catch (error: any) {
    console.error('Error creating client:', error);
    throw new Error(`Failed to create client: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Update an existing client
 */
export const updateClient = async (
  id: string,
  updates: Partial<Client>
): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Database not configured. Please check your Supabase settings.');
  }

  try {
    const updateData: any = {};

    if (updates.companyName !== undefined) updateData.company_name = updates.companyName;
    if (updates.contactName !== undefined) updateData.contact_name = updates.contactName;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.plan !== undefined) updateData.plan = updates.plan;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.subscriptionId !== undefined) updateData.subscription_id = updates.subscriptionId;
    if (updates.totalUsers !== undefined) updateData.total_users = updates.totalUsers;
    if (updates.monthlyRevenue !== undefined) updateData.monthly_revenue = updates.monthlyRevenue;

    const { error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Failed to update client:', error);
      throw new Error(`Failed to update client: ${error.message}`);
    }

    console.log('✅ Client updated in Supabase');
    return true;
  } catch (error: any) {
    console.error('Error updating client:', error);
    throw new Error(`Failed to update client: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Delete a client
 */
export const deleteClient = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Database not configured. Please check your Supabase settings.');
  }

  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete client:', error);
      throw new Error(`Failed to delete client: ${error.message}`);
    }

    console.log('✅ Client deleted from Supabase');
    return true;
  } catch (error: any) {
    console.error('Error deleting client:', error);
    throw new Error(`Failed to delete client: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Get a single client by ID
 */
export const getClientById = async (id: string): Promise<Client | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Failed to get client:', error);
      return null;
    }

    return {
      id: data.id,
      companyName: data.company_name,
      contactName: data.contact_name,
      email: data.email,
      phone: data.phone,
      plan: data.plan as SubscriptionPlan,
      status: data.status,
      subscriptionId: data.subscription_id,
      createdDate: data.created_date,
      lastActive: data.last_active,
      totalUsers: data.total_users,
      monthlyRevenue: parseFloat(data.monthly_revenue) || 0,
    };
  } catch (error) {
    console.error('Error getting client:', error);
    return null;
  }
};

/**
 * Get client statistics
 */
export const getClientStats = async (userId?: string): Promise<{
  total: number;
  active: number;
  trialing: number;
}> => {
  if (!isSupabaseConfigured()) {
    return { total: 0, active: 0, trialing: 0 };
  }

  try {
    let query = supabase.from('clients').select('status');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('Failed to get client stats:', error);
      return { total: 0, active: 0, trialing: 0 };
    }

    return {
      total: data.length,
      active: data.filter(c => c.status === 'Active').length,
      trialing: data.filter(c => c.status === 'Trialing').length,
    };
  } catch (error) {
    console.error('Error getting client stats:', error);
    return { total: 0, active: 0, trialing: 0 };
  }
};

/**
 * Get total monthly revenue
 */
export const getTotalRevenue = async (userId?: string): Promise<number> => {
  if (!isSupabaseConfigured()) {
    return 0;
  }

  try {
    let query = supabase
      .from('clients')
      .select('monthly_revenue')
      .eq('status', 'Active');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error || !data) {
      console.error('Failed to get total revenue:', error);
      return 0;
    }

    return data.reduce((sum, client) => sum + parseFloat(client.monthly_revenue || '0'), 0);
  } catch (error) {
    console.error('Error getting total revenue:', error);
    return 0;
  }
};
