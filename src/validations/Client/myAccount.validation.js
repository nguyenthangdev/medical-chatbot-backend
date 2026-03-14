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

export const myAccountValidation = {
  updateMyProfile
};