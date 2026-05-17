import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/[A-Z]/)
  .pattern(/[0-9]/)
  .required()
  .messages({
    'string.empty': 'Mật khẩu không được để trống',
    'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
    'string.pattern.base': 'Mật khẩu phải có ít nhất 1 chữ hoa và 1 chữ số',
    'any.required': 'Mật khẩu không được để trống'
  });

const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Họ tên không được để trống',
    'string.min': 'Họ tên phải có ít nhất 2 ký tự',
    'string.max': 'Họ tên không được quá 50 ký tự',
    'any.required': 'Họ tên không được để trống'
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.empty': 'Email không được để trống',
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email không được để trống'
  }),
  password: passwordSchema
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.empty': 'Email không được để trống',
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email không được để trống'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Mật khẩu không được để trống',
    'any.required': 'Mật khẩu không được để trống'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.empty': 'Email không được để trống',
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email không được để trống'
  })
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token không hợp lệ',
    'any.required': 'Token không hợp lệ'
  }),
  password: passwordSchema,
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Mật khẩu xác nhận không khớp',
    'string.empty': 'Vui lòng xác nhận mật khẩu',
    'any.required': 'Vui lòng xác nhận mật khẩu'
  })
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token không hợp lệ',
    'any.required': 'Token không hợp lệ'
  })
});

const validate = (schema, source = 'body') => async (req, res, next) => {
  try {
    const value = await schema.validateAsync(req[source], { abortEarly: false });

    if (source === 'body') {
      req.body = value;
    }

    next();
  } catch (error) {
    const errorMessage = error.details?.[0]?.message || 'Dữ liệu không hợp lệ';
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: errorMessage });
  }
};

export const authValidation = {
  registerClient: validate(registerSchema),
  loginClient: validate(loginSchema),
  forgotPassword: validate(forgotPasswordSchema),
  resetPassword: validate(resetPasswordSchema),
  verifyEmail: validate(verifyEmailSchema, 'query')
};
