import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

const updateUser = async (req, res, next) => {
  const condition = Joi.object({
    fullName: Joi.string().optional(),
    yearOfBirth: Joi.string().optional(),
    sex: Joi.string().valid('MALE', 'FEMALE', 'OTHER').optional(),
    address: Joi.string().optional(),
    phone: Joi.string().optional(),
    avatar: Joi.string().optional(),
    totalTokensUsed: Joi.number().optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE').optional(),
    deleted: Joi.boolean().optional()
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      message: 'Dữ liệu cập nhật không hợp lệ',
      errors: new Error(error).message
    });
  }
};

export const userValidation = { updateUser };