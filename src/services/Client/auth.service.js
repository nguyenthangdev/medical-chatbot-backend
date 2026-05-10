import bcrypt from 'bcrypt';
import { UserModel } from '../../models/user.model.js';
import { JWTProvider } from '../../providers/jwt.provider.js';

const getSearchCondition = (identifier) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  return {
    condition: isEmail ? { email: identifier } : { phone: identifier },
    isEmail
  };
};

const registerClient = async ({ fullName, identifier, password }) => {
  const { condition, isEmail } = getSearchCondition(identifier);
  const existingUser = await UserModel.findOne({ ...condition, deleted: false });

  if (existingUser) {
    return {
      success: false,
      code: 409,
      message: isEmail ? 'Email này đã được đăng ký!' : 'Số điện thoại này đã được đăng ký!'
    };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userData = {
    fullName,
    password: hashedPassword,
    status: 'active',
    ...condition
  };

  const newUser = await UserModel.create(userData);

  return {
    success: true,
    user: {
      _id: newUser._id,
      fullName: newUser.fullName,
      ...(isEmail ? { email: newUser.email } : { phone: newUser.phone })
    }
  };
};

const loginClient = async ({ identifier, password }) => {
  const { condition } = getSearchCondition(identifier);

  const user = await UserModel.findOne({ ...condition, deleted: false }).select('+password');
  if (!user) {
    return { success: false, code: 401, message: 'Tài khoản hoặc mật khẩu không chính xác!' };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return { success: false, code: 401, message: 'Tài khoản hoặc mật khẩu không chính xác!' };
  }

  if (user.status !== 'active') {
    return { success: false, code: 403, message: 'Tài khoản của bạn đã bị khóa!' };
  }

  const payload = { userId: user._id };
  const accessTokenUser = JWTProvider.generateToken(payload, process.env.JWT_ACCESS_TOKEN_SECRET_CLIENT, '1h');
  const refreshTokenUser = JWTProvider.generateToken(payload, process.env.JWT_REFRESH_TOKEN_SECRET_CLIENT, '14d');

  user.password = undefined;

  return {
    success: true,
    user,
    accessTokenUser,
    refreshTokenUser
  };
};

const refreshTokenClient = async (refreshTokenUser) => {
  if (!refreshTokenUser) {
    return { success: false, code: 401, message: 'Không tìm thấy refresh token!' };
  }

  try {
    const decoded = JWTProvider.verifyToken(refreshTokenUser, process.env.JWT_REFRESH_TOKEN_SECRET_CLIENT);
    const payload = { userId: decoded.userId };
    const newAccessToken = JWTProvider.generateToken(payload, process.env.JWT_ACCESS_TOKEN_SECRET_CLIENT, '1h');

    return { success: true, newAccessToken };
  } catch (error) {
    return { success: false, code: 401, message: 'Refresh token không hợp lệ!' };
  }
};

const logoutClient = async () => {
  return { success: true };
};

export const authServices = {
  registerClient,
  loginClient,
  refreshTokenClient,
  logoutClient
};
