import { GoogleGenAI } from '@google/genai';

export async function generateSKU(name: string, category: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Produto: ${name}\nCategoria: ${category}`,
    config: {
      systemInstruction: 'Você é um gerador de SKUs para um e-commerce. Receba o nome e categoria de um produto e retorne APENAS um código SKU curto (ex: 5 a 7 caracteres alfanuméricos), fácil de ler, sem formatação markdown.',
      temperature: 0.7,
    },
  });

  return response.text?.trim() || '';
}
