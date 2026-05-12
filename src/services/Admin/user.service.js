import { UserModel } from '../../models/user.model.js';
import searchHelpers from '../../helpers/search.helper.js';
import paginationHelpers from '../../helpers/pagination.helper.js';

const getList = async (query) => {
  const find = { deleted: false };

  // 1. Search
  const objectSearch = searchHelpers(query);
  if (objectSearch.regex) {
    find.$or = [
      { fullName: objectSearch.regex },
      { email: objectSearch.regex },
      { phone: objectSearch.regex }
    ];
  }

  // 2. Pagination
  const countUsers = await UserModel.countDocuments(find);
  const objectPagination = paginationHelpers(
    {
      currentPage: 1,
      limitItems: 10,
      skip: 0,
      totalPage: 0,
      totalItems: 0
    },
    query,
    countUsers
  );

  const users = await UserModel.find(find)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(objectPagination.skip)
    .limit(objectPagination.limitItems)
    .lean();

  return {
    users,
    objectSearch,
    objectPagination
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