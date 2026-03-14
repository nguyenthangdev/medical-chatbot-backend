import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

// Regex kiểm tra chuỗi có phải là ObjectId hợp lệ của MongoDB không (24 ký tự hex)
const OBJECT_ID_RULE = /^[0-9a-fA-F]{24}$/;
const OBJECT_ID_RULE_MESSAGE = 'Chuỗi ID không đúng định dạng của MongoDB';

const createMessage = async (req, res, next) => {
  const condition = Joi.object({
    conversationId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
    role: Joi.string().valid('user', 'assistant').required(),
    content: Joi.string().required(),
    tokens: Joi.number().optional(),
    model: Joi.string().optional(),
    latency: Joi.string().optional()
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      message: 'Dữ liệu không hợp lệ',
      errors: new Error(error).message
    });
  }
};

export const messageValidation = { createMessage };