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
    const [newsletter] = await this.newsletterModel.getById({ id })
    if (newsletter) {
      return res.json(newsletter)
    } else {
      return res.status(404).json({ message: 'Newsletter not found' })
    }
  }
}
