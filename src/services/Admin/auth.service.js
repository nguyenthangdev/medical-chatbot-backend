// src/services/admin/auth.service.js
import bcrypt from 'bcrypt';
import { JWTProvider } from '../../providers/jwt.provider.js';
import { AccountModel } from '../../models/account.model.js';

const getLoginMaxAttempts = () => Number(process.env.LOGIN_MAX_FAILED_ATTEMPTS || 5);

const getLoginLockMinutes = () => Number(process.env.LOGIN_LOCK_MINUTES || 5);

const getLockedMessage = (lockedUntil) => {
  const remainingMs = Math.max(new Date(lockedUntil).getTime() - Date.now(), 0);
  const remainingMinutes = Math.max(Math.ceil(remainingMs / 60000), 1);
  return `Bạn nhập sai mật khẩu quá số lần quy định. Tài khoản bị tạm khóa trong ${remainingMinutes} phút.`;
};

const isLoginLocked = (account) => {
  return account.loginLockedUntil && account.loginLockedUntil.getTime() > Date.now();
};

const clearExpiredLoginLock = (account) => {
  if (account.loginLockedUntil && account.loginLockedUntil.getTime() <= Date.now()) {
    account.loginFailedAttempts = 0;
    account.loginLockedUntil = undefined;
  }
};

const clearLoginLock = async (account) => {
  if (account.loginFailedAttempts || account.loginLockedUntil) {
    account.loginFailedAttempts = 0;
    account.loginLockedUntil = undefined;
    await account.save();
  }
};

const recordFailedLogin = async (account) => {
  const maxAttempts = getLoginMaxAttempts();
  const lockMinutes = getLoginLockMinutes();
  const failedAttempts = (account.loginFailedAttempts || 0) + 1;

  account.loginFailedAttempts = failedAttempts;

  if (failedAttempts >= maxAttempts) {
    account.loginLockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
    await account.save();
    return {
      success: false,
      code: 423,
      message: getLockedMessage(account.loginLockedUntil),
      lockedUntil: account.loginLockedUntil
    };
  }

  await account.save();
  return {
    success: false,
    code: 401,
    message: `Tài khoản hoặc mật khẩu không chính xác! Bạn còn ${maxAttempts - failedAttempts} lần thử.`
  };
};

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
    status: 'active',
    deleted: false
  });

  const accountResponse = newAccount.toObject();
  delete accountResponse.password;

  return { success: true, accountAdmin: accountResponse };
};

const loginAdmin = async (data) => {
  const { email, password } = data;
  const accountAdmin = await AccountModel.findOne({ email, deleted: false }).select(
    '+password +loginFailedAttempts +loginLockedUntil'
  );

  if (!accountAdmin) {
    return { success: false, code: 401, message: 'Tài khoản hoặc mật khẩu không chính xác!' };
  }

  if (isLoginLocked(accountAdmin)) {
    return {
      success: false,
      code: 423,
      message: getLockedMessage(accountAdmin.loginLockedUntil),
      lockedUntil: accountAdmin.loginLockedUntil
    };
  }

  clearExpiredLoginLock(accountAdmin);

  const isMatch = await bcrypt.compare(password, accountAdmin.password);
  if (!isMatch) {
    return recordFailedLogin(accountAdmin);
  }

  if (accountAdmin.status === 'inactive') {
    return { success: false, code: 403, message: 'Tài khoản đã bị khóa!' };
  }

  await clearLoginLock(accountAdmin);

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
