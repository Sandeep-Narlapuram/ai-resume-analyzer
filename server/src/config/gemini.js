import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from './env.js';

let client = null;

export function getGeminiClient() {
  if (!env.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  if (!client) {
    client = new GoogleGenerativeAI(env.gemini.apiKey);
  }
  return client;
}

export function getGeminiModel() {
  return getGeminiClient().getGenerativeModel({
    model: env.gemini.model,
    generationConfig: {
      temperature: 0.3,
      responseMimeType: 'application/json',
    },
  });
}
