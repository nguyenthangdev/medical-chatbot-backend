import express from 'express';
import { authRoute } from './auth.route.js'; 
import { myProfileRoute } from './myProfile.route.js'; 
import { userRoute } from './user.route.js';
import { conversationRoute } from './conversation.route.js';
import { messageRoute } from './message.route.js';
import { accountRoute } from './account.route.js';
import { uploadRoute } from '../../General/upload.route.js';
import { settingRoute } from './setting.route.js';
import { roleRoutes } from "./role.route.js";

import { requireAuth } from '../../../middlewares/Admin/auth.middleware.js';
import { requirePermission } from '../../../middlewares/Admin/role.middleware.js'; 

const Router = express.Router();

Router.use('/auth', authRoute); 

Router.use('/my-profile', requireAuth, myProfileRoute); 

Router.use('/users', requireAuth, requirePermission('users_view'), userRoute);
Router.use('/conversations', requireAuth, requirePermission('conversations_view'), conversationRoute);
Router.use('/messages', requireAuth, requirePermission('chats_view'), messageRoute);

Router.use('/accounts', requireAuth, requirePermission('accounts_view'), accountRoute); 

Router.use('/upload', uploadRoute);
Router.use('/settings', requireAuth, requirePermission('settings_edit'), settingRoute);
Router.use('/roles', requireAuth, requirePermission('roles_view'), roleRoutes);
  
export const APIs_V1 = Router;