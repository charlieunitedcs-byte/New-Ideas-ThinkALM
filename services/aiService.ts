// Multi-Provider AI Service - Fallback from Gemini to OpenAI
import { CallAnalysisResult } from '../types';
import { analyzeCallTranscript as geminiAnalyzeText, analyzeCallAudio as geminiAnalyzeAudio } from './geminiService';
import { analyzeCallTranscript as openaiAnalyzeText } from './openaiService';

/**
 * Analyzes a call transcript with automatic fallback
 * Tries Gemini first, falls back to OpenAI if Gemini fails
 */
export const analyzeCallTranscript = async (transcript: string): Promise<CallAnalysisResult> => {
  try {
    console.log('Attempting analysis with Gemini...');
    return await geminiAnalyzeText(transcript);
  } catch (geminiError: any) {
    console.warn('Gemini analysis failed, trying OpenAI fallback...', geminiError?.message);

    // Only fallback if it's a server error (not API key missing)
    const isServerError =
      geminiError?.message?.includes('overloaded') ||
      geminiError?.status === 'UNAVAILABLE' ||
      geminiError?.code === 503 ||
      geminiError?.message?.includes('quota') ||
      geminiError?.message?.includes('rate limit');

    if (isServerError) {
      try {
        console.log('Using OpenAI as fallback provider...');
        const result = await openaiAnalyzeText(transcript);
        console.log('OpenAI fallback successful');
        return result;
      } catch (openaiError: any) {
        console.error('OpenAI fallback also failed', openaiError);
        throw new Error(
          'Both AI providers are currently unavailable. Please try again in a few moments. ' +
          `(Gemini: ${geminiError?.message}, OpenAI: ${openaiError?.message})`
        );
      }
    }

    // If it's not a server error, just throw the original error
    throw geminiError;
  }
};

/**
 * Analyzes call audio - Gemini only (OpenAI Whisper requires different setup)
 * Falls back to friendly error message
 */
export const analyzeCallAudio = async (audioFile: File): Promise<CallAnalysisResult> => {
  try {
    console.log('Attempting audio analysis with Gemini...');
    return await geminiAnalyzeAudio(audioFile);
  } catch (error: any) {
    console.error('Audio analysis failed', error);

    const isServerError =
      error?.message?.includes('overloaded') ||
      error?.status === 'UNAVAILABLE' ||
      error?.code === 503;

    if (isServerError) {
      throw new Error(
        'Audio analysis is temporarily unavailable. Please try again in a few moments, ' +
        'or use the "Paste Transcript" tab to analyze text instead.'
      );
    }

    throw error;
  }
};
