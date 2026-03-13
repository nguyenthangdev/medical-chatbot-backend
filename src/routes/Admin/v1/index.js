import express from 'express';
import { authRoute } from './auth.route.js'; 
import { myAccountRoute } from './my-account.route.js'; 
import { userRoute } from './user.route.js';
import { conversationRoute } from './conversation.route.js';
import { messageRoute } from './message.route.js'; // 1. Import

const Router = express.Router();

Router.use('/auth', authRoute); 
Router.use('/my-account', myAccountRoute); 
Router.use('/users', userRoute);
Router.use('/conversations', conversationRoute);
Router.use('/messages', messageRoute); // 2. Đăng ký

export const APIs_V1 = Router;