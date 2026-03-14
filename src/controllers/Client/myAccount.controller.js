import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../../models/user.model.js'; // Nhớ đổi tên Model

export const myAccountController = {
  // 1. LẤY THÔNG TIN CÁ NHÂN
  getMyProfile: async (req, res) => {
    try {
      // req.user đã được truyền từ middleware requireAuth sang
      res.status(StatusCodes.OK).json({
        message: 'Lấy thông tin thành công!',
        user: req.user 
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống!' });
    }
  },

  // 2. CẬP NHẬT THÔNG TIN (Chỉ cho phép sửa fullName)
  updateMyProfile: async (req, res) => {
    try {
      const userId = req.user._id;
      const { fullName } = req.body;

      // Cập nhật vào Database và trả về user mới nhất ({ new: true })
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { fullName },
        { new: true }
      ).select('-password'); // Bỏ cột password đi cho an toàn

      if (!updatedUser) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy người dùng!' });
      }

      res.status(StatusCodes.OK).json({
        message: 'Cập nhật thông tin thành công!',
        user: updatedUser
      });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống khi cập nhật!' });
    }
  }
};