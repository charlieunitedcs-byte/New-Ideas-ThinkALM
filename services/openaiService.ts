import OpenAI from 'openai';
import { CallAnalysisResult } from '../types';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // For demo purposes - in production, use server-side API
});

export const analyzeCallTranscript = async (transcript: string): Promise<CallAnalysisResult> => {
  if (!apiKey) {
    throw new Error("OpenAI API Key is missing. Please set VITE_OPENAI_API_KEY in your .env file.");
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert sales coach for Think ABC. Analyze sales call transcripts and provide structured feedback in JSON format."
        },
        {
          role: "user",
          content: `Analyze this sales call transcript and provide a JSON response with:
1. score: performance score (0-100)
2. summary: brief executive summary (max 2 sentences)
3. strengths: array of top 3 strengths
4. improvements: array of top 3 areas for improvement
5. tone: analyze the sales rep's tone (e.g., confident, hesitant, enthusiastic, pushy, professional)
6. emotionalIntelligence: score (0-100) for how well the rep read and responded to prospect emotions

Transcript:
${transcript}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) throw new Error("No response from OpenAI");

    const result = JSON.parse(responseText);
    return {
      ...result,
      transcript: transcript
    };

  } catch (error) {
    console.error("OpenAI analysis failed:", error);
    throw error;
  }
};

export const analyzeCallAudio = async (audioFile: File): Promise<CallAnalysisResult> => {
  if (!apiKey) {
    throw new Error("OpenAI API Key is missing. Please set VITE_OPENAI_API_KEY in your .env file.");
  }

  try {
    // Step 1: Transcribe audio with Whisper
    console.log("Transcribing audio with Whisper...");
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      response_format: "verbose_json",
      timestamp_granularities: ["segment"]
    });

    const transcript = transcription.text;
    console.log("Transcription complete:", transcript.substring(0, 100) + "...");

    // Step 2: Analyze the transcript with GPT-4
    console.log("Analyzing transcript with GPT-4...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert sales coach for Think ABC. Analyze sales call transcripts and provide structured feedback in JSON format."
        },
        {
          role: "user",
          content: `Analyze this sales call transcript and provide a JSON response with:
1. score: performance score (0-100)
2. summary: brief executive summary (max 2 sentences)
3. strengths: array of top 3 strengths
4. improvements: array of top 3 areas for improvement
5. tone: analyze the sales rep's tone (e.g., confident, hesitant, enthusiastic, pushy, professional)
6. emotionalIntelligence: score (0-100) for how well the rep read and responded to prospect emotions

Transcript:
${transcript}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) throw new Error("No response from OpenAI");

    const result = JSON.parse(responseText);
    return {
      ...result,
      transcript: transcript
    };

  } catch (error) {
    console.error("OpenAI audio analysis failed:", error);
    throw error;
  }
};
