import { StatusCodes } from 'http-status-codes';

export const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const accountAdmin = req.accountAdmin;

      if (!accountAdmin) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ 
          message: "Vui lòng đăng nhập để tiếp tục!" 
        });
      }

      const role = accountAdmin.role_id;
      
      if (role.isSystemAdmin) {
        return next();
      }

      const userPermissions = role.permissions || [];

      if (!userPermissions.includes(requiredPermission)) {
        return res.status(StatusCodes.FORBIDDEN).json({ 
          message: "Bạn không có quyền truy cập vào chức năng này!" 
        });
      }

      next();  
    } catch (error) {
      console.error("Lỗi kiểm tra quyền:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ 
        message: "Lỗi hệ thống khi kiểm tra phân quyền!" 
      });
    }
  };
};