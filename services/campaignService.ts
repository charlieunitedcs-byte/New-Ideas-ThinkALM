/**
 * Campaign Service
 *
 * Week 3 Session 1: Migrated to Supabase database
 * - Stores campaigns in PostgreSQL (unlimited storage)
 * - Links campaigns to calls for performance tracking
 * - Supports team collaboration
 */

import { Campaign } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

/**
 * Load campaigns from database with pagination
 */
export const loadCampaigns = async (
  userId?: string,
  page: number = 1,
  pageSize: number = 100
): Promise<{ campaigns: Campaign[]; totalCount: number }> => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase not configured - campaigns unavailable');
    return { campaigns: [], totalCount: 0 };
  }

  try {
    let query = supabase
      .from('campaigns')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter by user if provided
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Failed to load campaigns from Supabase:', error);
      return { campaigns: [], totalCount: 0 };
    }

    if (data) {
      console.log(`✅ Loaded ${data.length} campaigns from Supabase`);

      // Convert database format to Campaign format
      const campaigns: Campaign[] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        status: row.status,
        startDate: row.start_date,
        endDate: row.end_date,
        totalCalls: row.total_calls || 0,
        avgScore: parseFloat(row.avg_score) || 0,
        revenue: parseFloat(row.revenue) || 0,
        teamMembers: row.team_members || [],
        description: row.description,
        goals: row.goals,
      }));

      return { campaigns, totalCount: count || 0 };
    }

    return { campaigns: [], totalCount: 0 };
  } catch (error) {
    console.error('Error loading campaigns:', error);
    return { campaigns: [], totalCount: 0 };
  }
};

/**
 * Create a new campaign
 */
export const createCampaign = async (
  campaignData: Omit<Campaign, 'id'>,
  userId: string
): Promise<Campaign | null> => {
  if (!isSupabaseConfigured()) {
    console.error('⚠️ Supabase not configured - cannot create campaign');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        name: campaignData.name,
        status: campaignData.status,
        start_date: campaignData.startDate,
        end_date: campaignData.endDate,
        total_calls: campaignData.totalCalls || 0,
        avg_score: campaignData.avgScore || 0,
        revenue: campaignData.revenue || 0,
        team_members: campaignData.teamMembers || [],
        description: campaignData.description,
        goals: campaignData.goals,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create campaign:', error);
      return null;
    }

    if (data) {
      console.log('✅ Campaign created in Supabase:', data.id);
      return {
        id: data.id,
        name: data.name,
        status: data.status,
        startDate: data.start_date,
        endDate: data.end_date,
        totalCalls: data.total_calls || 0,
        avgScore: parseFloat(data.avg_score) || 0,
        revenue: parseFloat(data.revenue) || 0,
        teamMembers: data.team_members || [],
        description: data.description,
        goals: data.goals,
      };
    }

    return null;
  } catch (error) {
    console.error('Error creating campaign:', error);
    return null;
  }
};

/**
 * Update an existing campaign
 */
export const updateCampaign = async (
  campaignId: string,
  updates: Partial<Campaign>
): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.error('⚠️ Supabase not configured - cannot update campaign');
    return false;
  }

  try {
    const updateData: any = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
    if (updates.totalCalls !== undefined) updateData.total_calls = updates.totalCalls;
    if (updates.avgScore !== undefined) updateData.avg_score = updates.avgScore;
    if (updates.revenue !== undefined) updateData.revenue = updates.revenue;
    if (updates.teamMembers !== undefined) updateData.team_members = updates.teamMembers;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.goals !== undefined) updateData.goals = updates.goals;

    const { error } = await supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId);

    if (error) {
      console.error('Failed to update campaign:', error);
      return false;
    }

    console.log('✅ Campaign updated in Supabase');
    return true;
  } catch (error) {
    console.error('Error updating campaign:', error);
    return false;
  }
};

/**
 * Delete a campaign
 */
export const deleteCampaign = async (campaignId: string): Promise<boolean> => {
  if (!isSupabaseConfigured()) {
    console.error('⚠️ Supabase not configured - cannot delete campaign');
    return false;
  }

  try {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId);

    if (error) {
      console.error('Failed to delete campaign:', error);
      return false;
    }

    console.log('✅ Campaign deleted from Supabase');
    return true;
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return false;
  }
};

/**
 * Get campaign by ID
 */
export const getCampaignById = async (campaignId: string): Promise<Campaign | null> => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error || !data) {
      console.error('Failed to get campaign:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      totalCalls: data.total_calls || 0,
      avgScore: parseFloat(data.avg_score) || 0,
      revenue: parseFloat(data.revenue) || 0,
      teamMembers: data.team_members || [],
      description: data.description,
      goals: data.goals,
    };
  } catch (error) {
    console.error('Error getting campaign:', error);
    return null;
  }
};

/**
 * Get campaign statistics
 */
export const getCampaignStats = async (userId?: string): Promise<{
  total: number;
  active: number;
  completed: number;
  draft: number;
}> => {
  if (!isSupabaseConfigured()) {
    return { total: 0, active: 0, completed: 0, draft: 0 };
  }

  try {
    let query = supabase.from('campaigns').select('status');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error || !data) {
      return { total: 0, active: 0, completed: 0, draft: 0 };
    }

    const stats = {
      total: data.length,
      active: data.filter(c => c.status === 'Active').length,
      completed: data.filter(c => c.status === 'Completed').length,
      draft: data.filter(c => c.status === 'Draft').length,
    };

    return stats;
  } catch (error) {
    console.error('Error getting campaign stats:', error);
    return { total: 0, active: 0, completed: 0, draft: 0 };
  }
};
