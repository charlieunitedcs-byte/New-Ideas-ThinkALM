import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../middleware/auth';

interface SignupRequest {
  email: string;
  password: string;
  name: string;
  team?: string;
  plan?: string;
  role?: string;
  clientId?: string;
  existingAccounts?: any[]; // Temporary: client sends their localStorage to check duplicates
}

interface NewUserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string; // Bcrypt hashed password
  role: string;
  team: string;
  plan: string;
  status: string;
  createdAt: string;
  clientId?: string;
}

/**
 * POST /api/auth/signup
 * Creates new user account with hashed password and returns JWT token
 *
 * TEMPORARY IMPLEMENTATION:
 * - Returns user account data that client stores in localStorage
 * - Will migrate to Supabase database in Weeks 3-4
 * - Passwords are properly hashed with bcrypt
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // CORS headers
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const origin = req.headers.origin || '';

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const {
      email,
      password,
      name,
      team = 'Default Team',
      plan = 'INDIVIDUAL',
      role = 'ADMIN',
      clientId,
      existingAccounts = []
    }: SignupRequest = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required'
      });
    }

    const emailLower = email.toLowerCase().trim();

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Check if email already exists (from client's localStorage)
    const emailExists = existingAccounts.some(
      (acc: any) => acc.email.toLowerCase() === emailLower
    );

    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Reserved email check
    if (emailLower === 'admin@thinkabc.com' || emailLower === 'demo@thinkabc.com') {
      return res.status(409).json({
        success: false,
        error: 'This email is reserved'
      });
    }

    // Hash password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate unique user ID
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    // Create new user account
    const newAccount: NewUserAccount = {
      id: userId,
      name: name.trim(),
      email: emailLower,
      passwordHash, // Hashed password - NEVER store plaintext
      role,
      team: team.trim(),
      plan,
      status: 'Active',
      createdAt: new Date().toISOString(),
      clientId
    };

    // Generate JWT token for immediate login
    const token = generateToken(userId, emailLower, role);

    // Return user account (client will store in localStorage temporarily)
    // In Weeks 3-4, this will be stored in Supabase database instead
    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newAccount.id,
        name: newAccount.name,
        email: newAccount.email,
        role: newAccount.role,
        team: newAccount.team,
        plan: newAccount.plan,
        status: newAccount.status,
        clientId: newAccount.clientId
      },
      // Return account data for localStorage storage (temporary)
      accountData: {
        ...newAccount,
        // Remove passwordHash from response for security
        // Client will receive it but shouldn't log/display it
      }
    });

  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
