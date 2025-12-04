// Client Signup Service - Manage client onboarding forms
import { Client } from '../types';

const PENDING_SIGNUPS_KEY = 'think-abc-pending-signups';

export interface PendingSignup {
  token: string;
  clientId: string;
  email: string;
  companyName: string;
  createdAt: string;
  expiresAt: string;
  completed: boolean;
}

export interface ClientSignupData {
  companyName: string;
  industry: string;
  size: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  notes?: string;
}

// Generate a unique token for the signup form
const generateToken = (): string => {
  return `signup_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// Create a pending signup and return the signup link
export const createClientSignup = (clientId: string, email: string, companyName: string): { token: string; link: string } => {
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  const pendingSignup: PendingSignup = {
    token,
    clientId,
    email,
    companyName,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    completed: false
  };

  // Save to localStorage
  const signups = getPendingSignups();
  signups.push(pendingSignup);
  localStorage.setItem(PENDING_SIGNUPS_KEY, JSON.stringify(signups));

  // Generate the signup link
  const link = `${window.location.origin}${window.location.pathname}#/client-signup/${token}`;

  return { token, link };
};

// Get all pending signups
export const getPendingSignups = (): PendingSignup[] => {
  const signupsStr = localStorage.getItem(PENDING_SIGNUPS_KEY);
  if (!signupsStr) return [];

  try {
    return JSON.parse(signupsStr);
  } catch {
    return [];
  }
};

// Get a specific signup by token
export const getSignupByToken = (token: string): PendingSignup | null => {
  const signups = getPendingSignups();
  const signup = signups.find(s => s.token === token);

  if (!signup) return null;

  // Check if expired
  if (new Date(signup.expiresAt) < new Date()) {
    return null;
  }

  return signup;
};

// Mark signup as completed
export const completeSignup = (token: string, data: ClientSignupData): void => {
  const signups = getPendingSignups();
  const updatedSignups = signups.map(s =>
    s.token === token ? { ...s, completed: true } : s
  );
  localStorage.setItem(PENDING_SIGNUPS_KEY, JSON.stringify(updatedSignups));

  // Store the completed signup data
  const completedKey = `think-abc-signup-data-${token}`;
  localStorage.setItem(completedKey, JSON.stringify(data));
};

// Get completed signup data
export const getSignupData = (token: string): ClientSignupData | null => {
  const completedKey = `think-abc-signup-data-${token}`;
  const dataStr = localStorage.getItem(completedKey);
  if (!dataStr) return null;

  try {
    return JSON.parse(dataStr);
  } catch {
    return null;
  }
};

// Send email with signup link (simulated for demo)
export const sendSignupEmail = (email: string, companyName: string, link: string): void => {
  console.log('📧 Sending signup email:');
  console.log('To:', email);
  console.log('Subject: Complete Your Think ABC Client Registration');
  console.log('Link:', link);

  // In production, this would call a backend API to send actual email
  // For now, we'll just log it and copy to clipboard
};
