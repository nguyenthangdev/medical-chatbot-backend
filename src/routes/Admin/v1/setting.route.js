import express from 'express';
import { settingController } from "../../../controllers/Admin/setting.controller.js"

const Router = express.Router();

Router.route('/')
  .get(settingController.getSettings)
  .put(settingController.updateSetting);

Router.route('/:modelName')
  .put(settingController.updateSetting);

export const settingRoute = Router;