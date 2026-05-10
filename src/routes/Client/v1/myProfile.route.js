import express from 'express';
import { myProfileController } from '../../../controllers/Client/myProfile.controller.js';
import { myProfileValidation } from '../../../validations/Client/myProfile.validation.js';

const Router = express.Router();

Router.route('/')
  .get(myProfileController.getMyProfile) 
  .patch(myProfileValidation.updateMyProfile, myProfileController.updateMyProfile);

export const myProfileRoute = Router;