import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

const updateMyProfile = async (req, res, next) => {
  const condition = Joi.object({
    fullName: Joi.string().required().messages({
      'any.required': 'Vui lòng nhập họ và tên mới.',
      'string.empty': 'Họ và tên không được để trống.'
    })
    // Không cho phép validate trường identifier ở đây vì không cho sửa
  });

  try {
    // allowUnknown: true giúp bỏ qua lỗi nếu Frontend lỡ gửi thừa data (như avatar, setting hiển thị...)
    await condition.validateAsync(req.body, { 
      abortEarly: false, 
      allowUnknown: true 
    });
    next();
  } catch (error) {
    const errorMessage = error.details[0].message;
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: errorMessage });
  }
};

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/[A-Z]/)
  .pattern(/[0-9]/)
  .required()
  .messages({
    'string.empty': 'Mật khẩu mới không được để trống',
    'string.min': 'Mật khẩu mới phải có ít nhất 8 ký tự',
    'string.pattern.base': 'Mật khẩu mới phải có ít nhất 1 chữ hoa và 1 chữ số',
    'any.required': 'Mật khẩu mới không được để trống'
  });

const changePassword = async (req, res, next) => {
  const condition = Joi.object({
    currentPassword: Joi.string().required().messages({
      'string.empty': 'Vui lòng nhập mật khẩu hiện tại',
      'any.required': 'Vui lòng nhập mật khẩu hiện tại'
    }),
    newPassword: passwordSchema,
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
      'any.only': 'Mật khẩu xác nhận không khớp',
      'string.empty': 'Vui lòng xác nhận mật khẩu mới',
      'any.required': 'Vui lòng xác nhận mật khẩu mới'
    })
  });

  try {
    const value = await condition.validateAsync(req.body, { abortEarly: false });
    req.body = value;
    next();
  } catch (error) {
    const errorMessage = error.details[0].message;
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: errorMessage });
  }
};

export const myProfileValidation = {
  updateMyProfile,
  changePassword
};
