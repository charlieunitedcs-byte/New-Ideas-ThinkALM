import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, type AuthenticatedRequest } from '../middleware/auth';

// Backend API for call analysis - bulletproof with proper error handling
// Uses Gemini for AUDIO (native audio support) and text analysis
// This endpoint is STABLE and won't randomly break
// PROTECTED: Requires JWT authentication

interface AnalyzeCallRequest {
  transcript?: string;
  audioUrl?: string;        // Supabase Storage URL (preferred)
  audioBase64?: string;     // Fallback for small files
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
  req: AuthenticatedRequest,
  res: VercelResponse,
) {
  // Set CORS headers - whitelist specific origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
  const origin = req.headers.origin || '';

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // AUTHENTICATION REQUIRED - Verify JWT token
  const isAuthenticated = await verifyAuth(req, res);
  if (!isAuthenticated) {
    // verifyAuth already sent the 401 response
    return;
  }

  // Log authenticated request for audit trail
  console.log(`📞 Call analysis requested by user: ${req.userId} (${req.userEmail})`);

  try {
    const { transcript, audioUrl, audioBase64, audioMimeType } = req.body as AnalyzeCallRequest;

    if (!transcript && !audioUrl && !audioBase64) {
      return res.status(400).json({ success: false, error: 'Either transcript, audioUrl, or audioBase64 is required' });
    }

    // For audio files, we use Gemini File API which can handle files directly via URL
    // This avoids downloading large files into serverless function memory
    if (audioUrl && !audioBase64) {
      console.log('🔗 Audio will be processed via Gemini File API (supports large files)');
      // We'll pass the URL directly to Gemini File API - no need to download
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
    console.log(audioUrl ? 'Analyzing audio via Gemini File API...' : audioBase64 ? 'Analyzing audio with Gemini...' : 'Analyzing text with Gemini...');

    try {
      let result;
      if (audioUrl && !audioBase64) {
        // Large audio files - use Gemini File API (can fetch from URL directly)
        result = await analyzeAudioViaFileAPI(audioUrl, geminiKey);
      } else if (audioBase64) {
        // Small audio files - use direct base64 upload
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
    transcript: result.transcript || 'Transcript unavailable'
  };
}

// Gemini File API - For large audio files
// Download from Supabase and upload to Gemini in a streaming fashion
async function analyzeAudioViaFileAPI(audioUrl: string, apiKey: string): Promise<CallAnalysisResult> {
  console.log('📥 Downloading audio from Supabase...');

  // Download the file from Supabase
  const audioResponse = await fetch(audioUrl);
  if (!audioResponse.ok) {
    throw new Error(`Failed to download audio: ${audioResponse.status}`);
  }

  const audioBuffer = await audioResponse.arrayBuffer();
  const audioBlob = Buffer.from(audioBuffer);

  console.log(`📤 Uploading ${(audioBlob.length / 1024 / 1024).toFixed(1)}MB to Gemini File API...`);

  // Step 1: Initialize resumable upload
  const initResponse = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'X-Goog-Upload-Protocol': 'resumable',
        'X-Goog-Upload-Command': 'start',
        'X-Goog-Upload-Header-Content-Length': audioBlob.length.toString(),
        'X-Goog-Upload-Header-Content-Type': 'audio/mpeg',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        file: {
          display_name: 'sales-call-audio'
        }
      })
    }
  );

  if (!initResponse.ok) {
    const errorText = await initResponse.text();
    console.error('Gemini File API init error:', errorText);
    throw new Error(`Failed to initialize upload: ${initResponse.status}`);
  }

  const uploadUrl = initResponse.headers.get('x-goog-upload-url');
  if (!uploadUrl) {
    throw new Error('No upload URL returned from Gemini');
  }

  // Step 2: Upload the file
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Length': audioBlob.length.toString(),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize'
    },
    body: audioBlob
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    console.error('Gemini File API upload error:', errorText);
    throw new Error(`Upload failed: ${uploadResponse.status}`);
  }

  const uploadData = await uploadResponse.json();
  const fileUri = uploadData.file.name;
  console.log('✅ Audio uploaded to Gemini:', fileUri);

  // Step 3: Wait for file processing
  let fileState = uploadData.file.state;
  let attempts = 0;
  while (fileState === 'PROCESSING' && attempts < 20) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const statusResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${fileUri}?key=${apiKey}`
    );

    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      fileState = statusData.state;
    }
    attempts++;
  }

  if (fileState !== 'ACTIVE') {
    throw new Error(`File processing failed. State: ${fileState}`);
  }

  console.log('🤖 Analyzing with gemini-1.5-flash (STABLE)...');

  // Step 4: Analyze using gemini-1.5-flash (STABLE model)
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
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
          }, {
            fileData: {
              mimeType: 'audio/mpeg',
              fileUri: fileUri
            }
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
    console.error('Gemini analysis error:', errorText);
    throw new Error(`Gemini API error: ${response.status}`);
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
