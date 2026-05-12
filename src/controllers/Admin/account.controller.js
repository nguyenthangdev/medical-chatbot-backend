import { StatusCodes } from 'http-status-codes';
import { accountService } from '../../services/Admin/account.service.js'; 

const getAccounts = async (req, res) => {
  try {
    const { accounts, objectSearch, objectPagination } = await accountService.getAccounts(req.query);
    
    res.status(StatusCodes.OK).json({ 
      accounts,
      keyword: objectSearch.keyword,
      pagination: objectPagination
    });
  } catch (error) {
    console.error("Lỗi getAccounts:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi lấy danh sách tài khoản!' });
  }
};

const createAccount = async (req, res) => {
  try {
    const newAccount = await accountService.createAccount(req.body);
    res.status(StatusCodes.CREATED).json({ message: 'Tạo tài khoản thành công!', account: newAccount });
  } catch (error) {
    if (error.message === 'EMAIL_EXISTS') {
      return res.status(StatusCodes.CONFLICT).json({ message: 'Email này đã tồn tại trong hệ thống!' });
    }
    console.error("Lỗi createAccount:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi tạo tài khoản!' });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAccount = await accountService.updateAccount(id, req.body);
    res.status(StatusCodes.OK).json({ message: 'Cập nhật thành công!', account: updatedAccount });
  } catch (error) {
    if (error.message === 'ACCOUNT_NOT_FOUND') {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy tài khoản!' });
    }
    console.error("Lỗi updateAccount:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi cập nhật tài khoản!' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const currentAdminId = req.accountAdmin._id.toString();

    await accountService.deleteAccount(id, currentAdminId);
    res.status(StatusCodes.OK).json({ message: 'Xóa tài khoản thành công!' });
  } catch (error) {
    if (error.message === 'SELF_DELETE_NOT_ALLOWED') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Không thể tự xóa tài khoản của chính mình!' });
    }
    if (error.message === 'ACCOUNT_NOT_FOUND') {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy tài khoản!' });
    }
    console.error("Lỗi deleteAccount:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi xóa tài khoản!' });
  }
};

const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const account = await accountService.getAccountById(id);
    res.status(StatusCodes.OK).json({ account });
  } catch (error) {
    if (error.message === 'ACCOUNT_NOT_FOUND') {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Không tìm thấy tài khoản!' });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Lỗi lấy thông tin tài khoản!' });
  }
};

export const accountController = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount
};