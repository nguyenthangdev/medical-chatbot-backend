import express from 'express';
import { myAccountController } from '../../../controllers/Client/myAccount.controller.js';
import { myAccountValidation } from '../../../validations/Client/myAccount.validation.js';
const Router = express.Router();

// GET & PATCH /api/v1/client/my-account
Router.route('/')
  .get(myAccountController.getMyProfile) 
  .patch(myAccountValidation.updateMyProfile, myAccountController.updateMyProfile);

export const myAccountRoute = Router;