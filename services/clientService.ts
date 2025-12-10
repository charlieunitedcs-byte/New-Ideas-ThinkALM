// Client Management Service

import { Client, SubscriptionPlan } from '../types';

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

// Load clients from localStorage
export const loadClients = (): Client[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load clients:', error);
  }
  // Initialize with demo data if nothing in storage
  saveClients(INITIAL_CLIENTS);
  return INITIAL_CLIENTS;
};

// Save clients to localStorage
export const saveClients = (clients: Client[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch (error) {
    console.error('Failed to save clients:', error);
    throw error;
  }
};

// Create a new client
export const createClient = (clientData: Omit<Client, 'id' | 'createdDate' | 'lastActive'>): Client => {
  const clients = loadClients();
  const newClient: Client = {
    ...clientData,
    id: Date.now().toString(),
    createdDate: new Date().toLocaleDateString(),
    lastActive: 'Just now'
  };
  clients.push(newClient);
  saveClients(clients);
  return newClient;
};

// Update a client
export const updateClient = (id: string, updates: Partial<Client>): Client | null => {
  const clients = loadClients();
  const index = clients.findIndex(c => c.id === id);
  if (index !== -1) {
    clients[index] = { ...clients[index], ...updates };
    saveClients(clients);
    return clients[index];
  }
  return null;
};

// Delete a client
export const deleteClient = (id: string): boolean => {
  const clients = loadClients();
  const filtered = clients.filter(c => c.id !== id);
  if (filtered.length < clients.length) {
    saveClients(filtered);
    return true;
  }
  return false;
};

// Get client by ID
export const getClientById = (id: string): Client | null => {
  const clients = loadClients();
  return clients.find(c => c.id === id) || null;
};

// Get total revenue
export const getTotalRevenue = (): number => {
  const clients = loadClients();
  return clients
    .filter(c => c.status === 'Active')
    .reduce((sum, c) => sum + c.monthlyRevenue, 0);
};

// Get client count by status
export const getClientStats = () => {
  const clients = loadClients();
  return {
    total: clients.length,
    active: clients.filter(c => c.status === 'Active').length,
    trialing: clients.filter(c => c.status === 'Trialing').length,
    cancelled: clients.filter(c => c.status === 'Cancelled').length,
    suspended: clients.filter(c => c.status === 'Suspended').length
  };
};
