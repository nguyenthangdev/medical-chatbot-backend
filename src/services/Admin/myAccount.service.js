import { AccountModel } from '../../models/account.model.js';

// Lấy chi tiết tài khoản cá nhân
const getMyProfile = async (accountId) => {
  const account = await AccountModel.findById(accountId);
  if (!account || account.deleted) {
    throw new Error('Tài khoản không tồn tại hoặc đã bị khóa!');
  }
  return account;
};

// Chỉnh sửa tài khoản cá nhân
const updateMyProfile = async (accountId, updateData) => {
  // Chỉ lọc ra các trường cho phép update để bảo mật
  const allowedUpdates = {
    ...(updateData.fullName && { fullName: updateData.fullName }),
    ...(updateData.phone && { phone: updateData.phone }),
    ...(updateData.avatar && { avatar: updateData.avatar })
  };

  const updatedAccount = await AccountModel.findByIdAndUpdate(
    accountId,
    allowedUpdates,
    { new: true } // Trả về data mới nhất
  );

  if (!updatedAccount) {
    throw new Error('Không thể cập nhật tài khoản!');
  }
  return updatedAccount;
};

export const myAccountService = { getMyProfile, updateMyProfile };