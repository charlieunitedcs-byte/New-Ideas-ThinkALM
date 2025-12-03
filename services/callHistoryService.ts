// Call History Service - Store and retrieve analyzed calls
import { CallAnalysisResult } from '../types';

const CALL_HISTORY_KEY = 'think-abc-call-history';

export interface CallHistoryItem extends CallAnalysisResult {
  id: string;
  analyzedAt: string;
  userId: string;
}

export const saveCallToHistory = (result: CallAnalysisResult, userId: string): void => {
  const history = getCallHistory();
  const newItem: CallHistoryItem = {
    ...result,
    id: Date.now().toString(),
    analyzedAt: new Date().toISOString(),
    userId
  };

  // Add to beginning of array (most recent first)
  history.unshift(newItem);

  // Keep only the last 50 calls
  const trimmedHistory = history.slice(0, 50);

  localStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(trimmedHistory));
};

export const getCallHistory = (userId?: string): CallHistoryItem[] => {
  const historyStr = localStorage.getItem(CALL_HISTORY_KEY);
  if (!historyStr) return [];

  try {
    const history: CallHistoryItem[] = JSON.parse(historyStr);
    // Filter by user if userId provided
    return userId ? history.filter(call => call.userId === userId) : history;
  } catch {
    return [];
  }
};

export const deleteCallFromHistory = (callId: string): void => {
  const history = getCallHistory();
  const updatedHistory = history.filter(call => call.id !== callId);
  localStorage.setItem(CALL_HISTORY_KEY, JSON.stringify(updatedHistory));
};

export const clearCallHistory = (): void => {
  localStorage.removeItem(CALL_HISTORY_KEY);
};
