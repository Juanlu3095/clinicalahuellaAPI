import { AiService } from '../services/AiService.js'

export class AiController {
  aiconsulta = async (req, res) => {
    const { query } = req.body
    const response = await AiService(query)
    res.send(response)
  }
}
