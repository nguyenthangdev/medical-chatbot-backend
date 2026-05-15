import { roleService } from '../../services/Admin/role.service.js';

// const seedAdminRole = async (req, res) => {
//   try {
//     await roleService.seedAdminRole();
//     res.json({ message: 'Seed Super Admin thành công' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getRoles = async (req, res) => {
  try {
    const result = await roleService.getRoles(req.query);
    res.json(result); 
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

const createRole = async (req, res) => {
  try {
    const newRole = await roleService.createRole(req.body);
    res.status(201).json({ message: 'Tạo nhóm quyền thành công', data: newRole });
  } catch (error) { 
    if (error.message === 'MISSING_FIELDS') {
      return res.status(400).json({ error: 'Tiêu đề và Mã định danh không được trống' });
    }
    res.status(500).json({ error: error.message }); 
  }
};

const getRoleById = async (req, res) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    res.json(role);
  } catch (error) { 
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Không tìm thấy nhóm quyền' });
    res.status(500).json({ error: error.message }); 
  }
};

const updateRole = async (req, res) => {
  try {
    const updatedRole = await roleService.updateRole(req.params.id, req.body);
    res.json({ message: 'Cập nhật thành công', data: updatedRole });
  } catch (error) { 
    if (error.message === 'SUPER_ADMIN_RESTRICTED') return res.status(403).json({ error: 'Không thể chỉnh sửa Super Admin' });
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Không tìm thấy nhóm quyền' });
    res.status(500).json({ error: error.message }); 
  }
};

const deleteRole = async (req, res) => {
  try {
    await roleService.deleteRole(req.params.id);
    res.json({ message: 'Xóa thành công' });
  } catch (error) { 
    if (error.message === 'SUPER_ADMIN_RESTRICTED') return res.status(403).json({ error: 'Không thể xóa Super Admin' });
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Không tìm thấy nhóm quyền' });
    res.status(500).json({ error: error.message }); 
  }
};

const updatePermissions = async (req, res) => {
  try {
    await roleService.updatePermissions(req.body.permissions);
    res.json({ message: 'Cập nhật phân quyền thành công' });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

export const roleController = {
  getRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  updatePermissions
};