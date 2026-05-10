import { StatusCodes } from 'http-status-codes';
import { myProfileService } from '../../services/Admin/myProfile.service.js';

const getMyProfile = async (req, res) => {
  try {
    // Lấy ID từ token đăng nhập
    const accountId = req.accountAdmin._id; 
    
    const account = await myProfileService.getMyProfile(accountId);
    res.status(StatusCodes.OK).json({ user: account });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    // Lấy ID từ token đăng nhập
    const accountId = req.accountAdmin._id;
    
    const updatedProfile = await myProfileService.updateMyProfile(accountId, req.body);
    
    res.status(StatusCodes.OK).json({
      message: 'Cập nhật tài khoản cá nhân thành công',
      user: updatedProfile
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const myProfileController = { getMyProfile, updateMyProfile };