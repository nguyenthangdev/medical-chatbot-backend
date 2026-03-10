import { StatusCodes } from 'http-status-codes';
import { authService } from '../services/auth.service.js';

const registerAdmin = async (req, res) => {
  try {
    const newAccount = await authService.registerAdmin(req.body);
    res.status(StatusCodes.CREATED).json({
      message: 'Đăng ký tài khoản Admin thành công',
      data: newAccount
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const result = await authService.loginAdmin(req.body);
    res.status(StatusCodes.OK).json({
      message: 'Đăng nhập thành công',
      data: result
    });
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
  }
};

export const authController = { registerAdmin, loginAdmin };