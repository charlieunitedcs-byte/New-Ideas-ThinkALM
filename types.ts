
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER'
}

export enum SubscriptionPlan {
  PER_USER = 'Per User',
  TEAM = 'Team Plan',
  COMPANY = 'Company Unlimited'
}

export enum CallStatus {
  PROCESSED = 'Processed',
  PROCESSING = 'Processing',
  FAILED = 'Failed'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team: string;
  plan: SubscriptionPlan;
  status: 'Active' | 'Trialing' | 'Cancelled';
  lastLogin: string;
  avatarUrl: string;
}

export interface TrainingRecommendation {
  id: string;
  title: string;
  type: 'PDF' | 'VIDEO';
  category: string;
  reason: string;
}

export interface CallAnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  tone: string;
  emotionalIntelligence: number;
  transcript: string;
  recommendedTraining?: TrainingRecommendation[];
}

export interface RoleplayMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface TrainingMaterial {
  id: string;
  title: string;
  type: 'PDF' | 'VIDEO';
  category: string;
  url: string; // Base64 data or URL
  fileName?: string; // Original filename
  fileSize?: number; // File size in bytes
  fileType?: string; // MIME type
  addedBy: string;
  date: string;
  visibility: 'GLOBAL' | 'TEAM'; // New field for access control
  teamId?: string; // Optional, only if visibility is TEAM
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  achievedDate?: string;
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
}

export interface TeamMemberStats {
  id: string;
  name: string;
  callsAnalyzed: number;
  avgScore: number;
  trainingCompleted: number;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'Active' | 'Paused' | 'Completed';
  startDate: string;
  totalCalls: number;
  avgScore: number;
  revenue: number;
  teamMembers: string[];
}

export interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  plan: SubscriptionPlan;
  status: 'Active' | 'Trialing' | 'Cancelled' | 'Suspended';
  subscriptionId?: string; // Stripe subscription ID
  createdDate: string;
  lastActive: string;
  totalUsers: number;
  monthlyRevenue: number;
}
