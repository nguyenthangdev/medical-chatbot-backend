import bcrypt from 'bcrypt';
import { AccountModel } from '../../models/account.model.js';

const getAccounts = async () => {
  return await AccountModel.find({ deleted: false })
    .select('-password')
    .sort({ createdAt: -1 });
};

const createAccount = async (data) => {
  const { fullName, email, password, role, status } = data;

  const existEmail = await AccountModel.findOne({ email, deleted: false });
  if (existEmail) {
    throw new Error('EMAIL_EXISTS'); 
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newAccount = await AccountModel.create({
    fullName,
    email,
    password: hashedPassword,
    role: role || 'Admin',
    status: status || 'active'
  });

  return newAccount;
};

const updateAccount = async (id, updateData) => {
  const updatedAccount = await AccountModel.findByIdAndUpdate(
    id, 
    updateData, 
    { new: true }
  ).select('-password');

  if (!updatedAccount) {
    throw new Error('ACCOUNT_NOT_FOUND');
  }

  return updatedAccount;
};

const deleteAccount = async (id, currentAdminId) => {
  if (id === currentAdminId) {
    throw new Error('SELF_DELETE_NOT_ALLOWED');
  }

  const account = await AccountModel.findByIdAndUpdate(id, { deleted: true });
  if (!account) {
    throw new Error('ACCOUNT_NOT_FOUND');
  }
  
  return true;
};

const getAccountById = async (id) => {
  const account = await AccountModel.findById(id).select('-password');
  if (!account || account.deleted) {
    throw new Error('ACCOUNT_NOT_FOUND');
  }
  return account;
};

export const accountService = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount
};