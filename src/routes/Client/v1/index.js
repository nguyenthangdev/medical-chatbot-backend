import express from 'express';
import { authRoute } from './auth.route.js'; 
import { myProfileRoute } from './myProfile.route.js'; 
import { requireAuth } from '../../../middlewares/Client/auth.middleware.js';
import { chatRoute } from './chat.route.js';
import { uploadRoute } from '../../General/upload.route.js';

const Router = express.Router();

Router.use('/', authRoute); 
Router.use('/my-profile', requireAuth, myProfileRoute);
Router.use('/chat', requireAuth, chatRoute);
Router.use('/upload', requireAuth, uploadRoute);

export const APIs_V1 = Router;
