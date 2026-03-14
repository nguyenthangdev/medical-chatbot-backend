// src/middlewares/Client/auth.middleware.js
import { StatusCodes } from 'http-status-codes';
import { JWTProvider } from '../../providers/jwt.provider.js';

// Lưu ý: Import đúng file Model chứa thông tin Người dùng/Bệnh nhân của bạn
import { UserModel } from '../../models/user.model.js'; 

export const requireAuth = async (req, res, next) => {
  try {
    // Đọc accessTokenUser từ cookie
    const accessTokenUser = req.cookies?.accessTokenUser;

    if (!accessTokenUser) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Vui lòng đăng nhập để tiếp tục!' });
    }

    // 1. Dùng Secret Key CỦA CLIENT để giải mã
    const decoded = JWTProvider.verifyToken(accessTokenUser, process.env.JWT_ACCESS_TOKEN_SECRET_CLIENT);
    if (!decoded) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token không hợp lệ!' });
    }

    // 2. Tìm tài khoản người dùng/bệnh nhân trong DB
    // Lưu ý: Đảm bảo 'userId' khớp với key bạn đã truyền vào lúc tạo token
    const user = await UserModel.findOne({
      _id: decoded.userId, 
      deleted: false,
      status: 'ACTIVE'
    }).lean();

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Tài khoản không tồn tại hoặc đã bị khóa!' });
    }

    // 3. Gắn dữ liệu vào req.user để các controller phía sau sử dụng
    req.user = user;
    next();
  } catch (error) {
    // 4. Nếu jwt hết hạn, trả về GONE (410) để Frontend gọi API refresh-token
    if (error.message?.includes('jwt expired')) {
      return res.status(StatusCodes.GONE).json({ message: 'Cần refresh token mới!' });
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại!' });
  }
};