import { StatusCodes } from 'http-status-codes';
import bcrypt from 'bcrypt';
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
    const {
      fullName,
      yearOfBirth,
      sex,
      address,
      phone,
      avatar
    } = req.body;
    const updateData = {
      fullName,
      yearOfBirth,
      sex,
      address,
      phone,
      avatar
    };

    // Cập nhật vào Database và trả về user mới nhất ({ new: true })
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updateData,
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

const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    const user = await UserModel.findOne({ _id: userId, deleted: false }).select(
      '+password +loginFailedAttempts +loginLockedUntil'
    );

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy người dùng!' });
    }

    if (!user.password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Tài khoản này chưa có mật khẩu để đổi.'
      });
    }

    const isCurrentPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Mật khẩu hiện tại không chính xác!' });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Mật khẩu mới không được trùng mật khẩu hiện tại!' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.loginFailedAttempts = 0;
    user.loginLockedUntil = undefined;
    await user.save();

    res.status(StatusCodes.OK).json({ message: 'Đổi mật khẩu thành công, vui lòng đăng nhập lại!', code: 200 });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi hệ thống khi đổi mật khẩu!' });
  }
}

export const myProfileController = { getMyProfile, updateMyProfile, changePassword };
