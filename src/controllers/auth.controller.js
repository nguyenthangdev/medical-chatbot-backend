// src/controllers/admin/auth.controller.js
import { StatusCodes } from 'http-status-codes';
import { authServices } from '../services/auth.service.js';
import { getCookieOptions } from '../utils/constants.js';

export const registerAdmin = async (req, res) => {
  try {
    const result = await authServices.registerAdmin(req.body);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }
    res.status(StatusCodes.CREATED).json({
      message: 'Đăng ký tài khoản Admin thành công',
      data: result.accountAdmin
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống!' });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const result = await authServices.loginAdmin(req.body);
    console.log(result)
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }

    const { accessToken, refreshToken, accountAdmin } = result;

    // Gắn token vào Cookie
    res.cookie('accessToken', accessToken, getCookieOptions('1h'));
    res.cookie('refreshToken', refreshToken, getCookieOptions('14d'));

    res.status(StatusCodes.OK).json({ 
      message: 'Đăng nhập thành công!', 
      accountAdmin
    });
  } catch (error) {
    console.error("=== LỖI BACKEND KHI LOGIN ===", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống!' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const currentRefreshToken = req.cookies.refreshToken;
    const result = await authServices.refreshTokenAdmin(currentRefreshToken);
    
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }

    // Cập nhật lại accessToken mới vào cookie
    res.cookie('accessToken', result.newAccessToken, getCookieOptions('1h'));
    
    res.status(StatusCodes.OK).json({ message: 'Làm mới accessToken thành công!' });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống!' });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('accessToken', getCookieOptions('1h'));
    res.clearCookie('refreshToken', getCookieOptions('14d'));

    res.status(StatusCodes.OK).json({ message: "Đăng xuất thành công!" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống!' });
  }
};

export const authController = {
  registerAdmin,
  loginAdmin,
  refreshToken,
  logout
}