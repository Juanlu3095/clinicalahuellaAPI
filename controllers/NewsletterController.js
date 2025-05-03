import { validateNewsletter } from '../schemas/NewsletterSchema.js'

/**
 * It allows to use a model for this controller
 * @property {string} newsletterModel
 */

export class NewsletterController {
  constructor ({ NewsletterModel }) {
    this.newsletterModel = NewsletterModel
  }

  getAll = async (req, res) => {
    const newsletters = await this.newsletterModel.getAll()
    res.json({ message: 'Newsletters encontradas.', data: newsletters })
  }

  getById = async (req, res) => {
    const { id } = req.params
    const newsletter = await this.newsletterModel.getById({ id })
    if (newsletter) {
      return res.json({ message: 'Newsletter encontrada.', data: newsletter })
    } else {
      return res.status(404).json({ error: 'Newsletter no encontrada.' })
    }
  }

  create = async (req, res) => {
    // const input = { requestBody: req.body }
    // res.json(input.requestBody)
    const input = validateNewsletter(req.body)
    // const { email } = input
    // res.json({ input })
    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    const newsletter = await this.newsletterModel.create({ input: input.data })

    if (newsletter) {
      res.status(201).json({ message: 'Newsletter creada.' })
    } else {
      return res.status(500).json({ error: 'Newsletter no creada.' })
    }
  }

  update = async (req, res) => {
    // const { email } = req.body
    const input = validateNewsletter(req.body)
    const { id } = req.params

    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const newsletter = await this.newsletterModel.update({ id, input: input.data }) // Al pasar la validacion el email está en input.data
    if (newsletter) {
      res.json({ message: 'Newsletter actualizada.' })
    } else {
      return res.status(404).json({ error: 'Newsletter no encontrada.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const newsletter = await this.newsletterModel.delete({ id })

    if (newsletter) {
      res.json({ message: 'Newsletter eliminada.' })
    } else {
      return res.status(404).json({ error: 'Newsletter no encontrada.' })
    }
  }

  deleteSelection = async (req, res) => {
    const { ids } = req.body
    const newsletters = await this.newsletterModel.deleteSelection({ ids })

    if (newsletters) {
      res.json({ message: 'Newsletters eliminadas.' }) // Comprobar si esto le sirve de algo al frontend en categorias
    } else {
      return res.status(404).json({ error: 'Newsletters no encontradas.' })
    }
  }
}
