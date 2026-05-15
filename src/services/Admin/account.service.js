import bcrypt from 'bcrypt';
import { AccountModel } from '../../models/account.model.js';
import searchHelpers from '../../helpers/search.helper.js';
import paginationHelpers from '../../helpers/pagination.helper.js';

const getAccounts = async (query) => {
  const find = { deleted: false };

  const objectSearch = searchHelpers(query);
  if (objectSearch.regex) {
    find.$or = [
      { fullName: objectSearch.regex },
      { email: objectSearch.regex }
    ];
  }

  const countAccounts = await AccountModel.countDocuments(find);
  const objectPagination = paginationHelpers(
    { currentPage: 1, limitItems: 10, skip: 0, totalPage: 0, totalItems: 0 },
    query,
    countAccounts
  );

  const accounts = await AccountModel.find(find)
    .select('-password')
    .populate('role_id', 'title titleId isSystemAdmin') 
    .sort({ createdAt: -1 })
    .skip(objectPagination.skip)
    .limit(objectPagination.limitItems)
    .lean();

  return { accounts, objectSearch, objectPagination };
};

const createAccount = async (data) => {
  const { fullName, email, password, role_id, status } = data; 

  const existEmail = await AccountModel.findOne({ email, deleted: false });
  if (existEmail) throw new Error('EMAIL_EXISTS'); 

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newAccount = await AccountModel.create({
    fullName, email, password: hashedPassword, role_id, status: status || 'active'
  });

  return newAccount;
};

const updateAccount = async (id, updateData) => {
  // Nếu có truyền mật khẩu mới thì mã hóa nó
  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }

  const updatedAccount = await AccountModel.findByIdAndUpdate(
    id, updateData, { new: true }
  ).select('-password');

  if (!updatedAccount) throw new Error('ACCOUNT_NOT_FOUND');
  return updatedAccount;
};

const deleteAccount = async (id, currentAdminId) => {
  if (id === currentAdminId) throw new Error('SELF_DELETE_NOT_ALLOWED');

  const account = await AccountModel.findByIdAndUpdate(id, { deleted: true });
  if (!account) throw new Error('ACCOUNT_NOT_FOUND');
  return true;
};

const getAccountById = async (id) => {
  const account = await AccountModel.findOne({ _id: id, deleted: false })
    .select('-password')
    .populate('role_id', 'title titleId');
  if (!account) throw new Error('ACCOUNT_NOT_FOUND');
  return account;
};

export const accountService = { getAccounts, createAccount, updateAccount, deleteAccount, getAccountById };