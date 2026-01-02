// BULLETPROOF AI Service - Uses backend API with automatic fallbacks
// This version will NOT randomly break like the old direct API calls
import { CallAnalysisResult } from '../types';
import { authenticatedFetch } from './authService';

/**
 * Analyzes a call transcript using BACKEND API
 * Backend automatically tries: OpenAI → Gemini → Mock
 * This is MUCH more reliable than calling APIs directly from browser
 */
export const analyzeCallTranscript = async (transcript: string): Promise<CallAnalysisResult> => {
  try {
    console.log('🚀 Analyzing call via backend API (bulletproof)...');

    // Use authenticatedFetch to include JWT token automatically
    const response = await authenticatedFetch('/api/analyze-call', {
      method: 'POST',
      body: JSON.stringify({
        transcript: transcript
      })
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = `Backend error: ${response.status} ${response.statusText}`;

      // Try to get error details
      try {
        const text = await response.text();
        console.error('Backend response:', text);

        // Try parsing as JSON first
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // Not JSON, use text directly
          errorMessage = text.substring(0, 200); // First 200 chars
        }
      } catch {
        // Can't read response
      }

      throw new Error(errorMessage);
    }

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error('Backend returned invalid response. Please try again or contact support.');
    }

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
    if (error?.message?.includes('fetch') || error?.message?.includes('NetworkError')) {
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
 * Uses Supabase Storage for large files, falls back to base64 for small files
 */
export const analyzeCallAudio = async (audioFile: File): Promise<CallAnalysisResult> => {
  try {
    console.log('🎤 Analyzing audio via backend API...');

    // Upload to Supabase Storage (or fall back to base64)
    const { uploadAudioFile } = await import('./audioStorageService');
    const uploadResult = await uploadAudioFile(audioFile);

    // Use authenticatedFetch to include JWT token automatically
    const response = await authenticatedFetch('/api/analyze-call', {
      method: 'POST',
      body: JSON.stringify({
        audioUrl: uploadResult.url,        // Supabase URL (preferred)
        audioBase64: uploadResult.base64,  // Fallback for small files
        audioMimeType: uploadResult.mimeType
      })
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = `Backend error: ${response.status} ${response.statusText}`;

      try {
        const text = await response.text();
        console.error('Backend response:', text);

        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = text.substring(0, 200);
        }
      } catch {
        // Can't read response
      }

      throw new Error(errorMessage);
    }

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error('Backend returned invalid response. Please try again or contact support.');
    }

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
