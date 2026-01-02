import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthenticatedRequest extends VercelRequest {
  userId?: string;
  userEmail?: string;
  userRole?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Middleware to verify JWT token and authenticate requests
 * Usage: await verifyAuth(req, res) at the start of protected endpoints
 */
export async function verifyAuth(
  req: AuthenticatedRequest,
  res: VercelResponse
): Promise<boolean> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized - No token provided'
      });
      return false;
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Attach user info to request object
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;

    return true;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: 'Token expired - Please login again'
      });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Authentication failed'
      });
    }
    return false;
  }
}

/**
 * Generate JWT token for authenticated user
 */
export function generateToken(userId: string, email: string, role: string): string {
  const payload: JWTPayload = {
    userId,
    email,
    role,
  };

  // Token expires in 7 days
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Optional: Verify specific role (ADMIN, MEMBER, etc.)
 */
export function verifyRole(
  req: AuthenticatedRequest,
  res: VercelResponse,
  requiredRole: string
): boolean {
  if (req.userRole !== requiredRole) {
    res.status(403).json({
      success: false,
      error: `Forbidden - ${requiredRole} role required`
    });
    return false;
  }
  return true;
}
