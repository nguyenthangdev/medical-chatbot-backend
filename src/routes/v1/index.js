import express from 'express';
import { authRoute } from './auth.route.js'; 
import { myAccountRoute } from './my-account.route.js'; // Import file route mới

const Router = express.Router();

Router.use('/auth', authRoute); 
Router.use('/my-account', myAccountRoute); // Sử dụng /my-account thay cho /accounts

export const APIs_V1 = Router;