/**
 * Call History Service - Store and retrieve analyzed calls
 *
 * Week 3 Session 2: Supabase-only version (localStorage removed)
 * - Saves calls to PostgreSQL (unlimited storage)
 * - Requires Supabase configuration
 * - Supports pagination for large call histories
 * - Enables search and filtering
 */

import { CallAnalysisResult } from '../types';
import { supabase, isSupabaseConfigured, DatabaseCall } from './supabaseClient';

export interface CallHistoryItem extends CallAnalysisResult {
  id: string;
  analyzedAt: string;
  userId: string;
  salesRepName?: string;
}

/**
 * Save a call analysis result to the database
 */
export const saveCallToHistory = async (
  result: CallAnalysisResult,
  userId: string,
  salesRepName?: string,
  team?: string
): Promise<CallHistoryItem> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Database not configured. Please check your Supabase settings.');
  }

  try {
    const { data, error } = await supabase
      .from('calls')
      .insert({
        user_id: userId,
        team: team || 'Default',
        agent_name: salesRepName || null,
        prospect_name: result.prospectName || null,
        transcript: result.transcript || '',
        score: result.overallScore || 0,
        summary: result.summary || null,
        strengths: result.strengths || [],
        improvements: result.improvements || [],
        tone: result.tone || null,
        emotional_intelligence: result.emotionalIntelligence || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to save call to Supabase:', error);
      throw new Error(`Failed to save call: ${error.message}`);
    }

    console.log('✅ Call saved to Supabase database');

    return {
      ...result,
      id: data.id,
      analyzedAt: data.created_at,
      userId,
      salesRepName
    };
  } catch (err: any) {
    console.error('Exception saving to Supabase:', err);
    throw new Error(`Failed to save call: ${err.message || 'Unknown error'}`);
  }
};

/**
 * Get call history from database with pagination
 * @param userId - Filter by user ID
 * @param page - Page number (1-indexed)
 * @param pageSize - Number of calls per page
 */
export const getCallHistory = async (
  userId?: string,
  page: number = 1,
  pageSize: number = 50
): Promise<{ calls: CallHistoryItem[]; totalCount: number }> => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Database not configured - returning empty results');
    return { calls: [], totalCount: 0 };
  }

  try {
    // Build query
    let query = supabase
      .from('calls')
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
      console.error('Failed to fetch calls from Supabase:', error);
      throw new Error(`Failed to fetch calls: ${error.message}`);
    }

    if (data) {
      console.log(`✅ Fetched ${data.length} calls from Supabase`);

      // Convert database format to CallHistoryItem format
      const calls: CallHistoryItem[] = data.map((call: DatabaseCall) => ({
        id: call.id,
        analyzedAt: call.created_at,
        userId: call.user_id,
        salesRepName: call.agent_name || undefined,
        prospectName: call.prospect_name || undefined,
        transcript: call.transcript,
        overallScore: call.score,
        summary: call.summary || undefined,
        strengths: (call.strengths as string[]) || [],
        improvements: (call.improvements as string[]) || [],
        tone: call.tone || undefined,
        emotionalIntelligence: call.emotional_intelligence || undefined,
      }));

      return { calls, totalCount: count || 0 };
    }

    return { calls: [], totalCount: 0 };
  } catch (err: any) {
    console.error('Exception fetching from Supabase:', err);
    return { calls: [], totalCount: 0 };
  }
};

/**
 * Delete a call from history
 */
export const deleteCallFromHistory = async (callId: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Database not configured. Please check your Supabase settings.');
  }

  try {
    const { error } = await supabase
      .from('calls')
      .delete()
      .eq('id', callId);

    if (error) {
      console.error('Failed to delete call from Supabase:', error);
      throw new Error(`Failed to delete call: ${error.message}`);
    }

    console.log('✅ Call deleted from Supabase');
  } catch (err: any) {
    console.error('Exception deleting from Supabase:', err);
    throw new Error(`Failed to delete call: ${err.message || 'Unknown error'}`);
  }
};

/**
 * Clear all call history for a user
 */
export const clearCallHistory = async (userId?: string): Promise<void> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Database not configured. Please check your Supabase settings.');
  }

  if (!userId) {
    throw new Error('User ID is required to clear call history');
  }

  try {
    const { error } = await supabase
      .from('calls')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to clear calls from Supabase:', error);
      throw new Error(`Failed to clear calls: ${error.message}`);
    }

    console.log('✅ Calls cleared from Supabase');
  } catch (err: any) {
    console.error('Exception clearing from Supabase:', err);
    throw new Error(`Failed to clear calls: ${err.message || 'Unknown error'}`);
  }
};

/**
 * Search calls by text query
 */
export const searchCalls = async (
  query: string,
  userId?: string,
  page: number = 1,
  pageSize: number = 50
): Promise<{ calls: CallHistoryItem[]; totalCount: number }> => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Database not configured - returning empty results');
    return { calls: [], totalCount: 0 };
  }

  try {
    let queryBuilder = supabase
      .from('calls')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Filter by user if provided
    if (userId) {
      queryBuilder = queryBuilder.eq('user_id', userId);
    }

    // Search in transcript, summary, agent_name, or prospect_name
    queryBuilder = queryBuilder.or(
      `transcript.ilike.%${query}%,summary.ilike.%${query}%,agent_name.ilike.%${query}%,prospect_name.ilike.%${query}%`
    );

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) {
      console.error('Failed to search calls in Supabase:', error);
      throw new Error(`Failed to search calls: ${error.message}`);
    }

    if (data) {
      const calls: CallHistoryItem[] = data.map((call: DatabaseCall) => ({
        id: call.id,
        analyzedAt: call.created_at,
        userId: call.user_id,
        salesRepName: call.agent_name || undefined,
        prospectName: call.prospect_name || undefined,
        transcript: call.transcript,
        overallScore: call.score,
        summary: call.summary || undefined,
        strengths: (call.strengths as string[]) || [],
        improvements: (call.improvements as string[]) || [],
        tone: call.tone || undefined,
        emotionalIntelligence: call.emotional_intelligence || undefined,
      }));

      return { calls, totalCount: count || 0 };
    }

    return { calls: [], totalCount: 0 };
  } catch (err: any) {
    console.error('Exception searching Supabase:', err);
    return { calls: [], totalCount: 0 };
  }
};
