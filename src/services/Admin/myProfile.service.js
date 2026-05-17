import { AccountModel } from '../../models/account.model.js';
import bcrypt from 'bcrypt';

const getMyProfile = async (accountId) => {
  const account = await AccountModel.findOne({ _id: accountId, deleted: false })
    .select('-password')
    .populate('role_id', 'title titleId permissions isSystemAdmin') 
    .lean();
    
  if (!account || account.deleted) {
    throw new Error('Tài khoản không tồn tại hoặc đã bị khóa!');
  }
  return account;
};

const updateMyProfile = async (accountId, updateData) => {
  // Chỉ lọc ra các trường cho phép update để bảo mật
  const allowedUpdates = {
    ...(updateData.fullName && { fullName: updateData.fullName }),
    ...(updateData.phone && { phone: updateData.phone }),
    ...(updateData.avatar && { avatar: updateData.avatar })
  };

  const updatedProfile = await AccountModel.findByIdAndUpdate(
    accountId,
    allowedUpdates,
    { new: true } // Trả về data mới nhất
  ).populate('role_id', 'title titleId permissions isSystemAdmin'); 

  if (!updatedProfile) {
    throw new Error('Không thể cập nhật tài khoản!');
  }
  return updatedProfile;
};

const changePassword = async (accountId, { currentPassword, newPassword }) => {
  const account = await AccountModel.findOne({ _id: accountId, deleted: false }).select(
    '+password +loginFailedAttempts +loginLockedUntil'
  );

  if (!account) {
    throw new Error('Tài khoản không tồn tại hoặc đã bị khóa!');
  }

  const isCurrentPasswordMatch = await bcrypt.compare(currentPassword, account.password);
  if (!isCurrentPasswordMatch) {
    throw new Error('Mật khẩu hiện tại không chính xác!');
  }

  const isSamePassword = await bcrypt.compare(newPassword, account.password);
  if (isSamePassword) {
    throw new Error('Mật khẩu mới không được trùng mật khẩu hiện tại!');
  }

  const salt = await bcrypt.genSalt(10);
  account.password = await bcrypt.hash(newPassword, salt);
  account.loginFailedAttempts = 0;
  account.loginLockedUntil = undefined;
  await account.save();

  return true;
};

export const myProfileService = { getMyProfile, updateMyProfile, changePassword };
