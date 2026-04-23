// File: api/chat.js
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Inisialisasi API Key dari Environment Variable
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
});

// Konfigurasi Edge Runtime agar respon streaming super cepat
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Vercel AI SDK akan otomatis mengirimkan array messages dari frontend ke sini
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-1.5-flash'), // Model yang ringan, pintar, dan murah
    messages,
    system: 'Kamu adalah Health Assistant bernama Nuri dari IPB Wellness Hub. Jawab pertanyaan seputar kesehatan, gizi, olahraga, dan gaya hidup sehat dalam Bahasa Indonesia. Jawab dengan ramah, singkat, dan informatif ala mahasiswa.',
  });

  // Mengembalikan data secara streaming (seperti ngetik sendiri di UI)
  return result.toDataStreamResponse();
}
