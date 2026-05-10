import express from 'express';
import multer from 'multer';
import { uploadController } from '../../controllers/General/upload.controller.js';

const Router = express.Router();

// Dùng memoryStorage để không sinh ra file rác trên ổ cứng server
const upload = multer({ storage: multer.memoryStorage() });

Router.route('/image')
  .post(upload.single('file'), uploadController.uploadImage);

export const uploadRoute = Router;