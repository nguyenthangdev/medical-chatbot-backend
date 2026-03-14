import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

const updateConversation = async (req, res, next) => {
  const condition = Joi.object({
    title: Joi.string().required().messages({
      'any.required': 'Tiêu đề không được để trống'
    })
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

export const conversationValidation = { updateConversation };