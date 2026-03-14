// back-end/src/routes/chatRoutes.js
import express from 'express'
import {
  createConversation,
  sendMessage,
  getConversations,
  getMessages,
  deleteConversation,
  sttController
} from '../../../controllers/Client/chat.controller.js'
import multer from 'multer'
const upload = multer()

const Router = express.Router()

Router.post('/conversation', createConversation)
Router.post('/message', sendMessage)
Router.get('/conversations/:userId', getConversations)
Router.get('/messages/:conversationId', getMessages)
Router.delete('/conversation/:conversationId', deleteConversation)

Router.post('/stt', upload.single('file'), sttController)

export const chatRoute = Router;