import { StatusCodes } from 'http-status-codes';
import { userService } from '../../services/Admin/user.service.js';

const getList = async (req, res) => {
  try {
    const users = await userService.getList();
    res.status(StatusCodes.OK).json({ data: users });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const getDetail = async (req, res) => {
  try {
    const user = await userService.getDetail(req.params.id);
    res.status(StatusCodes.OK).json({ data: user });
  } catch (error) {
    res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const updatedUser = await userService.updateUser(req.params.id, req.body);
    res.status(StatusCodes.OK).json({
      message: 'Cập nhật thông tin người dùng thành công',
      data: updatedUser
    });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const userController = { getList, getDetail, updateUser };