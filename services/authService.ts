// Authentication Service - Super Admin Login

import { User, UserRole, SubscriptionPlan } from '../types';

// Super Admin Credentials (In production, this would be environment variables or backend auth)
const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@thinkabc.com';
const SUPER_ADMIN_PASSWORD = import.meta.env.VITE_SUPER_ADMIN_PASSWORD || 'ThinkABC2024!';

export const authenticateUser = (email: string, password: string): User | null => {
  // Check if Super Admin credentials
  if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && password === SUPER_ADMIN_PASSWORD) {
    return {
      id: 'super-admin-1',
      name: 'Super Administrator',
      email: SUPER_ADMIN_EMAIL,
      role: UserRole.SUPER_ADMIN,
      team: 'Platform Management',
      plan: SubscriptionPlan.PRO,
      status: 'Active',
      lastLogin: new Date().toLocaleString(),
      avatarUrl: 'https://ui-avatars.com/api/?name=Super+Admin&background=ef4444&color=fff'
    };
  }

  // Demo logins for testing (can be removed in production)
  if (email.toLowerCase() === 'demo@thinkabc.com' && password === 'demo123') {
    return {
      id: 'demo-1',
      name: 'Demo User',
      email: 'demo@thinkabc.com',
      role: UserRole.ADMIN,
      team: 'Demo Team',
      plan: SubscriptionPlan.PRO,
      status: 'Active',
      lastLogin: new Date().toLocaleString(),
      avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff'
    };
  }

  return null;
};

export const isAuth = ():</s> boolean => {
  return localStorage.getItem('think-abc-auth-user') !== null;
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('think-abc-auth-user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const saveUserSession = (user: User): void => {
  localStorage.setItem('think-abc-auth-user', JSON.stringify(user));
};

export const clearUserSession = (): void => {
  localStorage.removeItem('think-abc-auth-user');
};

export const isSuperAdmin = (user: User | null): boolean => {
  return user?.role === UserRole.SUPER_ADMIN;
};
