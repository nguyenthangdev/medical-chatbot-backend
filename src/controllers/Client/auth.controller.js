import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
import { UserModel } from '../../models/user.model.js'; // Nhớ đổi tên Model cho chuẩn
import { JWTProvider } from '../../providers/jwt.provider.js';
import { getCookieOptions } from '../../utils/constants.js'

export const authController = {
  // 1. ĐĂNG KÝ
  registerClient: async (req, res) => {
    try {
      const { fullName, identifier, password } = req.body;
      console.log("reqBody: ", req.body);

      // 1. Dùng Regex để kiểm tra xem identifier là Email hay Số điện thoại
      // Nếu chuỗi có định dạng text@text.text thì là email, ngược lại mặc định là SĐT
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

      // Tạo điều kiện tìm kiếm động dựa vào kết quả trên
      const searchCondition = isEmail ? { email: identifier } : { phone: identifier };

      // 2. Kiểm tra xem số điện thoại/email đã tồn tại chưa
      const existingUser = await UserModel.findOne({ ...searchCondition, deleted: false });
      if (existingUser) {
        return res.status(StatusCodes.CONFLICT).json({ 
          message: isEmail ? 'Email này đã được đăng ký!' : 'Số điện thoại này đã được đăng ký!' 
        });
      }

      // 3. Mã hóa mật khẩu
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // 4. Chuẩn bị dữ liệu để lưu vào DB
      const userData = {
        fullName,
        password: hashedPassword,
        status: 'ACTIVE'
      };

      // Gắn đúng trường tương ứng
      if (isEmail) {
        userData.email = identifier;
      } else {
        userData.phone = identifier;
      }

      // Tạo user mới
      const newUser = await UserModel.create(userData);

      // 5. Trả về đúng trường email hoặc phone cho Frontend
      res.status(StatusCodes.CREATED).json({ 
        message: 'Đăng ký tài khoản thành công!',
        user: { 
          _id: newUser._id, 
          fullName: newUser.fullName, 
          // Dùng cú pháp spread (...) để đẩy key tương ứng vào object
          ...(isEmail ? { email: newUser.email } : { phone: newUser.phone })
        }
      });
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống khi đăng ký!' });
    }
  },

  // 2. ĐĂNG NHẬP
  loginClient: async (req, res) => {
    try {
      const { identifier, password } = req.body;

      // 1. Dùng Regex để xác định người dùng đang nhập Email hay Số điện thoại
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      
      // Tạo điều kiện query tương ứng
      const searchCondition = isEmail ? { email: identifier } : { phone: identifier };

      // 2. Tìm user trong DB theo điều kiện vừa tạo (PHẢI select thêm cột password)
      const user = await UserModel.findOne({ 
        ...searchCondition, 
        deleted: false 
      }).select('+password');

      if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Tài khoản hoặc mật khẩu không chính xác!' });
      }

      // 3. So sánh mật khẩu
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Tài khoản hoặc mật khẩu không chính xác!' });
      }

      if (user.status !== 'ACTIVE') {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Tài khoản của bạn đã bị khóa!' });
      }

      // 4. Tạo Payload 
      const payload = { userId: user._id };

      // 5. Tạo Token bằng Secret Key của CLIENT
      const accessTokenUser = JWTProvider.generateToken(payload, process.env.JWT_ACCESS_TOKEN_SECRET_CLIENT, '1h');
      const refreshTokenUser = JWTProvider.generateToken(payload, process.env.JWT_REFRESH_TOKEN_SECRET_CLIENT, '14d');

      // 6. Set HTTP-Only Cookie
      res.cookie('accessTokenUser', accessTokenUser, getCookieOptions('1h'));
      res.cookie('refreshTokenUser', refreshTokenUser, getCookieOptions('14d'));

      // 7. Trả về thông tin (xóa password đi cho an toàn)
      user.password = undefined; 
      res.status(StatusCodes.OK).json({
        message: 'Đăng nhập thành công!',
        user
      });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống khi đăng nhập!' });
    }
  },

  // 3. REFRESH TOKEN
  refreshToken: async (req, res) => {
    try {
      const refreshTokenUser = req.cookies?.refreshTokenUser;
      if (!refreshTokenUser) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Không tìm thấy refresh token!' });
      }

      // Giải mã bằng Secret Key CỦA CLIENT
      const decoded = JWTProvider.verifyToken(refreshTokenUser, process.env.JWT_REFRESH_TOKEN_SECRET_CLIENT);
      if (!decoded) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Refresh token không hợp lệ!' });
      }

      // Tạo Access Token mới
      const payload = { userId: decoded.userId };
      const newAccessToken = JWTProvider.generateToken(payload, process.env.JWT_ACCESS_TOKEN_SECRET_CLIENT, '1h');

      // Cập nhật lại cookie accessTokenUser
      res.cookie('accessTokenUser', newAccessToken, getCookieOptions('1h'));

      res.status(StatusCodes.OK).json({ message: 'Làm mới token thành công!' });
    } catch (error) {
      console.error("Lỗi refresh token:", error);
      // Áp dụng tuyệt chiêu xóa cookie nếu token rác/hết hạn
      const clearOptions = getCookieOptions();
      clearOptions.maxAge = 0;
      res.cookie('accessTokenUser', '', clearOptions);
      res.cookie('refreshTokenUser', '', clearOptions);
      
      res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!' });
    }
  },

  // 4. ĐĂNG XUẤT
  logout: async (req, res) => {
    try {
      const clearOptions = getCookieOptions();
      clearOptions.maxAge = 0; // Tuyệt chiêu ép tuổi thọ về 0 giây

      // Ghi đè bằng chuỗi rỗng để trình duyệt hủy ngay lập tức
      res.cookie('accessTokenUser', '', clearOptions);
      res.cookie('refreshTokenUser', '', clearOptions);

      res.status(StatusCodes.OK).json({ message: 'Đăng xuất thành công!' });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống!' });
    }
  }
};