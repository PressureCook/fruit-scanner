
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI(), // Automatically looks for GOOGLE_GENAI_API_KEY or GEMINI_API_KEY
  ],
});
