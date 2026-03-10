import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

const updateMyProfile = async (req, res, next) => {
  const condition = Joi.object({
    fullName: Joi.string().optional(),
    phone: Joi.string().optional(),
    avatar: Joi.string().optional()
    // Không cho phép tự update email, password, status, deleted qua API này
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      message: 'Dữ liệu không hợp lệ',
      errors: new Error(error).message
    });
  }
};

export const myAccountValidation = { updateMyProfile };