import { StatusCodes } from 'http-status-codes';
import { userService } from '../../services/Admin/user.service.js';

const getList = async (req, res) => {
  try {
    const { users, objectSearch, objectPagination } = await userService.getList(req.query);

    res.status(StatusCodes.OK).json({
      code: 200,
      message: 'Thành công!',
      users,
      keyword: objectSearch.keyword,
      pagination: objectPagination
    });
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

const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(StatusCodes.OK).json({ message: 'Xóa người dùng thành công!' });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await userService.updateUser(id, req.body);
    res.status(StatusCodes.OK).json({ message: 'Cập nhật thành công!', data: updatedUser });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const userController = { getList, getDetail, deleteUser, updateUser };