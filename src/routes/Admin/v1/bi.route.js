import express from 'express';
import { biController } from '../../../controllers/Admin/bi.controller.js';

const Router = express.Router();

Router.get('/dashboards', biController.getDashboards);
Router.post('/guest-token/:dashboardKey', biController.getGuestToken);

export const biRoute = Router;
