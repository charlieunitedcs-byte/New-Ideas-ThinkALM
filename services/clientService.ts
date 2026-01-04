/**
 * Client Management Service
 *
 * Week 2 Session 3: Migrated to Supabase database
 * - Stores clients in PostgreSQL (unlimited storage)
 * - Falls back to localStorage if Supabase unavailable
 * - Supports pagination and search
 */

import { Client, SubscriptionPlan } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY = 'think-abc-clients';

// Mock initial clients for demo
const INITIAL_CLIENTS: Client[] = [
  {
    id: '1',
    companyName: 'Acme Corporation',
    contactName: 'John Smith',
    email: 'john@acme.com',
    phone: '+1 (555) 123-4567',
    plan: SubscriptionPlan.COMPANY,
    status: 'Active',
    createdDate: '2024-01-15',
    lastActive: '2 hours ago',
    totalUsers: 25,
    monthlyRevenue: 2500
  },
  {
    id: '2',
    companyName: 'TechStart Inc',
    contactName: 'Sarah Johnson',
    email: 'sarah@techstart.com',
    phone: '+1 (555) 987-6543',
    plan: SubscriptionPlan.TEAM,
    status: 'Trialing',
    createdDate: '2024-11-01',
    lastActive: '1 day ago',
    totalUsers: 10,
    monthlyRevenue: 990
  },
  {
    id: '3',
    companyName: 'Global Sales Partners',
    contactName: 'Michael Chen',
    email: 'michael@globalsales.com',
    phone: '+1 (555) 456-7890',
    plan: SubscriptionPlan.COMPANY,
    status: 'Active',
    createdDate: '2023-08-22',
    lastActive: '30 minutes ago',
    totalUsers: 50,
    monthlyRevenue: 5000
  }
];

/**
 * Load clients from database with pagination
 */
export const loadClients = async (
  userId?: string,
  page: number = 1,
  pageSize: number = 100
): Promise<{ clients: Client[]; totalCount: number }> => {
  // Try Supabase first
  if (isSupabaseConfigured()) {
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
      } else if (data) {
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
          createdDate: new Date(row.created_date).toLocaleDateString(),
          lastActive: formatLastActive(row.last_active),
          totalUsers: row.total_users,
          monthlyRevenue: parseFloat(row.monthly_revenue || '0'),
        }));

        return { clients, totalCount: count || 0 };
      }
    } catch (err) {
      console.error('Exception loading clients from Supabase:', err);
    }
  }

  // Fallback: Load from localStorage
  console.log('💾 Loading clients from localStorage');
  const localClients = loadClientsFromLocalStorage();
  return { clients: localClients, totalCount: localClients.length };
};

/**
 * Create a new client
 */
export const createClient = async (
  clientData: Omit<Client, 'id' | 'createdDate' | 'lastActive'>,
  userId: string
): Promise<Client> => {
  const newClient: Client = {
    ...clientData,
    id: Date.now().toString(),
    createdDate: new Date().toLocaleDateString(),
    lastActive: 'Just now'
  };

  // Try to save to Supabase first
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          company_name: clientData.companyName,
          contact_name: clientData.contactName,
          email: clientData.email,
          phone: clientData.phone,
          plan: clientData.plan,
          status: clientData.status,
          subscription_id: clientData.subscriptionId,
          total_users: clientData.totalUsers,
          monthly_revenue: clientData.monthlyRevenue,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create client in Supabase:', error);
      } else if (data) {
        console.log('✅ Client created in Supabase');
        newClient.id = data.id;
        // Also save to localStorage as backup
        saveClientToLocalStorage(newClient);
        return newClient;
      }
    } catch (err) {
      console.error('Exception creating client in Supabase:', err);
    }
  }

  // Fallback: Save to localStorage
  console.log('💾 Saving client to localStorage');
  saveClientToLocalStorage(newClient);
  return newClient;
};

/**
 * Update a client
 */
export const updateClient = async (id: string, updates: Partial<Client>): Promise<Client | null> => {
  // Try to update in Supabase first
  if (isSupabaseConfigured()) {
    try {
      const updateData: any = {};
      if (updates.companyName) updateData.company_name = updates.companyName;
      if (updates.contactName) updateData.contact_name = updates.contactName;
      if (updates.email) updateData.email = updates.email;
      if (updates.phone !== undefined) updateData.phone = updates.phone;
      if (updates.plan) updateData.plan = updates.plan;
      if (updates.status) updateData.status = updates.status;
      if (updates.subscriptionId !== undefined) updateData.subscription_id = updates.subscriptionId;
      if (updates.totalUsers !== undefined) updateData.total_users = updates.totalUsers;
      if (updates.monthlyRevenue !== undefined) updateData.monthly_revenue = updates.monthlyRevenue;
      updateData.last_active = new Date().toISOString();

      const { data, error } = await supabase
        .from('clients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Failed to update client in Supabase:', error);
      } else if (data) {
        console.log('✅ Client updated in Supabase');
        const updatedClient: Client = {
          id: data.id,
          companyName: data.company_name,
          contactName: data.contact_name,
          email: data.email,
          phone: data.phone,
          plan: data.plan,
          status: data.status,
          subscriptionId: data.subscription_id,
          createdDate: new Date(data.created_date).toLocaleDateString(),
          lastActive: formatLastActive(data.last_active),
          totalUsers: data.total_users,
          monthlyRevenue: parseFloat(data.monthly_revenue || '0'),
        };
        // Also update localStorage
        updateClientInLocalStorage(id, updates);
        return updatedClient;
      }
    } catch (err) {
      console.error('Exception updating client in Supabase:', err);
    }
  }

  // Fallback: Update in localStorage
  console.log('💾 Updating client in localStorage');
  return updateClientInLocalStorage(id, updates);
};

/**
 * Delete a client
 */
export const deleteClient = async (id: string): Promise<boolean> => {
  // Try to delete from Supabase first
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Failed to delete client from Supabase:', error);
      } else {
        console.log('✅ Client deleted from Supabase');
        // Also delete from localStorage
        deleteClientFromLocalStorage(id);
        return true;
      }
    } catch (err) {
      console.error('Exception deleting client from Supabase:', err);
    }
  }

  // Fallback: Delete from localStorage
  console.log('💾 Deleting client from localStorage');
  return deleteClientFromLocalStorage(id);
};

/**
 * Get client by ID
 */
export const getClientById = async (id: string): Promise<Client | null> => {
  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Failed to get client from Supabase:', error);
      } else if (data) {
        return {
          id: data.id,
          companyName: data.company_name,
          contactName: data.contact_name,
          email: data.email,
          phone: data.phone,
          plan: data.plan,
          status: data.status,
          subscriptionId: data.subscription_id,
          createdDate: new Date(data.created_date).toLocaleDateString(),
          lastActive: formatLastActive(data.last_active),
          totalUsers: data.total_users,
          monthlyRevenue: parseFloat(data.monthly_revenue || '0'),
        };
      }
    } catch (err) {
      console.error('Exception getting client from Supabase:', err);
    }
  }

  // Fallback: Get from localStorage
  const clients = loadClientsFromLocalStorage();
  return clients.find(c => c.id === id) || null;
};

/**
 * Get total revenue
 */
export const getTotalRevenue = async (userId?: string): Promise<number> => {
  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('clients')
        .select('monthly_revenue')
        .eq('status', 'Active');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to get total revenue from Supabase:', error);
      } else if (data) {
        return data.reduce((sum, row) => sum + parseFloat(row.monthly_revenue || '0'), 0);
      }
    } catch (err) {
      console.error('Exception getting total revenue from Supabase:', err);
    }
  }

  // Fallback: Calculate from localStorage
  const clients = loadClientsFromLocalStorage();
  return clients
    .filter(c => c.status === 'Active')
    .reduce((sum, c) => sum + c.monthlyRevenue, 0);
};

/**
 * Get client count by status
 */
export const getClientStats = async (userId?: string) => {
  // Try Supabase first
  if (isSupabaseConfigured()) {
    try {
      let query = supabase.from('clients').select('status');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to get client stats from Supabase:', error);
      } else if (data) {
        return {
          total: data.length,
          active: data.filter(c => c.status === 'Active').length,
          trialing: data.filter(c => c.status === 'Trialing').length,
          cancelled: data.filter(c => c.status === 'Cancelled').length,
          suspended: data.filter(c => c.status === 'Suspended').length,
        };
      }
    } catch (err) {
      console.error('Exception getting client stats from Supabase:', err);
    }
  }

  // Fallback: Calculate from localStorage
  const clients = loadClientsFromLocalStorage();
  return {
    total: clients.length,
    active: clients.filter(c => c.status === 'Active').length,
    trialing: clients.filter(c => c.status === 'Trialing').length,
    cancelled: clients.filter(c => c.status === 'Cancelled').length,
    suspended: clients.filter(c => c.status === 'Suspended').length,
  };
};

// ============ LocalStorage Helper Functions ============

function loadClientsFromLocalStorage(): Client[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load clients from localStorage:', error);
  }
  // Initialize with demo data if nothing in storage
  saveClientsToLocalStorage(INITIAL_CLIENTS);
  return INITIAL_CLIENTS;
}

function saveClientsToLocalStorage(clients: Client[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch (error) {
    console.error('Failed to save clients to localStorage:', error);
  }
}

function saveClientToLocalStorage(client: Client): void {
  const clients = loadClientsFromLocalStorage();
  clients.push(client);
  saveClientsToLocalStorage(clients);
}

function updateClientInLocalStorage(id: string, updates: Partial<Client>): Client | null {
  const clients = loadClientsFromLocalStorage();
  const index = clients.findIndex(c => c.id === id);
  if (index !== -1) {
    clients[index] = { ...clients[index], ...updates };
    saveClientsToLocalStorage(clients);
    return clients[index];
  }
  return null;
}

function deleteClientFromLocalStorage(id: string): boolean {
  const clients = loadClientsFromLocalStorage();
  const filtered = clients.filter(c => c.id !== id);
  if (filtered.length < clients.length) {
    saveClientsToLocalStorage(filtered);
    return true;
  }
  return false;
}

function formatLastActive(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}
