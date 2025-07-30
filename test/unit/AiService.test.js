import { describe, expect, test, jest } from '@jest/globals'

const simpleMessage = 'Hola'

const aiResponse = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: '¡Hola! ¿En qué puedo ayudarte hoy?\n'
          }
        ],
        role: 'model'
      }
    }
  ]
}

const chatHistory = [
  {
    actor: 'user',
    message: '¡Hola!'
  }
]

const dummyError = 'Error al recibir respuesta.'

// Mockeamos las funciones en AiService y errorLogs
const mockAiSimpleMessage = jest.fn()
const mockAiChat = jest.fn()
const mockErrorlLogs = jest.fn()

// Mock AiService
jest.unstable_mockModule('../../src/services/AiService.js', () => ({
  AiSimpleMessage: mockAiSimpleMessage,
  AiChat: mockAiChat
}))

// Mock errorLogs
jest.unstable_mockModule('../../src/services/errorlogs.js', () => ({
  errorLogs: mockErrorlLogs
}))

const { AiSimpleMessage, AiChat } = await import('../../src/services/AiService.js')

describe('AiService', () => {
  test('should get a simple response from ai', async () => {
    mockAiSimpleMessage.mockResolvedValue(aiResponse)
    const response = await AiSimpleMessage(simpleMessage)
    expect(response.candidates[0].content.role).toBe('model')
    expect(response.candidates[0].content.parts[0].text).toEqual('¡Hola! ¿En qué puedo ayudarte hoy?\n')
  })

  test('should not get a simple response from ai', async () => {
    const googleAiMock = jest.mock('@google/genai', () => {
      return {
        GoogleGenAI: jest.fn().mockImplementation(() => ({ // El objeto instanciado
          models: () => ({ // La propiedad dentro del objeto
            generateContent: jest.fn().mockRejectedValue(new Error(dummyError)) // El método dentro de la propiedad
          })
        }))
      }
    })

    try {
      await AiSimpleMessage(simpleMessage)
    } catch (error) {
      expect(error).toEqual(new Error(dummyError))
      expect(googleAiMock).toHaveBeenCalled()
      expect(mockErrorlLogs).toHaveBeenCalledWith(dummyError)
    }
  })

  test('should get a response from chat with ai', async () => {
    mockAiChat.mockResolvedValue(aiResponse)
    const response = await AiChat(chatHistory)
    expect(response.candidates[0].content.role).toBe('model')
    expect(response.candidates[0].content.parts[0].text).toBe('¡Hola! ¿En qué puedo ayudarte hoy?\n')
  })

  test('should not get a response from chat with ai', async () => {
    const googleAiMock = jest.mock('@google/genai', () => {
      return {
        GoogleGenAI: jest.fn().mockImplementation(() => ({ // El objeto instanciado
          chats: () => {
            return {
              create: () => {}, // Este método no nos interesa realmente, por lo que no necesita implementación.
              sendMessage: jest.fn().mockRejectedValue(new Error(dummyError)) // El método dentro de la propiedad que lanza el error.
            }
          }
        }))
      }
    })

    try {
      await AiChat(chatHistory)
    } catch (error) {
      expect(error).toEqual(new Error(dummyError))
      expect(googleAiMock).toHaveBeenCalled()
      expect(mockErrorlLogs).toHaveBeenCalledWith(dummyError)
    }
  })
})
