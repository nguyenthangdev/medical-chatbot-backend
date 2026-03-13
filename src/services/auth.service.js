// src/services/admin/auth.service.js
import bcrypt from 'bcrypt';
import { JWTProvider } from '../providers/jwt.provider.js';
import { AccountModel } from '../models/account.model.js';

const registerAdmin = async (reqBody) => {
  const existingAccount = await AccountModel.findOne({ email: reqBody.email });
  if (existingAccount) {
    return { success: false, code: 400, message: 'Email này đã được đăng ký!' };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(reqBody.password, salt);

  const newAccount = await AccountModel.create({
    ...reqBody,
    password: hashedPassword,
    status: 'ACTIVE',
    deleted: false
  });

  const accountResponse = newAccount.toObject();
  delete accountResponse.password;

  return { success: true, accountAdmin: accountResponse };
};

const loginAdmin = async (data) => {
  const { email, password } = data;
  const accountAdmin = await AccountModel.findOne({ email, deleted: false }).select('+password');;

  if (!accountAdmin) {
    return { success: false, code: 401, message: 'Tài khoản hoặc mật khẩu không chính xác!' };
  }

  const isMatch = await bcrypt.compare(password, accountAdmin.password);
  if (!isMatch) {
    return { success: false, code: 401, message: 'Tài khoản hoặc mật khẩu không chính xác!' };
  }

  if (accountAdmin.status === 'INACTIVE') {
    return { success: false, code: 403, message: 'Tài khoản đã bị khóa!' };
  }

  const payload = {
    accountId: accountAdmin._id,
    email: accountAdmin.email
  };

  const accessToken = JWTProvider.generateToken(payload, process.env.JWT_ACCESS_TOKEN_SECRET_ADMIN, '1h');
  const refreshToken = JWTProvider.generateToken(payload, process.env.JWT_REFRESH_TOKEN_SECRET_ADMIN, '14d');
  

  const accountToObject = accountAdmin.toObject();
  delete accountToObject.password;

  return { success: true, accessToken, refreshToken, accountAdmin: accountToObject };
};

const refreshTokenAdmin = async (refreshToken) => {
  if (!refreshToken) {
    return { success: false, code: 401, message: 'Không tồn tại refreshToken!' };
  }

  try {
    const decoded = JWTProvider.verifyToken(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET_ADMIN);
    
    const account = await AccountModel.findById(decoded.accountId);
    if (!account || account.deleted) {
      return { success: false, code: 404, message: 'Tài khoản không tồn tại!' };
    }

    const payload = { 
      accountId: decoded.accountId, 
      email: decoded.email
    };

    const newAccessToken = JWTProvider.generateToken(payload, process.env.JWT_ACCESS_TOKEN_SECRET_ADMIN, '1h');
    
    return { success: true, newAccessToken };
  } catch (error) {
    return { success: false, code: 401, message: 'Refresh Token không hợp lệ hoặc đã hết hạn!' };
  }
};

export const authServices = { registerAdmin, loginAdmin, refreshTokenAdmin };