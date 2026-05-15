import express from 'express';
import { accountController } from '../../../controllers/Admin/account.controller.js';
import { accountValidation } from '../../../validations/Admin/account.validation.js';
import { requirePermission } from '../../../middlewares/Admin/role.middleware.js'; 

const Router = express.Router();

Router.route('/')
  .get(accountController.getAccounts)
  .post(requirePermission('accounts_create'), accountValidation.createAccount, accountController.createAccount);

Router.route('/:id')
  .get(accountController.getAccountById)
  .patch(requirePermission('accounts_edit'), accountValidation.updateAccount, accountController.updateAccount)
  .delete(requirePermission('accounts_delete'), accountController.deleteAccount);

export const accountRoute = Router;