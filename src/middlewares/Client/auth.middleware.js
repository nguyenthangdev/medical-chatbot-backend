import { StatusCodes } from 'http-status-codes';
import { JWTProvider } from '../../providers/jwt.provider.js';

import { UserModel } from '../../models/user.model.js'; 

export const requireAuth = async (req, res, next) => {
  try {
    const accessTokenUser = req.cookies?.accessTokenUser;

    if (!accessTokenUser) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Vui lòng đăng nhập để tiếp tục!' });
    }

    const decoded = JWTProvider.verifyToken(accessTokenUser, process.env.JWT_ACCESS_TOKEN_SECRET_CLIENT);
    if (!decoded) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token không hợp lệ!' });
    }

    const user = await UserModel.findOne({
      _id: decoded.userId, 
      deleted: false,
      status: 'active'
    }).lean();

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Tài khoản không tồn tại hoặc đã bị khóa!' });
    }

    req.user = user;
    next();
  } catch (error) {
    // Nếu jwt hết hạn, trả về GONE (410) để Frontend gọi API refresh-token
    if (error.message?.includes('jwt expired')) {
      return res.status(StatusCodes.GONE).json({ message: 'Cần refresh token mới!' });
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại!' });
  }
};