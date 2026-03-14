// src/middlewares/auth.middleware.js
import { StatusCodes } from 'http-status-codes';
import { JWTProvider } from '../../providers/jwt.provider.js';
import { AccountModel } from '../../models/account.model.js';

export const requireAuth = async (req, res, next) => {
  try {
    // Đọc accessToken từ cookie
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Vui lòng đăng nhập (Không tìm thấy token)!' });
    }

    const decoded = JWTProvider.verifyToken(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET_ADMIN);
    if (!decoded) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token không hợp lệ!' });
    }

    const accountAdmin = await AccountModel.findOne({
      _id: decoded.accountId,
      deleted: false,
      status: 'ACTIVE'
    }).lean();

    if (!accountAdmin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Người quản trị không tồn tại hoặc đã bị khóa!' });
    }

    // Gắn dữ liệu vào req để các controller phía sau sử dụng
    req.accountAdmin = accountAdmin;
    next();
  } catch (error) {
    // Nếu jwt hết hạn, trả về mã 410 (GONE) để Frontend biết đường gọi API refresh-token
    if (error.message?.includes('jwt expired')) {
      return res.status(StatusCodes.GONE).json({ message: 'Cần refresh token mới!' });
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token không hợp lệ, vui lòng đăng nhập lại!' });
  }
};