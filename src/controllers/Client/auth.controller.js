import { StatusCodes } from 'http-status-codes';
import { authServices } from '../../services/Client/auth.service.js';
import { getCookieOptions } from '../../utils/constants.js';

const registerClient = async (req, res) => {
  try {
    const result = await authServices.registerClient(req.body);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }

    res.status(StatusCodes.CREATED).json({
      message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.',
      user: result.user
    });
  } catch (error) {
    console.error('Lỗi khi đăng ký:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống khi đăng ký!' });
  }
}

const verifyEmail = async (req, res) => {
  try {
    const result = await authServices.verifyEmail(req.query.token);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }

    res.status(StatusCodes.OK).json({ message: 'Xác nhận email thành công! Bạn có thể đăng nhập.' });
  } catch (error) {
    console.error('Lỗi xác nhận email:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống khi xác nhận email!' });
  }
}

const forgotPassword = async (req, res) => {
  try {
    const result = await authServices.forgotPassword(req.body);
    res.status(StatusCodes.OK).json({ message: result.message });
  } catch (error) {
    console.error('Lỗi gửi email đặt lại mật khẩu:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Không thể gửi email đặt lại mật khẩu!' });
  }
}

const resetPassword = async (req, res) => {
  try {
    const result = await authServices.resetPassword(req.body);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }

    res.status(StatusCodes.OK).json({ message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập.' });
  } catch (error) {
    console.error('Lỗi đặt lại mật khẩu:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống khi đặt lại mật khẩu!' });
  }
}

const loginClient = async (req, res) => {
  try {
    const result = await authServices.loginClient(req.body);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message, code: result.code });
    }

    res.cookie('accessTokenUser', result.accessTokenUser, getCookieOptions('1h'));
    res.cookie('refreshTokenUser', result.refreshTokenUser, getCookieOptions('14d'));

    res.status(StatusCodes.OK).json({
      message: 'Đăng nhập thành công!',
      code: 200,
      user: result.user
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống khi đăng nhập!' });
  }
}

const refreshToken = async (req, res) => {
  try {
    const result = await authServices.refreshTokenClient(req.cookies?.refreshTokenUser);
    if (!result.success) {
      return res.status(result.code).json({ message: result.message });
    }

    res.cookie('accessTokenUser', result.newAccessToken, getCookieOptions('1h'));
    res.status(StatusCodes.OK).json({ message: 'Làm mới token thành công!' });
  } catch (error) {
    console.error('Lỗi refresh token:', error);

    const clearOptions = getCookieOptions();
    clearOptions.maxAge = 0;
    res.cookie('accessTokenUser', '', clearOptions);
    res.cookie('refreshTokenUser', '', clearOptions);
    
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!' });
  }
}

const logout = async (req, res) => {
  try {
    const clearOptions = getCookieOptions();
    clearOptions.maxAge = 0;

    res.cookie('accessTokenUser', '', clearOptions);
    res.cookie('refreshTokenUser', '', clearOptions);

    res.status(StatusCodes.OK).json({ message: 'Đăng xuất thành công!', code: 200 });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống!' });
  }
}

export const authController = {
  registerClient,
  loginClient,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout
};
