/**
 * Analytics Service
 *
 * Week 2 Session 4: Analytics Dashboard
 * Provides real-time metrics and insights from Supabase database
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface DashboardMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCalls: number;
  avgCallScore: number;
  totalClients: number;
  totalRevenue: number;
  callsToday: number;
  callsThisWeek: number;
  callsThisMonth: number;
}

export interface TopPerformer {
  name: string;
  callCount: number;
  avgScore: number;
}

export interface CallTrend {
  date: string;
  count: number;
  avgScore: number;
}

export interface RevenueByPlan {
  plan: string;
  revenue: number;
  clientCount: number;
}

/**
 * Get comprehensive dashboard metrics
 */
export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  if (!isSupabaseConfigured()) {
    return getMockMetrics();
  }

  try {
    // Run all queries in parallel for performance
    const [
      usersResult,
      callsResult,
      callStatsResult,
      clientsResult,
      revenueResult,
      todayCallsResult,
      weekCallsResult,
      monthCallsResult,
    ] = await Promise.all([
      // Total users
      supabase.from('users').select('*', { count: 'exact', head: true }),

      // Total calls
      supabase.from('calls').select('*', { count: 'exact', head: true }),

      // Average call score
      supabase.from('calls').select('score'),

      // Total clients
      supabase.from('clients').select('*', { count: 'exact', head: true }),

      // Total revenue
      supabase.from('clients').select('monthly_revenue').eq('status', 'Active'),

      // Calls today
      supabase.from('calls')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0]),

      // Calls this week
      supabase.from('calls')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', getWeekStart().toISOString()),

      // Calls this month
      supabase.from('calls')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', getMonthStart().toISOString()),
    ]);

    // Calculate average score
    const avgScore = callStatsResult.data && callStatsResult.data.length > 0
      ? callStatsResult.data.reduce((sum, call) => sum + call.score, 0) / callStatsResult.data.length
      : 0;

    // Calculate total revenue
    const totalRevenue = revenueResult.data
      ? revenueResult.data.reduce((sum, client) => sum + parseFloat(client.monthly_revenue || '0'), 0)
      : 0;

    return {
      totalUsers: usersResult.count || 0,
      activeUsers: usersResult.count || 0, // Future: filter by last_login
      totalCalls: callsResult.count || 0,
      avgCallScore: Math.round(avgScore),
      totalClients: clientsResult.count || 0,
      totalRevenue,
      callsToday: todayCallsResult.count || 0,
      callsThisWeek: weekCallsResult.count || 0,
      callsThisMonth: monthCallsResult.count || 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return getMockMetrics();
  }
};

/**
 * Get top performing sales reps
 */
export const getTopPerformers = async (limit: number = 10): Promise<TopPerformer[]> => {
  if (!isSupabaseConfigured()) {
    return getMockTopPerformers();
  }

  try {
    const { data, error } = await supabase
      .from('calls')
      .select('agent_name, score');

    if (error || !data) {
      console.error('Error fetching top performers:', error);
      return getMockTopPerformers();
    }

    // Group by agent and calculate stats
    const agentStats = new Map<string, { totalScore: number; count: number }>();

    data.forEach(call => {
      const name = call.agent_name || 'Unknown';
      const current = agentStats.get(name) || { totalScore: 0, count: 0 };
      agentStats.set(name, {
        totalScore: current.totalScore + call.score,
        count: current.count + 1,
      });
    });

    // Convert to array and calculate averages
    const performers: TopPerformer[] = Array.from(agentStats.entries())
      .map(([name, stats]) => ({
        name,
        callCount: stats.count,
        avgScore: Math.round(stats.totalScore / stats.count),
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, limit);

    return performers;
  } catch (error) {
    console.error('Error fetching top performers:', error);
    return getMockTopPerformers();
  }
};

/**
 * Get call trends over time (last 30 days)
 */
export const getCallTrends = async (days: number = 30): Promise<CallTrend[]> => {
  if (!isSupabaseConfigured()) {
    return getMockCallTrends();
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('calls')
      .select('created_at, score')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('Error fetching call trends:', error);
      return getMockCallTrends();
    }

    // Group by date
    const dailyStats = new Map<string, { count: number; totalScore: number }>();

    data.forEach(call => {
      const date = call.created_at.split('T')[0];
      const current = dailyStats.get(date) || { count: 0, totalScore: 0 };
      dailyStats.set(date, {
        count: current.count + 1,
        totalScore: current.totalScore + call.score,
      });
    });

    // Convert to array with averages
    const trends: CallTrend[] = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        count: stats.count,
        avgScore: Math.round(stats.totalScore / stats.count),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return trends;
  } catch (error) {
    console.error('Error fetching call trends:', error);
    return getMockCallTrends();
  }
};

/**
 * Get revenue breakdown by plan
 */
export const getRevenueByPlan = async (): Promise<RevenueByPlan[]> => {
  if (!isSupabaseConfigured()) {
    return getMockRevenueByPlan();
  }

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('plan, monthly_revenue')
      .eq('status', 'Active');

    if (error || !data) {
      console.error('Error fetching revenue by plan:', error);
      return getMockRevenueByPlan();
    }

    // Group by plan
    const planStats = new Map<string, { revenue: number; count: number }>();

    data.forEach(client => {
      const plan = client.plan || 'Unknown';
      const current = planStats.get(plan) || { revenue: 0, count: 0 };
      planStats.set(plan, {
        revenue: current.revenue + parseFloat(client.monthly_revenue || '0'),
        count: current.count + 1,
      });
    });

    // Convert to array
    const breakdown: RevenueByPlan[] = Array.from(planStats.entries())
      .map(([plan, stats]) => ({
        plan,
        revenue: stats.revenue,
        clientCount: stats.count,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return breakdown;
  } catch (error) {
    console.error('Error fetching revenue by plan:', error);
    return getMockRevenueByPlan();
  }
};

// ============ Helper Functions ============

function getWeekStart(): Date {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
}

function getMonthStart(): Date {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// ============ Mock Data (Fallback) ============

function getMockMetrics(): DashboardMetrics {
  return {
    totalUsers: 247,
    activeUsers: 189,
    totalCalls: 1284,
    avgCallScore: 84,
    totalClients: 52,
    totalRevenue: 12450,
    callsToday: 23,
    callsThisWeek: 127,
    callsThisMonth: 489,
  };
}

function getMockTopPerformers(): TopPerformer[] {
  return [
    { name: 'Sarah Johnson', callCount: 45, avgScore: 92 },
    { name: 'Michael Chen', callCount: 38, avgScore: 90 },
    { name: 'Emily Rodriguez', callCount: 52, avgScore: 88 },
    { name: 'David Kim', callCount: 41, avgScore: 87 },
    { name: 'Jessica Martinez', callCount: 36, avgScore: 85 },
  ];
}

function getMockCallTrends(): CallTrend[] {
  const trends: CallTrend[] = [];
  const today = new Date();

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    trends.push({
      date: date.toISOString().split('T')[0],
      count: Math.floor(Math.random() * 30) + 10,
      avgScore: Math.floor(Math.random() * 20) + 75,
    });
  }

  return trends;
}

function getMockRevenueByPlan(): RevenueByPlan[] {
  return [
    { plan: 'Team Plan', revenue: 7920, clientCount: 32 },
    { plan: 'Company Unlimited', revenue: 3600, clientCount: 15 },
    { plan: 'Per User', revenue: 930, clientCount: 5 },
  ];
}
