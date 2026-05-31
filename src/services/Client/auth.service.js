import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { UserModel } from '../../models/user.model.js';
import { JWTProvider } from '../../providers/jwt.provider.js';
import { sendEmail } from '../General/email.service.js';

const createRawToken = () => crypto.randomBytes(32).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getFrontendUrl = () => process.env.CLIENT_APP_URL || 'http://localhost:5173';

const getMinutes = (envName, fallback) => Number(process.env[envName] || fallback);

const getLoginMaxAttempts = () => Number(process.env.LOGIN_MAX_FAILED_ATTEMPTS || 5);

const getLoginLockMinutes = () => Number(process.env.LOGIN_LOCK_MINUTES || 5);

const getLockedMessage = (lockedUntil) => {
  const remainingMs = Math.max(new Date(lockedUntil).getTime() - Date.now(), 0);
  const remainingMinutes = Math.max(Math.ceil(remainingMs / 60000), 1);
  return `Bạn nhập sai mật khẩu quá số lần quy định. Tài khoản bị tạm khóa trong ${remainingMinutes} phút.`;
};

const isLoginLocked = (user) => {
  return user.loginLockedUntil && user.loginLockedUntil.getTime() > Date.now();
};

const clearExpiredLoginLock = (user) => {
  if (user.loginLockedUntil && user.loginLockedUntil.getTime() <= Date.now()) {
    user.loginFailedAttempts = 0;
    user.loginLockedUntil = undefined;
  }
};

const clearLoginLock = async (user) => {
  if (user.loginFailedAttempts || user.loginLockedUntil) {
    user.loginFailedAttempts = 0;
    user.loginLockedUntil = undefined;
    await user.save();
  }
};

const recordFailedLogin = async (user) => {
  const maxAttempts = getLoginMaxAttempts();
  const lockMinutes = getLoginLockMinutes();
  const failedAttempts = (user.loginFailedAttempts || 0) + 1;

  user.loginFailedAttempts = failedAttempts;

  if (failedAttempts >= maxAttempts) {
    user.loginLockedUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
    await user.save();
    return {
      success: false,
      code: 423,
      message: getLockedMessage(user.loginLockedUntil),
      lockedUntil: user.loginLockedUntil
    };
  }

  await user.save();
  return {
    success: false,
    code: 401,
    message: `Tài khoản hoặc mật khẩu không chính xác! Bạn còn ${maxAttempts - failedAttempts} lần thử.`
  };
};

const buildButton = (url, label) => `
  <p style="margin:0 0 18px;color:#334155;font-size:15px;line-height:1.7;">
    Vui lòng bấm nút bên dưới để tiếp tục. Link có thời hạn và chỉ dùng cho tài khoản của bạn.
  </p>
  <a href="${url}" style="display:inline-block;border-radius:14px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 20px;">
    ${label}
  </a>
  <p style="margin:22px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
    Nếu nút không hoạt động, hãy sao chép đường dẫn này vào trình duyệt:<br />
    <span style="word-break:break-all;color:#2563eb;">${url}</span>
  </p>
`;

const createEmailVerification = async (user) => {
  const rawToken = createRawToken();
  user.emailVerificationToken = hashToken(rawToken);
  user.emailVerificationExpires = new Date(Date.now() + getMinutes('EMAIL_VERIFICATION_EXPIRES_MINUTES', 15) * 60 * 1000);
  await user.save();

  const verifyUrl = `${getFrontendUrl()}/verify-email?token=${rawToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Xác nhận đăng ký tài khoản',
    htmlMessage: buildButton(verifyUrl, 'Xác nhận email')
  });
};

const registerClient = async ({ fullName, email, password }) => {
  const existingUser = await UserModel.findOne({ email, deleted: false }).select(
    '+password +emailVerificationToken +emailVerificationExpires'
  );

  if (existingUser && existingUser.emailVerified !== false) {
    return {
      success: false,
      code: 409,
      message: 'Email này đã được đăng ký!'
    };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = existingUser || new UserModel({ email });
  user.fullName = fullName;
  user.password = hashedPassword;
  user.email = email;
  user.phone = undefined;
  user.status = 'inactive';
  user.emailVerified = false;

  await createEmailVerification(user);

  return {
    success: true,
    user: { _id: user._id, fullName: user.fullName, email: user.email }
  };
};

const loginClient = async ({ email, password }) => {
  const user = await UserModel.findOne({ email, deleted: false }).select(
    '+password +loginFailedAttempts +loginLockedUntil'
  );
  if (!user) {
    return { success: false, code: 401, message: 'Tài khoản hoặc mật khẩu không chính xác!' };
  }

  if (isLoginLocked(user)) {
    return {
      success: false,
      code: 423,
      message: getLockedMessage(user.loginLockedUntil),
      lockedUntil: user.loginLockedUntil
    };
  }

  clearExpiredLoginLock(user);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return recordFailedLogin(user);
  }

  if (user.emailVerified === false) {
    return { success: false, code: 403, message: 'Vui lòng xác nhận email trước khi đăng nhập!' };
  }

  if (user.status !== 'active') {
    return { success: false, code: 403, message: 'Tài khoản của bạn đã bị khóa!' };
  }

  await clearLoginLock(user);

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

const verifyEmail = async (token) => {
  const tokenHash = hashToken(token);
  const user = await UserModel.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
    deleted: false
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) {
    return { success: false, code: 400, message: 'Link xác nhận không hợp lệ hoặc đã hết hạn!' };
  }

  user.emailVerified = true;
  user.status = 'active';
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return { success: true };
};

const forgotPassword = async ({ email }) => {
  const user = await UserModel.findOne({ email, deleted: false });
  const successMessage = 'Nếu email tồn tại, hệ thống đã gửi link đặt lại mật khẩu.';

  if (!user || user.status !== 'active' || user.emailVerified === false) {
    return { success: true, message: successMessage };
  }

  const rawToken = createRawToken();
  user.passwordResetToken = hashToken(rawToken);
  user.passwordResetExpires = new Date(Date.now() + getMinutes('PASSWORD_RESET_EXPIRES_MINUTES', 15) * 60 * 1000);
  await user.save();

  const resetUrl = `${getFrontendUrl()}/reset-password/${rawToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Đặt lại mật khẩu',
    htmlMessage: buildButton(resetUrl, 'Đặt lại mật khẩu')
  });

  return { success: true, message: successMessage };
};

const resetPassword = async ({ token, password }) => {
  const tokenHash = hashToken(token);
  const user = await UserModel.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() },
    deleted: false
  }).select('+password +passwordResetToken +passwordResetExpires');

  if (!user) {
    return { success: false, code: 400, message: 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn!' };
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.loginFailedAttempts = 0;
  user.loginLockedUntil = undefined;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return { success: true };
};

const logoutClient = async () => {
  return { success: true };
};

export const authServices = {
  registerClient,
  loginClient,
  refreshTokenClient,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logoutClient
};
