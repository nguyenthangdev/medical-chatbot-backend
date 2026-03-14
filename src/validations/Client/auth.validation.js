import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

const registerClient = async (req, res, next) => {
  const condition = Joi.object({
    fullName: Joi.string().required().messages({
      'any.required': 'Vui lòng nhập họ và tên.',
      'string.empty': 'Họ và tên không được để trống.'
    }),
    identifier: Joi.string().required().messages({
      'any.required': 'Vui lòng nhập Email hoặc Số điện thoại.',
      'string.empty': 'Email hoặc Số điện thoại không được để trống.'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự để bảo mật ạ.',
      'any.required': 'Vui lòng nhập mật khẩu.',
      'string.empty': 'Mật khẩu không được để trống.'
    })
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    // Lấy câu thông báo lỗi đầu tiên của Joi trả về cho Frontend
    const errorMessage = error.details[0].message;
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: errorMessage });
  }
};

const loginClient = async (req, res, next) => {
  const condition = Joi.object({
    identifier: Joi.string().required().messages({
      'any.required': 'Vui lòng nhập Email hoặc Số điện thoại.',
      'string.empty': 'Tài khoản không được để trống.'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Vui lòng nhập mật khẩu.',
      'string.empty': 'Mật khẩu không được để trống.'
    })
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = error.details[0].message;
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: errorMessage });
  }
};

export const authValidation = {
  registerClient,
  loginClient
};