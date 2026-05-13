import express from 'express';
import { authRoute } from './auth.route.js'; 
import { myProfileRoute } from './myProfile.route.js'; 
import { userRoute } from './user.route.js';
import { conversationRoute } from './conversation.route.js';
import { messageRoute } from './message.route.js';
import { requireAuth } from '../../../middlewares/Admin/auth.middleware.js';
import { accountRoute } from './account.route.js';
import { uploadRoute } from '../../General/upload.route.js';
import { settingRoute } from './setting.route.js'

const Router = express.Router();

Router.use('/auth', authRoute); 
Router.use('/my-profile', requireAuth, myProfileRoute); 
Router.use('/users', requireAuth, userRoute);
Router.use('/conversations', requireAuth, conversationRoute);
Router.use('/messages', requireAuth, messageRoute);
Router.use('/accounts', requireAuth, accountRoute);
Router.use('/upload', uploadRoute);
Router.use('/settings', requireAuth, settingRoute)

export const APIs_V1 = Router;