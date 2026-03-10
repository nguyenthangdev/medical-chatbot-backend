import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

const registerAdmin = async (req, res, next) => {
  const condition = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu là bắt buộc'
    }),
    fullName: Joi.string().required().messages({
      'any.required': 'Họ tên là bắt buộc'
    })
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      message: 'Dữ liệu không hợp lệ',
      errors: error.message
    });
  }
};

const loginAdmin = async (req, res, next) => {
  const condition = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      message: 'Email hoặc mật khẩu không được để trống'
    });
  }
};

export const authValidation = { registerAdmin, loginAdmin };