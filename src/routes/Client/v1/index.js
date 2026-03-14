import express from 'express';
import { authRoute } from './auth.route.js'; 
import { myAccountRoute } from './myAccount.route.js'; 
import { requireAuth } from '../../../middlewares/Client/auth.middleware.js';

const Router = express.Router();

Router.use('/', authRoute); 
Router.use('/my-profile', requireAuth, myAccountRoute);

export const APIs_V1 = Router;