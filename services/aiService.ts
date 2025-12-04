// BULLETPROOF AI Service - Uses backend API with automatic fallbacks
// This version will NOT randomly break like the old direct API calls
import { CallAnalysisResult } from '../types';

/**
 * Analyzes a call transcript using BACKEND API
 * Backend automatically tries: OpenAI → Gemini → Mock
 * This is MUCH more reliable than calling APIs directly from browser
 */
export const analyzeCallTranscript = async (transcript: string): Promise<CallAnalysisResult> => {
  try {
    console.log('🚀 Analyzing call via backend API (bulletproof)...');

    const response = await fetch('/api/analyze-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript: transcript
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Analysis failed');
    }

    // Log which provider was used
    const provider = data.provider || 'unknown';
    console.log(`✅ Analysis successful using: ${provider}`);

    if (data.warning) {
      console.warn('⚠️', data.warning);
    }

    return data.result;

  } catch (error: any) {
    console.error('❌ Call analysis failed:', error);

    // Provide helpful error message
    if (error?.message?.includes('fetch')) {
      throw new Error(
        'Unable to connect to analysis service. Please check your internet connection and try again.'
      );
    }

    throw new Error(
      error?.message || 'Call analysis failed. Please try again or contact support.'
    );
  }
};

/**
 * Analyzes call audio using BACKEND API
 * Backend handles audio processing and falls back gracefully
 */
export const analyzeCallAudio = async (audioFile: File): Promise<CallAnalysisResult> => {
  try {
    console.log('🎤 Analyzing audio via backend API...');

    // Convert audio to base64
    const base64Audio = await fileToBase64(audioFile);

    const response = await fetch('/api/analyze-call', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audioBase64: base64Audio,
        audioMimeType: audioFile.type
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Audio analysis failed');
    }

    console.log(`✅ Audio analysis successful using: ${data.provider || 'unknown'}`);

    if (data.warning) {
      console.warn('⚠️', data.warning);
    }

    return data.result;

  } catch (error: any) {
    console.error('❌ Audio analysis failed:', error);

    throw new Error(
      error?.message || 'Audio analysis failed. Try pasting the transcript instead.'
    );
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:audio/mpeg;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = error => reject(error);
  });
};
