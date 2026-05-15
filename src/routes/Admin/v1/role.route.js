import express from 'express';
import { roleController } from '../../../controllers/Admin/role.controller.js';
import { requirePermission } from '../../../middlewares/Admin/role.middleware.js'; 
import { roleValidation } from '../../../validations/Admin/role.validation.js';

const Router = express.Router();

Router.route('/')
  .get(requirePermission('roles_view'), roleController.getRoles)
  
  .post(requirePermission('roles_create'), roleValidation.createRole, roleController.createRole);

Router.route('/permissions')
  .patch(requirePermission('roles_permissions'), roleValidation.updatePermissions, roleController.updatePermissions);

Router.route('/:id')
  .get(requirePermission('roles_view'), roleController.getRoleById)
  
  .put(requirePermission('roles_edit'), roleValidation.updateRole, roleController.updateRole)
  .delete(requirePermission('roles_delete'), roleController.deleteRole);

export const roleRoutes = Router;