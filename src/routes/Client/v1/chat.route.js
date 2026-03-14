// back-end/src/routes/chatRoutes.js
import express from 'express'
import {
  createConversation,
  sendMessage,
  getConversations,
  getMessages,
  deleteConversation,
} from '../../../controllers/Client/chat.controller.js'

const Router = express.Router()

Router.post('/conversation', createConversation)
Router.post('/message', sendMessage)
Router.get('/conversations/:userId', getConversations)
Router.get('/messages/:conversationId', getMessages)
Router.delete('/conversation/:conversationId', deleteConversation)

export const chatRoute = Router;