import { UserModel } from '../../models/user.model.js';

const getList = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const keyword = query.keyword || '';
  const skip = (page - 1) * limit;

  const condition = { deleted: false };

  if (keyword) {
    condition.$or = [
      { fullName: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } },
      { phone: { $regex: keyword, $options: 'i' } }
    ];
  }

  // Chạy song song 2 lệnh: Lấy data và Đếm tổng số lượng
  const [users, total] = await Promise.all([
    UserModel.find(condition).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    UserModel.countDocuments(condition)
  ]);

  return {
    users,
    totalItems: total,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
};

const getDetail = async (id) => {
  const user = await UserModel.findOne({ _id: id, deleted: false }).select('-password');
  if (!user) {
    throw new Error('Người dùng không tồn tại hoặc đã bị xóa!');
  }
  return user;
};

const deleteUser = async (id) => {
  const user = await UserModel.findByIdAndUpdate(id, { deleted: true });
  if (!user) {
    throw new Error('Người dùng không tồn tại!');
  }
  return true;
};

const updateUser = async (id, updateData) => {
  const allowedUpdates = {
    fullName: updateData.fullName,
    phone: updateData.phone,
    status: updateData.status
  };

  const updatedUser = await UserModel.findByIdAndUpdate(
    id, 
    allowedUpdates, 
    { new: true }
  ).select('-password');

  if (!updatedUser) {
    throw new Error('Người dùng không tồn tại hoặc đã bị xóa!');
  }

  return updatedUser;
};

export const userService = { getList, getDetail, deleteUser, updateUser };