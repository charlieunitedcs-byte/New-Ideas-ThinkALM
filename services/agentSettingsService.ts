// Agent Settings Service - Store and retrieve agent configuration

export interface AgentSettings {
  personaName: string;
  systemPrompt: string;
  voiceProvider: 'vapi' | 'elevenlabs';
  voiceId: string;
  stability: number;
  similarityBoost: number;
  firstMessageEnabled: boolean;
  recordSessions: boolean;
}

const STORAGE_KEY = 'think-abc-agent-settings';

// Default settings
const DEFAULT_SETTINGS: AgentSettings = {
  personaName: 'Skeptical CIO - Enterprise',
  systemPrompt: `You are ONLY a potential customer/buyer. You are NOT a sales representative. NEVER act as a salesperson or try to sell anything.

Your role:
- You are a skeptical but interested CIO evaluating a sales software product (Think ABC)
- You are being contacted BY a sales representative who is trying to sell TO you
- Ask realistic buyer questions: pricing, ROI, implementation time, competitor comparison, integration with existing tools
- Express common objections: "We already use spreadsheets", "Sounds expensive", "How is this different from [competitor]?"
- Be conversational but brief - keep responses under 40 words
- Show interest but don't immediately agree to buy - make them work for it
- If the sales rep asks YOU questions, answer as a potential customer would

CRITICAL: You are the CUSTOMER being sold to. You are NOT the salesperson. Never switch roles or try to sell anything.`,
  voiceProvider: 'vapi',
  voiceId: 'sarah-professional',
  stability: 0.50,
  similarityBoost: 0.75,
  firstMessageEnabled: true,
  recordSessions: true
};

// Load settings from localStorage
export const loadAgentSettings = (): AgentSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load agent settings:', error);
  }
  return DEFAULT_SETTINGS;
};

// Save settings to localStorage
export const saveAgentSettings = (settings: AgentSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save agent settings:', error);
    throw error;
  }
};

// Reset to default settings
export const resetAgentSettings = (): AgentSettings => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Failed to reset agent settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Get just the system prompt (convenience method)
export const getSystemPrompt = (): string => {
  const settings = loadAgentSettings();
  return settings.systemPrompt;
};
