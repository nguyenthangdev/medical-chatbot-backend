import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../../models/user.model.js'; // Nhớ đổi tên Model

const getMyProfile = async (req, res) => {
  try {
    // req.user đã được truyền từ middleware requireAuth sang
    res.status(StatusCodes.OK).json({
      message: 'Lấy thông tin thành công!',
      user: req.user 
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống!' });
  }
}

const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fullName } = req.body;

    // Cập nhật vào Database và trả về user mới nhất ({ new: true })
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { fullName },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy người dùng!' });
    }

    res.status(StatusCodes.OK).json({
      message: 'Cập nhật thông tin thành công!',
      code: 200,
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống khi cập nhật!' });
  }
}

export const myProfileController = { getMyProfile, updateMyProfile };