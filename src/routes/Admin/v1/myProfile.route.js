import express from 'express';
import { myProfileController } from '../../../controllers/Admin/myProfile.controller.js';
import { myProfileValidation } from '../../../validations/Admin/myProfile.validation.js';

const Router = express.Router();

Router.route('/')
  .get(myProfileController.getMyProfile)
  .patch(myProfileValidation.updateMyProfile, myProfileController.updateMyProfile);

Router.route('/change-password')
  .patch(myProfileValidation.changePassword, myProfileController.changePassword);

export const myProfileRoute = Router;
