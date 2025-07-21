import { Router } from 'express'
import { MessageController } from '../controllers/MessageController.js'
import { verifyJwt } from '../middlewares/jwt.js'

export const createMessageRouter = ({ MessageModel }) => {
  const messageRouter = Router()

  const messageController = new MessageController({ MessageModel })

  messageRouter.get('/', verifyJwt, messageController.getAll)

  messageRouter.get('/:id', verifyJwt, messageController.getById)

  messageRouter.post('/', messageController.create)

  messageRouter.put('/:id', verifyJwt, messageController.update)

  messageRouter.patch('/:id', verifyJwt, messageController.patch)

  messageRouter.delete('/:id', verifyJwt, messageController.delete)

  messageRouter.delete('/', verifyJwt, messageController.deleteSelection)

  return messageRouter
}
