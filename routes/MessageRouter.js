import { Router } from 'express'
import { MessageController } from '../controllers/MessageController.js'

export const createMessageRouter = ({ MessageModel }) => {
  const messageRouter = Router()

  const messageController = new MessageController({ MessageModel })

  messageRouter.get('/', messageController.getAll)

  messageRouter.get('/:id', messageController.getById)

  messageRouter.post('/', messageController.create)

  messageRouter.put('/:id', messageController.update)

  messageRouter.patch('/:id', messageController.patch)

  messageRouter.delete('/:id', messageController.delete)

  return messageRouter
}
