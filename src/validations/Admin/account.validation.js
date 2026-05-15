import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

const createAccount = async (req, res, next) => {
  const condition = Joi.object({
    fullName: Joi.string().required().messages({
      'any.required': 'Vui lòng nhập họ và tên.',
    }),
    email: Joi.string().email().required().messages({
      'any.required': 'Vui lòng nhập email.',
      'string.email': 'Email không hợp lệ.'
    }),
    password: Joi.string().min(6).required().messages({
      'any.required': 'Vui lòng nhập mật khẩu.',
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự.'
    }),
    
    role_id: Joi.string().required().messages({
      'any.required': 'Vui lòng chọn nhóm quyền.',
      'string.empty': 'Vui lòng chọn nhóm quyền.'
    }),
    
    status: Joi.string().valid('active', 'inactive').default('active')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: error.details[0].message });
  }
};

const updateAccount = async (req, res, next) => {
  const condition = Joi.object({
    fullName: Joi.string(),
    
    role_id: Joi.string(),
    
    status: Joi.string().valid('active', 'inactive')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: error.details[0].message });
  }
};

export const accountValidation = { createAccount, updateAccount };