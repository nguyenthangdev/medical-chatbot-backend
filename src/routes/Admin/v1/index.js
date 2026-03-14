import express from 'express';
import { authRoute } from './auth.route.js'; 
import { myAccountRoute } from './myAccount.route.js'; 
import { userRoute } from './user.route.js';
import { conversationRoute } from './conversation.route.js';
import { messageRoute } from './message.route.js';
import { requireAuth } from '../../../middlewares/auth.middleware.js';

const Router = express.Router();

Router.use('/auth', authRoute); 
Router.use('/my-account', requireAuth, myAccountRoute); 
Router.use('/users', userRoute);
Router.use('/conversations', conversationRoute);
Router.use('/messages', messageRoute);

export const APIs_V1 = Router;