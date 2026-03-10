import { AccountModel } from '../models/account.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const registerAdmin = async (reqBody) => {
  // 1. Kiểm tra email đã tồn tại trong bảng Account chưa
  const existingAccount = await AccountModel.findOne({ email: reqBody.email });
  if (existingAccount) {
    throw new Error('Email này đã được đăng ký!');
  }

  // 2. Mã hóa mật khẩu
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(reqBody.password, salt);

  // 3. Tạo tài khoản
  const newAccount = await AccountModel.create({
    ...reqBody,
    password: hashedPassword
  });
  await newAccount.save()
  // 4. Bỏ field password trước khi trả về
  const accountResponse = newAccount.toObject();
  delete accountResponse.password;

  return accountResponse;
};

const loginAdmin = async (reqBody) => {
  // 1. Tìm account theo email. 
  // Vì trong model Account cài đặt select: false cho password, ta phải dùng .select('+password') để lấy ra so sánh
  const account = await AccountModel.findOne({ email: reqBody.email }).select('+password');
  
  if (!account) {
    throw new Error('Email không tồn tại!');
  }

  // 2. So sánh mật khẩu gửi lên với mật khẩu đã hash trong DB
  const isMatch = await bcrypt.compare(reqBody.password, account.password);
  if (!isMatch) {
    throw new Error('Mật khẩu không chính xác!');
  }

  // 3. Nếu account bị khóa (INACTIVE)
  if (account.status === 'INACTIVE' || account.deleted) {
    throw new Error('Tài khoản đã bị khóa hoặc xóa!');
  }

  // 4. Tạo JWT Token
  // Đảm bảo bạn đã khai báo JWT_SECRET trong file .env
  const payload = {
    _id: account._id,
    email: account.email,
    role: 'ADMIN' // Có thể thêm role để sau này phân quyền
  };
  
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d' // Token hết hạn sau 1 ngày
  });

  const accountResponse = account.toObject();
  delete accountResponse.password;

  return {
    account: accountResponse,
    accessToken
  };
};

export const authService = { registerAdmin, loginAdmin };