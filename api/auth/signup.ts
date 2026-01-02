import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../middleware/auth';
import { getUserByEmail, createUser, isSupabaseConfigured } from '../../utils/supabaseServer';

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
 * Week 2: Database Migration
 * - Saves user to Supabase database
 * - Also returns data for localStorage (backward compatibility)
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

    // Reserved email check
    if (emailLower === 'admin@thinkabc.com' || emailLower === 'demo@thinkabc.com') {
      return res.status(409).json({
        success: false,
        error: 'This email is reserved'
      });
    }

    // Check if email already exists in database
    if (isSupabaseConfigured()) {
      const existingUser = await getUserByEmail(emailLower);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }
    } else {
      // Fallback: check localStorage accounts
      const emailExists = existingAccounts.some(
        (acc: any) => acc.email.toLowerCase() === emailLower
      );

      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: 'Email already registered'
        });
      }
    }

    // Hash password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in Supabase database
    if (isSupabaseConfigured()) {
      try {
        const dbUser = await createUser({
          email: emailLower,
          password_hash: passwordHash,
          name: name.trim(),
          role,
          team: team.trim(),
          plan,
          status: 'Active'
        });

        if (!dbUser) {
          throw new Error('Failed to create user in database');
        }

        // Generate JWT token for immediate login
        const token = generateToken(dbUser.id, dbUser.email, dbUser.role);

        console.log(`✅ SIGNUP (Database) | ${dbUser.email} | User ID: ${dbUser.id}`);

        // Return user account
        return res.status(201).json({
          success: true,
          token,
          user: {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            team: dbUser.team,
            plan: dbUser.plan,
            status: dbUser.status
          }
        });
      } catch (error: any) {
        if (error.message === 'Email already exists') {
          return res.status(409).json({
            success: false,
            error: 'Email already registered'
          });
        }
        throw error;
      }
    }

    // Fallback: localStorage mode (backward compatibility)
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

    const newAccount: NewUserAccount = {
      id: userId,
      name: name.trim(),
      email: emailLower,
      passwordHash,
      role,
      team: team.trim(),
      plan,
      status: 'Active',
      createdAt: new Date().toISOString(),
      clientId
    };

    // Generate JWT token for immediate login
    const token = generateToken(userId, emailLower, role);

    console.log(`✅ SIGNUP (localStorage fallback) | ${emailLower}`);

    // Return user account (client will store in localStorage)
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
      accountData: newAccount
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
