import { validateNewsletter } from '../schemas/NewsletterSchema.js'

/**
 * @property {string} newsletterModel
 */

export class NewsletterController {
  constructor ({ NewsletterModel }) {
    this.newsletterModel = NewsletterModel
  }

  getAll = async (req, res) => {
    const newsletters = await this.newsletterModel.getAll()
    res.json(newsletters)
  }

  getById = async (req, res) => {
    const { id } = req.params
    const newsletter = await this.newsletterModel.getById({ id })
    if (newsletter) {
      return res.json(newsletter)
    } else {
      return res.status(404).json({ message: 'Newsletter not found' })
    }
  }

  create = async (req, res) => {
    // const input = { requestBody: req.body }
    // res.json(input.requestBody)
    const input = validateNewsletter(req.body)
    // const { email } = input
    // res.json({ input })
    if (!input.success) {
      return res.status(400).json({ error: JSON.parse(input.error.message) })
    }

    const newsletter = await this.newsletterModel.create({ input: input.data })

    if (newsletter) {
      res.status(201).json({ message: 'Newsletter creada.' })
    } else {
      return res.status(404).json({ message: 'Newsletter no creada.' })
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
      res.status(200).json({ message: 'Newsletter actualizada.', newsletter })
    } else {
      return res.status(404).json({ message: 'Newsletter no encontrada.' })
    }
  }

  delete = async (req, res) => {
    const { id } = req.params
    const newsletter = await this.newsletterModel.delete({ id })

    if (newsletter) {
      res.status(200).json({ message: 'Newsletter eliminada.', newsletter })
    } else {
      return res.status(404).json({ message: 'Newsletter no encontrada.' })
    }
  }
}
