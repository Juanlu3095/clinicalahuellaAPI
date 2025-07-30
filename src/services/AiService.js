import { GoogleGenAI } from '@google/genai'
import { errorLogs } from './errorlogs.js'

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_TOKEN })

// Es sólo una función. En caso de que fuesen varias funciones interrelacionadas entre sí, lo
// preferible sería crear una clase e inyectar las propiedades al instanciar

/**
 * It sends a message to Gemini AI without context. The AI will not follow chat context.
 * @param {string} query Message from user to bot
 * @returns
 */
export const AiSimpleMessage = async (query) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: query
    })
    return response
  } catch (error) {
    if (error instanceof Error) {
      errorLogs(error)
    }
  }
}

/**
 * It lets to have a chat with Gemini AI. You need to send the chat history with every message to work.
 * @param {Object} messages Messages from both user and model received from Frontend
 * @returns {GenerateContentResponse}
 */
export const AiChat = async (messages) => {
  try {
    const history = []
    if (messages.length > 0) {
      messages.forEach(message => {
        history.push({
          role: message.actor,
          parts: [{ text: message.message }]
        })
      })
    }

    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      history
    })

    const stream = await chat.sendMessage({
      message: messages[messages.length - 1].message // Obtenemos el último mensaje del historial, que es la query del user
    })

    return stream
  } catch (error) {
    if (error instanceof Error) {
      errorLogs(error)
    }
  }
}
