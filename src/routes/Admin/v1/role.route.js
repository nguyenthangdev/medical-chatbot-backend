import express from 'express';
import { roleController } from '../../../controllers/Admin/role.controller.js';

const Router = express.Router();

Router.route('/')
  .get(roleController.getRoles)
  .post(roleController.createRole);

Router.route('/permissions')
  .patch(roleController.updatePermissions);

Router.route('/:id')
  .get(roleController.getRoleById)
  .put(roleController.updateRole)
  .delete(roleController.deleteRole);

export const roleRoutes = Router;
