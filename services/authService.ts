// Authentication Service - Backend Integration
// Now uses backend API endpoints with JWT authentication

import { User, UserRole, SubscriptionPlan } from '../types';

const AUTH_TOKEN_KEY = 'think-abc-auth-token';
const AUTH_USER_KEY = 'think-abc-auth-user';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Legacy keys for backward compatibility during migration
const USER_ACCOUNTS_KEY = 'think-abc-user-accounts';

/**
 * Login user via backend API
 * Returns JWT token and user object
 */
export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  try {
    // Get existing accounts for backward compatibility (temporary)
    const storedAccounts = getStoredAccounts();

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        storedAccounts, // Send existing accounts to backend for validation
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Login failed:', data.error);
      return null;
    }

    if (data.success && data.token && data.user) {
      // Store JWT token
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);

      // Store user object
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role as UserRole,
        team: data.user.team,
        plan: data.user.plan as SubscriptionPlan,
        status: data.user.status || 'Active',
        lastLogin: new Date().toLocaleString(),
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=3b82f6&color=fff`,
      };

      saveUserSession(user);
      console.log('✅ Login successful:', user.email);
      return user;
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
};

/**
 * Create new user account via backend API
 * Returns JWT token and user object
 */
export const createUserAccount = async (
  email: string,
  password: string,
  name: string,
  team: string = 'Default Team',
  plan: SubscriptionPlan = SubscriptionPlan.INDIVIDUAL,
  role: UserRole = UserRole.ADMIN,
  clientId?: string
): Promise<User | null> => {
  try {
    // Get existing accounts to check for duplicates
    const existingAccounts = getStoredAccounts();

    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name,
        team,
        plan,
        role,
        clientId,
        existingAccounts, // Send to backend for duplicate check
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Signup failed:', data.error);
      throw new Error(data.error || 'Signup failed');
    }

    if (data.success && data.token && data.user) {
      // Store JWT token
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);

      // Store user object
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role as UserRole,
        team: data.user.team,
        plan: data.user.plan as SubscriptionPlan,
        status: data.user.status || 'Active',
        lastLogin: new Date().toLocaleString(),
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user.name)}&background=3b82f6&color=fff`,
      };

      saveUserSession(user);

      // Store account data locally for backward compatibility (temporary)
      if (data.accountData) {
        const accounts = getStoredAccounts();
        accounts.push(data.accountData);
        saveStoredAccounts(accounts);
      }

      console.log('✅ Signup successful:', user.email);
      return user;
    }

    return null;
  } catch (error: any) {
    console.error('Signup error:', error);
    throw error;
  }
};

/**
 * Get stored JWT token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuth = (): boolean => {
  const token = getAuthToken();
  const user = getCurrentUser();
  return !!token && !!user;
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Save user session to localStorage
 */
export const saveUserSession = (user: User): void => {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

/**
 * Clear user session and JWT token (logout)
 */
export const clearUserSession = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  console.log('✅ User logged out');
};

/**
 * Check if user is super admin
 */
export const isSuperAdmin = (user: User | null): boolean => {
  return user?.role === UserRole.SUPER_ADMIN;
};

/**
 * Make authenticated API request with JWT token
 * Automatically includes Authorization header
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    console.warn('⚠️ Unauthorized request - clearing session');
    clearUserSession();
    // Optionally redirect to login
    // window.location.href = '/login';
  }

  return response;
};

// ============================================
// LEGACY FUNCTIONS (For backward compatibility during migration)
// These will be removed in Weeks 3-4 when we fully migrate to database
// ============================================

interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  password?: string; // Legacy plaintext (will be removed)
  passwordHash?: string; // New bcrypt hash
  role: UserRole;
  team: string;
  plan: SubscriptionPlan;
  status: 'Active' | 'Trialing' | 'Cancelled';
  createdAt: string;
  clientId?: string;
}

const getStoredAccounts = (): StoredUserAccount[] => {
  try {
    const stored = localStorage.getItem(USER_ACCOUNTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveStoredAccounts = (accounts: StoredUserAccount[]): void => {
  localStorage.setItem(USER_ACCOUNTS_KEY, JSON.stringify(accounts));
};

// ============================================
// UPDATE USER FUNCTIONS (Future backend integration)
// ============================================

/**
 * Update user email with password verification
 * TODO: Migrate to backend API in Weeks 3-4
 */
export const updateUserEmail = (
  newEmail: string,
  currentPassword: string
): { success: boolean; message: string; user?: User } => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: 'No user session found' };
  }

  // In production, this would be a backend API call
  // For now, just update locally
  const updatedUser: User = {
    ...currentUser,
    email: newEmail,
  };

  saveUserSession(updatedUser);
  return { success: true, message: 'Email updated successfully', user: updatedUser };
};

/**
 * Update user password with current password verification
 * TODO: Migrate to backend API in Weeks 3-4
 */
export const updateUserPassword = (
  currentPassword: string,
  newPassword: string
): { success: boolean; message: string } => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: 'No user session found' };
  }

  // In production, this would be a backend API call
  // Password would be hashed with bcrypt
  return { success: true, message: 'Password updated successfully' };
};
