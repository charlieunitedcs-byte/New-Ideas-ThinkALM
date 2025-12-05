import type { VercelRequest, VercelResponse } from '@vercel/node';

// Backend API for call analysis - bulletproof with proper error handling
// Uses Gemini for AUDIO (native audio support) and text analysis
// This endpoint is STABLE and won't randomly break

interface AnalyzeCallRequest {
  transcript?: string;
  audioBase64?: string;
  audioMimeType?: string;
}

interface CallAnalysisResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  tone: string;
  emotionalIntelligence: number;
  transcript: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { transcript, audioBase64, audioMimeType } = req.body as AnalyzeCallRequest;

    if (!transcript && !audioBase64) {
      return res.status(400).json({ success: false, error: 'Either transcript or audio is required' });
    }

    // Check payload size (Vercel limit is ~4.5MB)
    if (audioBase64 && audioBase64.length > 3 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        error: 'Audio file is too large. Maximum size is 3MB. Please use a shorter clip or paste the transcript instead.'
      });
    }

    // Get Gemini API key from environment
    const geminiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      console.warn('No Gemini API key configured, returning mock analysis');
      const mockResult = generateMockAnalysis(transcript || 'Audio file uploaded');
      return res.status(200).json({
        success: true,
        result: mockResult,
        provider: 'mock',
        warning: 'Gemini API key not configured. This is a demo analysis. Please add GEMINI_API_KEY to Vercel environment variables.'
      });
    }

    // Use Gemini for analysis (supports both text AND audio natively)
    console.log(audioBase64 ? 'Analyzing audio with Gemini...' : 'Analyzing text with Gemini...');

    try {
      let result;
      if (audioBase64) {
        // Audio analysis - Gemini can handle this directly
        result = await analyzeAudioWithGemini(audioBase64, audioMimeType || 'audio/mpeg', geminiKey);
      } else {
        // Text analysis
        result = await analyzeTextWithGemini(transcript!, geminiKey);
      }

      return res.status(200).json({ success: true, result, provider: 'gemini' });

    } catch (error: any) {
      console.error('Gemini analysis failed:', error.message);

      // If Gemini fails, return mock as graceful fallback
      console.warn('Gemini failed, returning mock analysis');
      const mockResult = generateMockAnalysis(transcript || 'Audio file uploaded');
      return res.status(200).json({
        success: true,
        result: mockResult,
        provider: 'mock',
        warning: `Gemini analysis failed: ${error.message}. Showing demo analysis.`
      });
    }

  } catch (error: any) {
    console.error('Call analysis error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze call',
      details: error.message || 'Unknown error occurred'
    });
  }
}

// Gemini TEXT Analysis using REST API (Stable)
async function analyzeTextWithGemini(transcript: string, apiKey: string): Promise<CallAnalysisResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert sales coach for "Think ABC". Analyze the following sales call transcript.

Provide a JSON response with:
1. score - A performance score (0-100)
2. summary - A brief executive summary (max 2 sentences)
3. strengths - Array of top 3 strengths
4. improvements - Array of top 3 areas for improvement
5. tone - Analysis of the sales rep's tone
6. emotionalIntelligence - Score (0-100)

Transcript: ${transcript}`
          }]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API error response:', errorText);
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error('No response from Gemini');

  const result = JSON.parse(text);

  return {
    score: result.score || 75,
    summary: result.summary || 'Analysis completed',
    strengths: result.strengths || [],
    improvements: result.improvements || [],
    tone: result.tone || 'Professional',
    emotionalIntelligence: result.emotionalIntelligence || 70,
    transcript: transcript
  };
}

// Gemini AUDIO Analysis using REST API (Stable) - Gemini can do this natively!
async function analyzeAudioWithGemini(audioBase64: string, mimeType: string, apiKey: string): Promise<CallAnalysisResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `You are an expert sales coach for "Think ABC".

Listen to this sales call recording and provide a comprehensive analysis.

Provide a JSON response with:
1. transcript - the full transcript of the conversation with speaker labels (Sales Rep: and Prospect:)
2. score - performance score (0-100)
3. summary - brief executive summary (max 2 sentences)
4. strengths - array of top 3 strengths
5. improvements - array of top 3 areas for improvement
6. tone - analyze the sales rep's tone
7. emotionalIntelligence - score (0-100) for how well the rep read and responded to prospect emotions`
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: audioBase64
              }
            }
          ]
        }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini audio API error response:', errorText);
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?..[0]?.text;

  if (!text) throw new Error('No response from Gemini');

  const result = JSON.parse(text);

  return {
    score: result.score || 75,
    summary: result.summary || 'Analysis completed',
    strengths: result.strengths || [],
    improvements: result.improvements || [],
    tone: result.tone || 'Professional',
    emotionalIntelligence: result.emotionalIntelligence || 70,
    transcript: result.transcript || 'Transcript unavailable'
  };
}

// Mock Analysis (Last Resort)
function generateMockAnalysis(transcript: string): CallAnalysisResult {
  const wordCount = transcript.split(' ').length;
  const hasGreeting = /hello|hi|good morning|good afternoon/i.test(transcript);
  const hasClosing = /thank you|thanks|appreciate|follow up/i.test(transcript);

  let score = 70;
  if (hasGreeting) score += 10;
  if (hasClosing) score += 10;
  if (wordCount > 100) score += 5;

  return {
    score: Math.min(score, 95),
    summary: 'This is a demo analysis. Please configure OpenAI or Gemini API keys for real AI analysis. The call shows basic sales structure with room for improvement.',
    strengths: [
      'Clear communication throughout the conversation',
      'Maintained professional tone',
      'Attempted to address customer needs'
    ],
    improvements: [
      'Could ask more discovery questions to understand pain points',
      'Consider stronger value proposition presentation',
      'Work on handling objections more confidently'
    ],
    tone: 'Professional and courteous',
    emotionalIntelligence: 72,
    transcript: transcript
  };
}
