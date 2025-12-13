import React, { useContext, useState, useEffect } from 'react';
import { User as UserIcon, MoreVertical, Shield, CreditCard, CheckCircle, XCircle, Search, Filter, Users as UsersIcon } from 'lucide-react';
import { User, UserRole, SubscriptionPlan } from '../types';
import { NotificationContext } from '../App';
import { getCurrentUser, isSuperAdmin } from '../services/authService';

const mockUsers: User[] = [
  { id: '1', name: 'Alex Chen', email: 'alex@company.com', role: UserRole.ADMIN, team: 'Sales Alpha', plan: SubscriptionPlan.COMPANY, status: 'Active', lastLogin: '2 mins ago', avatarUrl: 'https://picsum.photos/seed/1/100' },
  { id: '2', name: 'Sarah Miller', email: 'sarah@company.com', role: UserRole.MEMBER, team: 'Sales Alpha', plan: SubscriptionPlan.COMPANY, status: 'Active', lastLogin: '1 day ago', avatarUrl: 'https://picsum.photos/seed/2/100' },
  { id: '3', name: 'James Wilson', email: 'james@company.com', role: UserRole.MEMBER, team: 'Sales Alpha', plan: SubscriptionPlan.COMPANY, status: 'Trialing', lastLogin: '5 hours ago', avatarUrl: 'https://picsum.photos/seed/3/100' },
  { id: '4', name: 'Emily Davis', email: 'emily@company.com', role: UserRole.MEMBER, team: 'Sales Bravo', plan: SubscriptionPlan.TEAM, status: 'Active', lastLogin: '2 days ago', avatarUrl: 'https://picsum.photos/seed/4/100' },
  { id: '5', name: 'Michael Brown', email: 'michael@company.com', role: UserRole.MEMBER, team: 'Sales Bravo', plan: SubscriptionPlan.TEAM, status: 'Cancelled', lastLogin: '1 week ago', avatarUrl: 'https://picsum.photos/seed/5/100' },
];

const AdminUsers: React.FC = () => {
  const { notify } = useContext(NotificationContext);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [displayUsers, setDisplayUsers] = useState<User[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);

    if (user) {
      if (isSuperAdmin(user)) {
        // Super admin sees all users (mock data for demo)
        setDisplayUsers(mockUsers);
      } else if (user.role === 'ADMIN') {
        // Admins see only their team members
        const teamMembers = mockUsers.filter(u => u.team === user.team);
        setDisplayUsers(teamMembers);
      } else {
        // Regular members see only their team members (but can't add)
        const teamMembers = mockUsers.filter(u => u.team === user.team);
        setDisplayUsers(teamMembers);
      }
    }
  }, []);

  const showSuperAdminData = isSuperAdmin(currentUser);
  const isAdmin = currentUser?.role === 'ADMIN';
  const canAddMembers = showSuperAdminData || isAdmin;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Access</h1>
          <p className="text-slate-400">
            {showSuperAdminData
              ? 'Manage team roles, permissions, and subscriptions.'
              : isAdmin
              ? `Manage your team (${currentUser?.team}).`
              : 'View your team members.'}
          </p>
        </div>
        {canAddMembers && (
          <button
            onClick={() => notify(`Demo: In production, an invitation email would be sent to join ${isAdmin && !showSuperAdminData ? currentUser?.team : 'the team'}.`, "info")}
            className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-brand-500/25"
          >
            + Add Team Member
          </button>
        )}
      </div>

      {displayUsers.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 border border-slate-800/50 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <UsersIcon size={40} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">No Team Members Yet</h3>
            <p className="text-slate-400 mb-6">
              {isAdmin
                ? 'Add team members to start building your team.'
                : 'Your team members will appear here once they\'re added to your team.'}
            </p>
            {isAdmin && (
              <button
                onClick={() => notify(`Demo: In production, an invitation email would be sent to join ${currentUser?.team}.`, "info")}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-medium shadow-lg shadow-brand-500/25 transition-all"
              >
                Add Your First Team Member
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Stats Row - Only for Super Admin */}
          {showSuperAdminData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel border border-slate-800/50 p-6 rounded-2xl">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Users</p>
            <p className="text-3xl font-bold text-white mt-1">1,240</p>
        </div>
        <div className="glass-panel border border-slate-800/50 p-6 rounded-2xl">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Users</p>
            <p className="text-3xl font-bold text-emerald-400 mt-1">1,185</p>
        </div>
        <div className="glass-panel border border-slate-800/50 p-6 rounded-2xl">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Pro Plan</p>
            <p className="text-3xl font-bold text-brand-400 mt-1">850</p>
        </div>
        <div className="glass-panel border border-slate-800/50 p-6 rounded-2xl">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">MRR</p>
            <p className="text-3xl font-bold text-white mt-1">$54.2k</p>
        </div>
            </div>
          )}

          {/* Team Info Badge - For Admins */}
          {isAdmin && !showSuperAdminData && (
            <div className="bg-brand-900/20 border border-brand-500/30 rounded-xl p-4 flex items-center gap-3">
              <UsersIcon size={20} className="text-brand-400" />
              <div>
                <p className="text-sm font-bold text-white">Team: {currentUser?.team}</p>
                <p className="text-xs text-slate-400">Managing {displayUsers.length} team member{displayUsers.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              type="text"
              placeholder={`Search ${isAdmin && !showSuperAdminData ? 'team members' : 'users'} by name or email...`}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 outline-none focus:border-brand-500"
              onChange={() => {}}
            />
        </div>
        <button
          onClick={() => notify("Advanced filters applied.")}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm font-medium text-slate-300 hover:text-white"
        >
            <Filter size={16} /> Filter
        </button>
          </div>

          {/* Table */}
          <div className="glass-panel border border-slate-800/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800/50 text-xs text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-5 font-bold">User</th>
                <th className="px-6 py-5 font-bold">Role</th>
                <th className="px-6 py-5 font-bold">Team</th>
                <th className="px-6 py-5 font-bold">Plan</th>
                <th className="px-6 py-5 font-bold">Status</th>
                <th className="px-6 py-5 font-bold">Last Login</th>
                <th className="px-6 py-5 font-bold text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {displayUsers.map((user) => (
                <tr key={user.id} className="hover:bg-brand-900/10 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={user.avatarUrl} alt="" className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-800 group-hover:border-brand-500/50 transition-colors" />
                      <div>
                        <p className="text-sm font-bold text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {user.role === UserRole.ADMIN ? (
                        <Shield size={14} className="text-brand-400" />
                      ) : (
                        <UserIcon size={14} className="text-slate-500" />
                      )}
                      <span className={`text-sm font-medium ${user.role === UserRole.ADMIN ? 'text-brand-300' : 'text-slate-300'}`}>
                        {user.role === UserRole.ADMIN ? 'Admin' : 'Member'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">
                    <span className="bg-slate-900 px-3 py-1 rounded-full border border-slate-800 text-xs font-medium">
                        {user.team}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <CreditCard size={14} className="text-slate-500" />
                       <span className="text-sm text-slate-300">{user.plan}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border ${
                      user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      user.status === 'Trialing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
            {showSuperAdminData && (
              <div className="px-6 py-4 border-t border-slate-800/50 bg-slate-900/30 flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>Showing {displayUsers.length} of 1240 results</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => notify("Already at start.")}
                    className="px-3 py-1.5 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => notify("Loading more users...")}
                    className="px-3 py-1.5 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminUsers;