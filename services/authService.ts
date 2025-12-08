// Authentication Service - Super Admin Login

import { User, UserRole, SubscriptionPlan } from '../types';

// Super Admin Credentials (In production, this would be environment variables or backend auth)
const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'admin@thinkabc.com';
const SUPER_ADMIN_PASSWORD = import.meta.env.VITE_SUPER_ADMIN_PASSWORD || 'ThinkABC2024!';
const USER_ACCOUNTS_KEY = 'think-abc-user-accounts';

// User account storage interface
interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  password: string; // In production, this would be hashed
  role: UserRole;
  team: string;
  plan: SubscriptionPlan;
  status: 'Active' | 'Trialing' | 'Cancelled';
  createdAt: string;
  clientId?: string; // Link to client record
}

// Get all stored user accounts
const getStoredAccounts = (): StoredUserAccount[] => {
  try {
    const stored = localStorage.getItem(USER_ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save user accounts
const saveStoredAccounts = (accounts: StoredUserAccount[]): void => {
  localStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(accounts));
};

// Create a new user account
export const createUserAccount = (
  email: string,
  password: string,
  name: string,
  team: string,
  plan: SubscriptionPlan,
  role: UserRole = UserRole.ADMIN,
  clientId?: string
): User => {
  const accounts = getStoredAccounts();

  // Check if email already exists
  const existingAccount = accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase());
  if (existingAccount) {
    throw new Error('Email already registered');
  }

  const newAccount: StoredUserAccount = {
    id: `user-${Date.now()}`,
    name,
    email,
    password, // WARNING: In production, hash this!
    role,
    team,
    plan,
    status: 'Active',
    createdAt: new Date().toISOString(),
    clientId
  };

  accounts.push(newAccount);
  saveStoredAccounts(accounts);

  // Send notification to admin
  sendSignupNotification(email, name, team);

  return {
    id: newAccount.id,
    name: newAccount.name,
    email: newAccount.email,
    role: newAccount.role,
    team: newAccount.team,
    plan: newAccount.plan,
    status: newAccount.status,
    lastLogin: new Date().toLocaleString(),
    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`
  };
};

// Send signup notification to admin
const sendSignupNotification = (email: string, name: string, company: string): void => {
  console.log('📧 Sending signup notification to charlie@thinkalm.ai');
  console.log('New Signup Details:');
  console.log('- Name:', name);
  console.log('- Email:', email);
  console.log('- Company:', company);
  console.log('- Timestamp:', new Date().toLocaleString());

  // In production, this would call a backend API to send actual email
  // Example: fetch('/api/notify-signup', { method: 'POST', body: JSON.stringify({ email, name, company }) })
};

export const authenticateUser = (email: string, password: string): User | null => {
  // Check if Super Admin credentials
  if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && password === SUPER_ADMIN_PASSWORD) {
    return {
      id: 'super-admin-1',
      name: 'Super Administrator',
      email: SUPER_ADMIN_EMAIL,
      role: UserRole.SUPER_ADMIN,
      team: 'Platform Management',
      plan: SubscriptionPlan.COMPANY,
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
      plan: SubscriptionPlan.COMPANY,
      status: 'Active',
      lastLogin: new Date().toLocaleString(),
      avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff'
    };
  }

  // Check stored user accounts
  const accounts = getStoredAccounts();
  const account = accounts.find(
    acc => acc.email.toLowerCase() === email.toLowerCase() && acc.password === password
  );

  if (account) {
    return {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
      team: account.team,
      plan: account.plan,
      status: account.status,
      lastLogin: new Date().toLocaleString(),
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name)}&background=3b82f6&color=fff`
    };
  }

  return null;
};

export const isAuth = (): boolean => {
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

// Update user email with password verification
export const updateUserEmail = (newEmail: string, currentPassword: string): { success: boolean; message: string; user?: User } => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: 'No user session found' };
  }

  // Verify current password (in production, this would be a backend call)
  const authenticatedUser = authenticateUser(currentUser.email, currentPassword);
  if (!authenticatedUser) {
    return { success: false, message: 'Current password is incorrect' };
  }

  // Update email
  const updatedUser: User = {
    ...currentUser,
    email: newEmail
  };

  saveUserSession(updatedUser);
  return { success: true, message: 'Email updated successfully', user: updatedUser };
};

// Update user password with current password verification
export const updateUserPassword = (currentPassword: string, newPassword: string): { success: boolean; message: string } => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: 'No user session found' };
  }

  // Verify current password (in production, this would be a backend call)
  const authenticatedUser = authenticateUser(currentUser.email, currentPassword);
  if (!authenticatedUser) {
    return { success: false, message: 'Current password is incorrect' };
  }

  // In a real application, you would hash the password and send it to the backend
  // For this demo, we'll just show a success message
  // The password is not stored in localStorage for security reasons

  return { success: true, message: 'Password updated successfully' };
};
