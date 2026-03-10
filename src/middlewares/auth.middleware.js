import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  // Kiểm tra xem header Authorization có tồn tại và bắt đầu bằng "Bearer " không
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ 
      message: 'Vui lòng cung cấp token đăng nhập (Bearer Token)' 
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Giải mã token bằng JWT_SECRET trong file .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Gắn thông tin tài khoản giải mã được (bao gồm _id) vào req để các bước sau sử dụng
    req.account = decoded; 
    next(); // Cho phép đi tiếp vào Controller
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ 
      message: 'Token không hợp lệ hoặc đã hết hạn' 
    });
  }
};