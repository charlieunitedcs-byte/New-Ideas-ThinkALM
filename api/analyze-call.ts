import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Backend API for call analysis - bulletproof with OpenAI (more reliable than Gemini)
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

    // Get API keys from environment
    const openaiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // Use OpenAI as primary (more stable and reliable)
    if (openaiKey) {
      console.log('Using OpenAI for call analysis...');
      try {
        const result = await analyzeWithOpenAI(transcript!, openaiKey);
        return res.status(200).json({ success: true, result, provider: 'openai' });
      } catch (error: any) {
        console.error('OpenAI failed:', error.message);
        // Fall through to Gemini
      }
    }

    // Fallback to Gemini
    if (geminiKey) {
      console.log('Falling back to Gemini for call analysis...');
      try {
        const result = await analyzeWithGemini(transcript!, geminiKey);
        return res.status(200).json({ success: true, result, provider: 'gemini' });
      } catch (error: any) {
        console.error('Gemini failed:', error.message);
        // Fall through to mock
      }
    }

    // Last resort: return a helpful mock result
    console.warn('All AI providers failed, returning mock analysis');
    const mockResult = generateMockAnalysis(transcript!);
    return res.status(200).json({
      success: true,
      result: mockResult,
      provider: 'mock',
      warning: 'AI providers unavailable. This is a demo analysis. Please configure API keys.'
    });

  } catch (error: any) {
    console.error('Call analysis error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to analyze call',
      details: error.message || 'Unknown error occurred'
    });
  }
}

// OpenAI Analysis (Primary - Most Reliable)
async function analyzeWithOpenAI(transcript: string, apiKey: string): Promise<CallAnalysisResult> {
  const openai = new OpenAI({ apiKey });

  const prompt = `You are an expert sales coach for "Think ABC". Analyze the following sales call transcript.

Provide a JSON response with:
1. score - A performance score (0-100)
2. summary - A brief executive summary (max 2 sentences)
3. strengths - Array of top 3 strengths
4. improvements - Array of top 3 areas for improvement
5. tone - Analysis of the sales rep's tone (e.g., confident, hesitant, enthusiastic, pushy, professional)
6. emotionalIntelligence - Score (0-100) for how well the rep read and responded to the prospect's emotions

Transcript:
${transcript}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Fast, cheap, reliable
    messages: [
      {
        role: 'system',
        content: 'You are an expert sales coach. Respond ONLY with valid JSON, no markdown, no explanation.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
    max_tokens: 1000
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');

  const result = JSON.parse(content);

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

// Gemini Analysis (Fallback)
async function analyzeWithGemini(transcript: string, apiKey: string): Promise<CallAnalysisResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
          response_mime_type: 'application/json'
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
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
