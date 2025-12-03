import React, { useState, useEffect, useContext } from 'react';
import { Users, Plus, Search, Filter, DollarSign, TrendingUp, Building, Trash2, Edit, Check, X, CreditCard } from 'lucide-react';
import { Client, SubscriptionPlan, User, UserRole } from '../types';
import { loadClients, createClient, deleteClient, updateClient, getTotalRevenue, getClientStats } from '../services/clientService';
import { NotificationContext } from '../App';

interface ClientManagementProps {
  currentUser: User;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ currentUser }) => {
  const { notify } = useContext(NotificationContext);
  const [clients, setClients] = useState<Client[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  // New client form
  const [newClient, setNewClient] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    plan: SubscriptionPlan.ESSENTIALS,
    status: 'Trialing' as const,
    totalUsers: 1,
    monthlyRevenue: 0
  });

  // Stripe settings
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');

  useEffect(() => {
    refreshClients();
    loadStripeSettings();
  }, []);

  const refreshClients = () => {
    setClients(loadClients());
  };

  const loadStripeSettings = () => {
    const pubKey = localStorage.getItem('stripe-publishable-key') || '';
    const secKey = localStorage.getItem('stripe-secret-key') || '';
    setStripePublishableKey(pubKey);
    setStripeSecretKey(secKey);
  };

  const saveStripeSettings = () => {
    localStorage.setItem('stripe-publishable-key', stripePublishableKey);
    localStorage.setItem('stripe-secret-key', stripeSecretKey);
    notify('Stripe configuration saved successfully!', 'success');
    setShowStripeModal(false);
  };

  const handleAddClient = () => {
    if (!newClient.companyName || !newClient.email) {
      notify('Company name and email are required', 'error');
      return;
    }

    try {
      createClient(newClient);
      notify(`Client "${newClient.companyName}" added successfully!`, 'success');
      setShowAddModal(false);
      setNewClient({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        plan: SubscriptionPlan.ESSENTIALS,
        status: 'Trialing',
        totalUsers: 1,
        monthlyRevenue: 0
      });
      refreshClients();
    } catch (error) {
      notify('Failed to add client', 'error');
    }
  };

  const handleDeleteClient = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      if (deleteClient(id)) {
        notify(`Client "${name}" deleted successfully`, 'success');
        refreshClients();
      } else {
        notify('Failed to delete client', 'error');
      }
    }
  };

  const stats = getClientStats();
  const totalRevenue = getTotalRevenue();

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Access control
  if (currentUser.role !== UserRole.SUPER_ADMIN) {
    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
          <Users size={40} className="text-brand-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Super Admin Only</h1>
        <p className="text-slate-400 max-w-md text-center">
          Client management is restricted to super administrators only.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building className="text-brand-400" size={32} /> Client Management
          </h1>
          <p className="text-slate-400 mt-1">Manage all client accounts and subscriptions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowStripeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors border border-slate-700"
          >
            <CreditCard size={18} /> Stripe Settings
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-colors font-bold shadow-lg shadow-brand-500/25"
          >
            <Plus size={18} /> Add Client
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel border border-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-brand-900/30 rounded-xl border border-brand-500/30">
              <Users className="text-brand-400" size={24} />
            </div>
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Total Clients</p>
        </div>

        <div className="glass-panel border border-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-900/30 rounded-xl border border-emerald-500/30">
              <Check className="text-emerald-400" size={24} />
            </div>
            <span className="text-2xl font-bold text-white">{stats.active}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Active Subscriptions</p>
        </div>

        <div className="glass-panel border border-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-900/30 rounded-xl border border-amber-500/30">
              <TrendingUp className="text-amber-400" size={24} />
            </div>
            <span className="text-2xl font-bold text-white">{stats.trialing}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Trialing</p>
        </div>

        <div className="glass-panel border border-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-900/30 rounded-xl border border-green-500/30">
              <DollarSign className="text-green-400" size={24} />
            </div>
            <span className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Monthly Recurring Revenue</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-200 outline-none focus:border-brand-500/50 transition-all placeholder:text-slate-600"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-3.5 text-slate-500" size={18} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900/50 border border-slate-800 rounded-xl pl-12 pr-8 py-3 text-slate-200 outline-none focus:border-brand-500/50 transition-all"
          >
            <option>All</option>
            <option>Active</option>
            <option>Trialing</option>
            <option>Cancelled</option>
            <option>Suspended</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="glass-panel border border-slate-800/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50 border-b border-slate-800">
              <tr>
                <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Company</th>
                <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Plan</th>
                <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Users</th>
                <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">MRR</th>
                <th className="text-left p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Last Active</th>
                <th className="text-right p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-bold text-white">{client.companyName}</p>
                      <p className="text-xs text-slate-500">{client.email}</p>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{client.contactName}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      client.plan === SubscriptionPlan.PRO
                        ? 'bg-brand-900/30 border border-brand-500/30 text-brand-300'
                        : 'bg-blue-900/30 border border-blue-500/30 text-blue-300'
                    }`}>
                      {client.plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      client.status === 'Active' ? 'bg-emerald-900/30 border border-emerald-500/30 text-emerald-300' :
                      client.status === 'Trialing' ? 'bg-amber-900/30 border border-amber-500/30 text-amber-300' :
                      'bg-slate-900/30 border border-slate-500/30 text-slate-300'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300">{client.totalUsers}</td>
                  <td className="p-4 text-slate-300 font-bold">${client.monthlyRevenue}</td>
                  <td className="p-4 text-slate-400 text-sm">{client.lastActive}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => notify('Edit functionality coming soon!', 'info')}
                        className="p-2 text-slate-400 hover:text-brand-400 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Client"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id, client.companyName)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                        title="Delete Client"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel border border-slate-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Client</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Company Name *</label>
                <input
                  type="text"
                  value={newClient.companyName}
                  onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500/50"
                  placeholder="Acme Corporation"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Contact Name</label>
                <input
                  type="text"
                  value={newClient.contactName}
                  onChange={(e) => setNewClient({ ...newClient, contactName: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500/50"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Email *</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500/50"
                  placeholder="john@acme.com"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Phone</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500/50"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Plan</label>
                <select
                  value={newClient.plan}
                  onChange={(e) => setNewClient({ ...newClient, plan: e.target.value as SubscriptionPlan })}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500/50"
                >
                  <option value={SubscriptionPlan.ESSENTIALS}>{SubscriptionPlan.ESSENTIALS}</option>
                  <option value={SubscriptionPlan.PRO}>{SubscriptionPlan.PRO}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Total Users</label>
                <input
                  type="number"
                  value={newClient.totalUsers}
                  onChange={(e) => setNewClient({ ...newClient, totalUsers: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500/50"
                  min="1"
                />
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddClient}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-colors font-bold shadow-lg shadow-brand-500/25"
              >
                Add Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Settings Modal */}
      {showStripeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel border border-slate-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <CreditCard className="text-brand-400" size={28} /> Stripe Configuration
            </h2>
            <p className="text-slate-400 mb-6">Connect your Stripe account to enable payment processing for client subscriptions.</p>
            <div className="space-y-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Publishable Key</label>
                <input
                  type="text"
                  value={stripePublishableKey}
                  onChange={(e) => setStripePublishableKey(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500/50 font-mono text-sm"
                  placeholder="pk_live_..."
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Secret Key</label>
                <input
                  type="password"
                  value={stripeSecretKey}
                  onChange={(e) => setStripeSecretKey(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500/50 font-mono text-sm"
                  placeholder="sk_live_..."
                />
              </div>
              <div className="p-4 bg-amber-900/20 border border-amber-500/30 rounded-xl">
                <p className="text-xs text-amber-200">
                  <strong>Security Note:</strong> In production, store API keys securely on your backend server. Never expose secret keys in client-side code.
                </p>
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowStripeModal(false)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveStripeSettings}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-colors font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2"
              >
                <Check size={18} /> Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
