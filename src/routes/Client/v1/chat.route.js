import express from 'express'
import {
  createConversation,
  sendMessage,
  getConversations,
  getMessages,
  deleteConversation,
  sttController,
  ttsController
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
Router.post('/tts', ttsController);
export const chatRoute = Router;