import { AiChat } from '../services/AiService.js'

export class AiController {
  aiconsulta = async (req, res) => {
    const { messages } = req.body
    const response = await AiChat(messages)
    if (response) {
      res.send(response)
    } else {
      res.status(500).json({ error: 'Ha ocurrido un error con su petición.' })
    }
  }
}
