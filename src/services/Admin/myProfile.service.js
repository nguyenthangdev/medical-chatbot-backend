import { AccountModel } from '../../models/account.model.js';

const getMyProfile = async (accountId) => {
  const account = await AccountModel.findOne({ _id: accountId, deleted: false }).select('-password').lean();
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
  );

  if (!updatedProfile) {
    throw new Error('Không thể cập nhật tài khoản!');
  }
  return updatedProfile;
};

export const myProfileService = { getMyProfile, updateMyProfile };