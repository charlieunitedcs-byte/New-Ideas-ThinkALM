import { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import { generateToken } from '../../middleware/auth';

// Super Admin credentials (hardcoded for demo - will migrate to database)
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || 'admin@thinkabc.com';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'ThinkABC2024!';

// Demo user credentials
const DEMO_EMAIL = 'demo@thinkabc.com';
const DEMO_PASSWORD = 'demo123';

interface LoginRequest {
  email: string;
  password: string;
}

interface StoredUserAccount {
  id: string;
  name: string;
  email: string;
  password: string; // Will be hashed for new users
  passwordHash?: string; // New field for bcrypt hashes
  role: string;
  team: string;
  plan: string;
  status: string;
  createdAt: string;
  clientId?: string;
}

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token
 *
 * TEMPORARY IMPLEMENTATION:
 * - Currently reads from localStorage via request body (client sends stored accounts)
 * - Will migrate to Supabase database in Weeks 3-4
 * - Supports both plaintext (legacy) and bcrypt hashed passwords
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
    const { email, password }: LoginRequest = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const emailLower = email.toLowerCase().trim();

    // Check Super Admin
    if (emailLower === SUPER_ADMIN_EMAIL.toLowerCase()) {
      if (password === SUPER_ADMIN_PASSWORD) {
        const token = generateToken('super-admin-1', emailLower, 'SUPER_ADMIN');

        return res.status(200).json({
          success: true,
          token,
          user: {
            id: 'super-admin-1',
            name: 'Super Admin',
            email: emailLower,
            role: 'SUPER_ADMIN',
            team: 'Admin',
            plan: 'ENTERPRISE',
            status: 'Active'
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }
    }

    // Check Demo User
    if (emailLower === DEMO_EMAIL.toLowerCase() && password === DEMO_PASSWORD) {
      const token = generateToken('demo-1', emailLower, 'ADMIN');

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: 'demo-1',
          name: 'Demo User',
          email: emailLower,
          role: 'ADMIN',
          team: 'Demo Team',
          plan: 'COMPANY',
          status: 'Active'
        }
      });
    }

    // TEMPORARY: Get user accounts from request body
    // (Client will send their localStorage data until we migrate to database)
    const { storedAccounts = [] } = req.body;

    // Find user account
    const account = storedAccounts.find(
      (acc: StoredUserAccount) => acc.email.toLowerCase() === emailLower
    );

    if (!account) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password (supports both plaintext legacy and bcrypt hashed)
    let isPasswordValid = false;

    if (account.passwordHash) {
      // New bcrypt hashed password
      isPasswordValid = await bcrypt.compare(password, account.passwordHash);
    } else if (account.password) {
      // Legacy plaintext password (will be migrated)
      isPasswordValid = account.password === password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(account.id, account.email, account.role);

    // Return success with token and user data
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        team: account.team,
        plan: account.plan,
        status: account.status,
        clientId: account.clientId
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
