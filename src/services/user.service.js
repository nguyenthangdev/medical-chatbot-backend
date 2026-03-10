import { UserModel } from '../models/user.model.js';

// 1. Lấy danh sách Users (có thể thêm phân trang, tìm kiếm sau này)
const getList = async () => {
  // Lấy các user chưa bị xóa mềm, sắp xếp mới nhất lên đầu
  const users = await UserModel.find({ deleted: false }).sort({ createdAt: -1 });
  return users;
};

// 2. Lấy chi tiết 1 User
const getDetail = async (id) => {
  const user = await UserModel.findOne({ _id: id, deleted: false });
  if (!user) {
    throw new Error('Người dùng không tồn tại hoặc đã bị xóa!');
  }
  return user;
};

// 3. Cập nhật thông tin User
const updateUser = async (id, updateData) => {
  const updatedUser = await UserModel.findByIdAndUpdate(
    id,
    { ...updateData },
    { new: true } // Trả về data mới sau khi update
  );

  if (!updatedUser) {
    throw new Error('Cập nhật thất bại, không tìm thấy người dùng!');
  }
  return updatedUser;
};

export const userService = { getList, getDetail, updateUser };