import express from 'express';
import { accountController } from '../../../controllers/Admin/account.controller.js';
import { accountValidation } from '../../../validations/Admin/account.validation.js';

const Router = express.Router();

Router.route('/')
  .get(accountController.getAccounts)
  .post(accountValidation.createAccount, accountController.createAccount);

Router.route('/:id')
  .get(accountController.getAccountById)
  .patch(accountValidation.updateAccount, accountController.updateAccount)
  .delete(accountController.deleteAccount);

export const accountRoute = Router;