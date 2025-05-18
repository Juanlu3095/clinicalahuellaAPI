import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_TOKEN })

// Es sólo una función. En caso de que fuesen varias funciones interrelacionadas entre sí, lo
// preferible sería crear una clase e inyectar las propiedades al instanciar
export const AiService = async (query) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: query
  })
  return response
}
