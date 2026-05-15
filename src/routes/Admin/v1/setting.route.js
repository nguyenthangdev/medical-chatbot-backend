import express from 'express';
import { settingController } from "../../../controllers/Admin/setting.controller.js"
import { requirePermission } from '../../../middlewares/Admin/role.middleware.js'; 

const Router = express.Router();

Router.route('/')
  .get(settingController.getSettings)
  .put(requirePermission('settings_edit'), settingController.updateSetting);

Router.route('/:modelName')
  .put(requirePermission('settings_edit'), settingController.updateSetting);

export const settingRoute = Router;