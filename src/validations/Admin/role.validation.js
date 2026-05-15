import Joi from 'joi';
import { StatusCodes } from 'http-status-codes';

const createRole = async (req, res, next) => {
  const condition = Joi.object({
    title: Joi.string().required().messages({
      'any.required': 'Vui lòng nhập tên nhóm quyền.',
      'string.empty': 'Tên nhóm quyền không được bỏ trống.'
    }),
    titleId: Joi.string().optional().allow(''), // Backend hoặc DB có thể tự gen ra
    description: Joi.string().optional().allow(''),
    status: Joi.string().valid('active', 'inactive').default('active')
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: error.details[0].message });
  }
};

const updateRole = async (req, res, next) => {
  const condition = Joi.object({
    title: Joi.string().optional(),
    titleId: Joi.string().optional().allow(''),
    description: Joi.string().optional().allow(''),
    status: Joi.string().valid('active', 'inactive').optional()
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: error.details[0].message });
  }
};

const updatePermissions = async (req, res, next) => {
  const condition = Joi.object({
    // permissions thường là array truyền lên từ ma trận phân quyền
    permissions: Joi.array().required().messages({
      'any.required': 'Vui lòng cung cấp danh sách phân quyền.'
    })
  });

  try {
    await condition.validateAsync(req.body, { abortEarly: false, allowUnknown: true });
    next();
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ message: error.details[0].message });
  }
};

export const roleValidation = { createRole, updateRole, updatePermissions };