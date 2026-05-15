import { RoleModel } from '../../models/role.model.js';
import { allPermissions } from "../../utils/constants.js"

const seedAdminRole = async () => {
  const adminRole = await RoleModel.findOne({ isSystemAdmin: true });
  if (!adminRole) {
    await RoleModel.create({
      title: 'Quản trị viên cấp cao',
      titleId: 'Super Admin',
      description: 'Quản trị viên cấp cao nhất. Có toàn quyền hệ thống (Không thể xóa hoặc thay đổi).',
      permissions: allPermissions,
      isSystemAdmin: true 
    });
    console.log("🌱 [Seed] Đã tạo thành công Role: Super Admin");
  } else {
    await RoleModel.updateOne({ isSystemAdmin: true }, { permissions: allPermissions });
  }
};

const getRoles = async ({ page = 1, limit = 10, keyword = "" }) => {
  const query = { deleted: false };
  if (keyword) query.title = { $regex: keyword, $options: "i" };

  const total = await RoleModel.countDocuments(query);
  const roles = await RoleModel.find(query)
    .sort({ isSystemAdmin: -1, createdAt: -1 }) 
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  return {
    data: roles,
    pagination: { 
      totalItems: total, 
      totalPage: Math.ceil(total / limit), 
      currentPage: parseInt(page), 
      limitItems: parseInt(limit) 
    },
    keyword
  };
};

const createRole = async (data) => {
  const { title, titleId, description } = data;
  if (!title || !titleId) throw new Error('MISSING_FIELDS');
  
  const newRole = await RoleModel.create({ title, titleId, description });
  return newRole;
};

const getRoleById = async (id) => {
  const role = await RoleModel.findById(id);
  if (!role) throw new Error('NOT_FOUND');
  return role;
};

const updateRole = async (id, data) => {
  const role = await RoleModel.findById(id);
  if (!role) throw new Error('NOT_FOUND');
  if (role.isSystemAdmin) throw new Error('SUPER_ADMIN_RESTRICTED');

  const updatedRole = await RoleModel.findByIdAndUpdate(id, data, { new: true });
  return updatedRole;
};

const deleteRole = async (id) => {
  const role = await RoleModel.findById(id);
  if (!role) throw new Error('NOT_FOUND');
  if (role.isSystemAdmin) throw new Error('SUPER_ADMIN_RESTRICTED');

  await RoleModel.findByIdAndUpdate(id, { deleted: true });
  return true;
};

const updatePermissions = async (permissions) => {
  for (const item of permissions) {
    const role = await RoleModel.findById(item._id);
    if (role && !role.isSystemAdmin) {
      await RoleModel.findByIdAndUpdate(item._id, { permissions: item.permissions });
    }
  }
  return true;
};

export const roleService = {
  seedAdminRole,
  getRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  updatePermissions
};