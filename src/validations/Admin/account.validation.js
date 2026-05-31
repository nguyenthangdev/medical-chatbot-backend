import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/[A-Z]/)
  .pattern(/[0-9]/)
  .messages({
    'string.empty': 'Mật khẩu không được để trống.',
    'string.min': 'Mật khẩu phải có ít nhất 8 ký tự.',
    'string.pattern.base': 'Mật khẩu phải có ít nhất 1 chữ hoa và 1 chữ số.'
  });

const createAccount = async (req, res, next) => {
  const condition = Joi.object({
    fullName: Joi.string().required().messages({
      'any.required': 'Vui lòng nhập họ và tên.',
    }),
    email: Joi.string().email().required().messages({
      'any.required': 'Vui lòng nhập email.',
      'string.email': 'Email không hợp lệ.'
    }),
    password: passwordSchema.required().messages({
      'any.required': 'Vui lòng nhập mật khẩu.',
      'string.empty': 'Mật khẩu không được để trống.',
      'string.min': 'Mật khẩu phải có ít nhất 8 ký tự.',
      'string.pattern.base': 'Mật khẩu phải có ít nhất 1 chữ hoa và 1 chữ số.'
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Mật khẩu xác nhận không khớp.',
      'any.required': 'Vui lòng xác nhận mật khẩu.',
      'string.empty': 'Vui lòng xác nhận mật khẩu.'
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
    
    status: Joi.string().valid('active', 'inactive'),

    password: passwordSchema.allow('').optional(),
    confirmPassword: Joi.when('password', {
      is: Joi.string().min(1).required(),
      then: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Mật khẩu xác nhận không khớp.',
        'any.required': 'Vui lòng xác nhận mật khẩu.',
        'string.empty': 'Vui lòng xác nhận mật khẩu.'
      }),
      otherwise: Joi.string().allow('').optional()
    })
  });

  try {
    const value = await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    req.body = value;
    next();
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: error.details[0].message });
  }
};

export const accountValidation = { createAccount, updateAccount };
