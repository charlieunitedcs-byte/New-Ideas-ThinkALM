import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { CallAnalysisResult } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Debug logging
console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 10)}...` : 'MISSING');
console.log('Environment:', import.meta.env);

// Initialize client securely.
// Note: In a real production app, analysis logic should ideally happen server-side
// to protect the key, but for this SPA demo, we use it directly.
const ai = new GoogleGenAI({ apiKey });

// Helper function to retry API calls with exponential backoff
// Increased retries for production reliability
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 5,
  initialDelay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isOverloaded = error?.message?.includes('overloaded') ||
                          error?.status === 'UNAVAILABLE' ||
                          error?.code === 503;

      const isLastAttempt = i === maxRetries - 1;

      if (!isOverloaded || isLastAttempt) {
        throw error;
      }

      // Wait with exponential backoff
      const delay = initialDelay * Math.pow(2, i);
      console.log(`API overloaded, retrying in ${delay}ms... (attempt ${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

export const analyzeCallTranscript = async (transcript: string): Promise<CallAnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  // Using gemini-1.5-flash-latest for better availability
  const model = "gemini-1.5-flash-latest";
  
  const prompt = `
    You are an expert sales coach for "Think ABC". Analyze the following sales call transcript.
    Provide a JSON response with:
    1. A performance score (0-100).
    2. A brief executive summary (max 2 sentences).
    3. Top 3 strengths.
    4. Top 3 areas for improvement.
    5. Tone analysis - analyze the sales rep's tone (e.g., confident, hesitant, enthusiastic, pushy, professional, etc.)
    6. Emotional intelligence score (0-100) - how well did the rep read and respond to the prospect's emotions?

    Transcript:
    "${transcript}"
  `;

  try {
    return await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              tone: { type: Type.STRING },
              emotionalIntelligence: { type: Type.NUMBER },
            },
            required: ["score", "summary", "strengths", "improvements", "tone", "emotionalIntelligence"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      const result = JSON.parse(text);
      return {
        ...result,
        transcript: transcript
      };
    });

  } catch (error: any) {
    console.error("Analysis failed", error);
    if (error?.message?.includes('overloaded') || error?.status === 'UNAVAILABLE') {
      throw new Error("Google AI is currently overloaded. Please try again in a few moments.");
    }
    throw error;
  }
};

export const analyzeCallAudio = async (audioFile: File): Promise<CallAnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  // Using gemini-1.5-flash-latest for better availability
  const model = "gemini-1.5-flash-latest";

  try {
    // Convert audio file to base64
    const base64Audio = await fileToBase64(audioFile);

    const prompt = `
      You are an expert sales coach for "Think ABC".

      Listen to this sales call recording and provide a comprehensive analysis.

      Provide a JSON response with:
      1. transcript - the full transcript of the conversation with speaker labels (Sales Rep: and Prospect:)
      2. score - performance score (0-100)
      3. summary - brief executive summary (max 2 sentences)
      4. strengths - array of top 3 strengths
      5. improvements - array of top 3 areas for improvement
      6. tone - analyze the sales rep's tone (e.g., confident, hesitant, enthusiastic, pushy, professional)
      7. emotionalIntelligence - score (0-100) for how well the rep read and responded to prospect emotions
    `;

    return await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: audioFile.type || 'audio/mpeg',
                  data: base64Audio
                }
              }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              transcript: { type: Type.STRING },
              score: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              tone: { type: Type.STRING },
              emotionalIntelligence: { type: Type.NUMBER },
            },
            required: ["transcript", "score", "summary", "strengths", "improvements", "tone", "emotionalIntelligence"],
          },
        },
      });

      const text = response.text;
      if (!text) throw new Error("No response from AI");

      return JSON.parse(text);
    });

  } catch (error: any) {
    console.error("Audio analysis failed", error);
    if (error?.message?.includes('overloaded') || error?.status === 'UNAVAILABLE') {
      throw new Error("Google AI is currently overloaded. Please try again in a few moments.");
    }
    throw error;
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

export const startRoleplaySession = (customSystemInstruction?: string) => {
  if (!apiKey) {
    console.warn("API Key missing for roleplay");
    return null;
  }

  // Use custom instruction or fall back to default
  const systemInstruction = customSystemInstruction || "You are a skeptical but interested potential buyer for a SaaS product (Think ABC). You are speaking with a sales representative. Be realistic, ask about pricing, implementation time, and competitor differentiation. Keep responses concise (under 50 words) to mimic real conversation.";

  // Initialize a chat session
  const chat = ai.chats.create({
    model: "gemini-2.0-flash-exp",
    config: {
      systemInstruction: systemInstruction,
    },
  });

  return chat;
};

// --- Search Grounding ---

export interface SearchResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export const searchMarketIntel = async (query: string): Promise<SearchResult> => {
  if (!apiKey) throw new Error("API Key is missing.");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Extract sources from grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web)
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    return {
      text: response.text || "No results found.",
      sources: sources
    };
  } catch (error) {
    console.error("Search failed", error);
    throw error;
  }
};

// --- Image Generation ---

export const generateMarketingImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");

  try {
    const response = await ai.models.generateContent({
      model: 'imagen-3.0-generate-001',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "16:9" // Defaulting to landscape for slides/marketing
        },
      },
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        imageUrl = `data:image/png;base64,${base64EncodeString}`;
        break;
      }
    }

    if (!imageUrl) throw new Error("No image generated.");
    return imageUrl;

  } catch (error) {
    console.error("Image generation failed", error);
    throw error;
  }
};


// --- Live API (Voice) Support ---

export interface LiveSessionController {
    disconnect: () => void;
    sendAudioChunk: (base64Audio: string) => void;
}

export const connectToLiveSession = async (
    onAudioData: (audioBuffer: AudioBuffer) => void,
    onClose: () => void,
    systemInstruction: string = "You are a helpful assistant."
): Promise<LiveSessionController> => {
    
    // 1. Audio Context Setup for Playback
    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = outputAudioContext.createGain();
    outputNode.connect(outputAudioContext.destination);
    
    let nextStartTime = 0;
    const sources = new Set<AudioBufferSourceNode>();

    // 2. Input Audio Setup (Microphone)
    const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = inputAudioContext.createMediaStreamSource(stream);
    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    // 3. Connect to Gemini Live
    const sessionPromise = ai.live.connect({
        model: 'gemini-2.0-flash-exp',
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
            systemInstruction: systemInstruction,
        },
        callbacks: {
            onopen: () => {
                console.log("Gemini Live Session Opened");

                // Send initial text message to trigger AI greeting
                sessionPromise.then((session) => {
                    session.send("Please greet the sales rep and begin the roleplay scenario. Start the conversation naturally as a prospect.");
                });

                // Start processing microphone input
                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmData = createPCMData(inputData);
                    const base64Data = encode(pcmData);

                    sessionPromise.then((session) => {
                        session.sendRealtimeInput({
                            media: {
                                mimeType: 'audio/pcm;rate=16000',
                                data: base64Data
                            }
                        });
                    });
                };

                source.connect(scriptProcessor);
                scriptProcessor.connect(inputAudioContext.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                
                if (base64Audio) {
                    try {
                        const audioData = decode(base64Audio);
                        const audioBuffer = await decodeAudioData(audioData, outputAudioContext, 24000, 1);
                        
                        // Pass buffer to UI for visualizer if needed, or just play it
                        onAudioData(audioBuffer); 

                        // Schedule playback
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        
                        // Sync playback time
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        source.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                        
                        source.onended = () => {
                            sources.delete(source);
                        };
                        sources.add(source);
                    } catch (e) {
                        console.error("Error decoding audio response", e);
                    }
                }

                // Handle interruptions
                if (message.serverContent?.interrupted) {
                    sources.forEach(s => s.stop());
                    sources.clear();
                    nextStartTime = 0;
                }
            },
            onclose: () => {
                console.log("Gemini Live Session Closed");
                onClose();
            },
            onerror: (err) => {
                console.error("Gemini Live Session Error", err);
                onClose();
            }
        }
    });

    return {
        disconnect: () => {
            sessionPromise.then(session => session.close());
            stream.getTracks().forEach(track => track.stop());
            inputAudioContext.close();
            outputAudioContext.close();
        },
        sendAudioChunk: (data) => {
            // Handled automatically by scriptProcessor
        }
    };
};

// --- Audio Utilities ---

function createPCMData(inputData: Float32Array): Uint8Array {
    const l = inputData.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = inputData[i] * 32768;
    }
    return new Uint8Array(int16.buffer);
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}