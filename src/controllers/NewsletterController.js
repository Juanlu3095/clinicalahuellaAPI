import { validateNewsletter } from '../schemas/NewsletterSchema.js'
import { repeatedValues } from '../database/utilities/validations.js'

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
    if (newsletters.length > 0) {
      res.json({ message: 'Newsletters encontradas.', data: newsletters })
    } else {
      res.status(404).json({ error: 'Newsletters no encontradas.' })
    }
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
    const input = validateNewsletter(req.body)

    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    // Se comprueba que no haya otro email inscrito en la tabla
    const sameEmail = await repeatedValues('newsletters', 'email', input.data.email)
    if (sameEmail > 0) {
      return res.status(409).json({ error: 'Newsletter ya existente.' }) // Conflicto con un email ya existente, por eso el 409
    }

    const newsletter = await this.newsletterModel.create({ input: input.data })

    if (newsletter) {
      res.status(201).json({ message: 'Newsletter creada.' })
    } else {
      return res.status(500).json({ error: 'Newsletter no creada.' })
    }
  }

  update = async (req, res) => {
    const input = validateNewsletter(req.body)
    const { id } = req.params

    if (!input.success) {
      return res.status(422).json({ error: JSON.parse(input.error.message) })
    }

    // Se comprueba que el email no se repita al editarlo
    const repeatedEmail = await repeatedValues('newsletters', 'email', input.data.email)
    const emailToEdit = await this.newsletterModel.getById({ id })
    if (repeatedEmail > 1) { // Si hay más de uno repetido se devuelve 409
      return res.status(409).json({ error: 'Newsletter ya existente.' }) // Conflicto con un email ya existente, distinto del que se quiere editar
    } else if (repeatedEmail === 1 && emailToEdit.email !== input.data.email) {
      return res.status(409).json({ error: 'Newsletter ya existente.' }) // El conflicto podría ser con otro email existente o con el que se 'edita' pero no se cambia realmente por el usuario
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
      res.json({ message: 'Newsletters eliminadas.' })
    } else {
      return res.status(404).json({ error: 'Newsletters no encontradas.' })
    }
  }
}
