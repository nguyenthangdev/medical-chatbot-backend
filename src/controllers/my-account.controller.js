import { StatusCodes } from 'http-status-codes';
import { myAccountService } from '../services/my-account.service.js';

const getMyProfile = async (req, res) => {
  try {
    // Lấy ID từ token đăng nhập
    const accountId = req.account._id; 
    
    const account = await myAccountService.getMyProfile(accountId);
    res.status(StatusCodes.OK).json({ data: account });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    // Lấy ID từ token đăng nhập
    const accountId = req.account._id;
    
    const updatedAccount = await myAccountService.updateMyProfile(accountId, req.body);
    
    res.status(StatusCodes.OK).json({
      message: 'Cập nhật tài khoản cá nhân thành công',
      data: updatedAccount
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const myAccountController = { getMyProfile, updateMyProfile };