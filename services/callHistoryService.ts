/**
 * Call History Service - Store and retrieve analyzed calls
 *
 * Week 2 Session 2: Migrated to Supabase database
 * - Saves calls to PostgreSQL (unlimited storage)
 * - Falls back to localStorage if Supabase unavailable
 * - Supports pagination for large call histories
 * - Enables search and filtering
 */

import { CallAnalysisResult } from '../types';
import { supabase, isSupabaseConfigured, handleSupabaseError, DatabaseCall } from './supabaseClient';

const CALL_HISTORY_KEY = 'think-abc-call-history';

export interface CallHistoryItem extends CallAnalysisResult {
  id: string;
  analyzedAt: string;
  userId: string;
  salesRepName?: string;
}

/**
 * Save a call analysis result to the database
 * Dual write: Supabase (primary) + localStorage (fallback)
 */
export const saveCallToHistory = async (
  result: CallAnalysisResult,
  userId: string,
  salesRepName?: string,
  team?: string
): Promise<CallHistoryItem> => {
  const newItem: CallHistoryItem = {
    ...result,
    id: Date.now().toString(),
    analyzedAt: new Date().toISOString(),
    userId,
    salesRepName
  };

  // Try to save to Supabase first
  if (isSupabaseConfigured()) {
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
        // Fall through to localStorage
      } else if (data) {
        console.log('✅ Call saved to Supabase database');

        // Update the newItem with the database ID
        newItem.id = data.id;
        newItem.analyzedAt = data.created_at;

        // Also save to localStorage as backup
        saveToLocalStorage(newItem);

        return newItem;
      }
    } catch (err) {
      console.error('Exception saving to Supabase:', err);
      // Fall through to localStorage
    }
  }

  // Fallback: Save to localStorage
  console.log('💾 Saving call to localStorage (Supabase unavailable)');
  saveToLocalStorage(newItem);
  return newItem;
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
  // Try to fetch from Supabase first
  if (isSupabaseConfigured()) {
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
        // Fall through to localStorage
      } else if (data) {
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
    } catch (err) {
      console.error('Exception fetching from Supabase:', err);
      // Fall through to localStorage
    }
  }

  // Fallback: Fetch from localStorage
  console.log('💾 Fetching calls from localStorage (Supabase unavailable)');
  const localCalls = getFromLocalStorage(userId);

  // Apply manual pagination for localStorage
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const paginatedCalls = localCalls.slice(from, to);

  return { calls: paginatedCalls, totalCount: localCalls.length };
};

/**
 * Delete a call from history
 */
export const deleteCallFromHistory = async (callId: string): Promise<void> => {
  // Try to delete from Supabase first
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('calls')
        .delete()
        .eq('id', callId);

      if (error) {
        console.error('Failed to delete call from Supabase:', error);
        // Fall through to localStorage
      } else {
        console.log('✅ Call deleted from Supabase');
        // Also delete from localStorage
        deleteFromLocalStorage(callId);
        return;
      }
    } catch (err) {
      console.error('Exception deleting from Supabase:', err);
      // Fall through to localStorage
    }
  }

  // Fallback: Delete from localStorage
  console.log('💾 Deleting call from localStorage');
  deleteFromLocalStorage(callId);
};

/**
 * Clear all call history for a user
 */
export const clearCallHistory = async (userId?: string): Promise<void> => {
  // Try to clear from Supabase first
  if (isSupabaseConfigured() && userId) {
    try {
      const { error } = await supabase
        .from('calls')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to clear calls from Supabase:', error);
        // Fall through to localStorage
      } else {
        console.log('✅ Calls cleared from Supabase');
        // Also clear localStorage
        localStorage.removeItem(CALL_HISTORY_KEY);
        return;
      }
    } catch (err) {
      console.error('Exception clearing from Supabase:', err);
      // Fall through to localStorage
    }
  }

  // Fallback: Clear localStorage
  console.log('💾 Clearing calls from localStorage');
  localStorage.removeItem(CALL_HISTORY_KEY);
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
  if (isSupabaseConfigured()) {
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
      } else if (data) {
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
    } catch (err) {
      console.error('Exception searching Supabase:', err);
    }
  }

  // Fallback: Search in localStorage
  const localCalls = getFromLocalStorage(userId);
  const filteredCalls = localCalls.filter(call =>
    call.transcript?.toLowerCase().includes(query.toLowerCase()) ||
    call.summary?.toLowerCase().includes(query.toLowerCase()) ||
    call.salesRepName?.toLowerCase().includes(query.toLowerCase()) ||
    call.prospectName?.toLowerCase().includes(query.toLowerCase())
  );

  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const paginatedCalls = filteredCalls.slice(from, to);

  return { calls: paginatedCalls, totalCount: filteredCalls.length };
};

// ============ LocalStorage Helper Functions ============

function saveToLocalStorage(item: CallHistoryItem): void {
  const history = getFromLocalStorage();
  history.unshift(item);

  // Keep only last 50 calls in localStorage
  const trimmedHistory = history.slice(0, 50);
  localStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(trimmedHistory));
}

function getFromLocalStorage(userId?: string): CallHistoryItem[] {
  const historyStr = localStorage.getItem(CALL_HISTORY_KEY);
  if (!historyStr) return [];

  try {
    const history: CallHistoryItem[] = JSON.parse(historyStr);
    return userId ? history.filter(call => call.userId === userId) : history;
  } catch {
    return [];
  }
}

function deleteFromLocalStorage(callId: string): void {
  const history = getFromLocalStorage();
  const updatedHistory = history.filter(call => call.id !== callId);
  localStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(updatedHistory));
}
