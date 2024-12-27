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
    const input = req.body
    // const { email } = input
    // res.json({ input })
    const newsletter = await this.newsletterModel.create({ input })
    if (newsletter) {
      res.status(201).json({ message: 'Newsletter creada.' })
    } else {
      return res.status(404).json({ message: 'Newsletter no creada.' })
    }
  }

  update = async (req, res) => {
    // const { email } = req.body
    const input = req.body
    const { id } = req.params

    // res.json(`Input: ${email}, Id: ${id}`)

    const newsletter = await this.newsletterModel.update({ id, input })
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
