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

const STORAGE_KEY = 'think-alm-agent-settings';

// Default settings
const DEFAULT_SETTINGS: AgentSettings = {
  personaName: 'Skeptical CIO - Enterprise',
  systemPrompt: "You are a skeptical but interested potential buyer for a SaaS product (Think ALM). You are speaking with a sales representative. Be realistic, ask about pricing, implementation time, and competitor differentiation. Keep responses concise (under 50 words) to mimic real conversation.",
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
