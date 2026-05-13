import express from 'express'

import { chatController } from '../../../controllers/Client/chat.controller.js'
import multer from 'multer'
const upload = multer()

const Router = express.Router()

Router.post('/conversation', chatController.createConversation)
Router.post('/message', chatController.sendMessage)
Router.get('/conversations/:userId', chatController.getConversations)
Router.get('/messages/:conversationId', chatController.getMessages)

Router.route('/conversation/:conversationId')
  .delete(chatController.deleteConversation)
  .put(chatController.renameConversation)

Router.delete('/conversations/all', chatController.deleteAllConversations)
Router.post('/message-stream', chatController.streamMessage)

Router.post('/stt', upload.single('file'), chatController.sttController)
Router.post('/tts', chatController.ttsController);

export const chatRoute = Router;