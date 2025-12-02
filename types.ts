
export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export enum SubscriptionPlan {
  ESSENTIALS = 'Team Essentials',
  PRO = 'Pro Growth'
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

export interface CallAnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  transcript: string;
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
  url: string; // Placeholder URL
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
