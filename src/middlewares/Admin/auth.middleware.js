import { StatusCodes } from 'http-status-codes';
import { JWTProvider } from '../../providers/jwt.provider.js';
import { AccountModel } from '../../models/account.model.js';

export const requireAuth = async (req, res, next) => {
  try {
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
      status: 'active' 
    }).populate('role_id').lean();

    if (!accountAdmin) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Người quản trị không tồn tại hoặc đã bị khóa!' });
    }

    if (!accountAdmin.role_id) {
      return res.status(StatusCodes.FORBIDDEN).json({ message: 'Không thể xác định quyền của tài khoản này!' });
    }

    req.accountAdmin = accountAdmin;
    next();
  } catch (error) {
    if (error.message?.includes('jwt expired')) {
      return res.status(StatusCodes.GONE).json({ message: 'Cần refresh token mới!' });
    }
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token không hợp lệ, vui lòng đăng nhập lại!' });
  }
};