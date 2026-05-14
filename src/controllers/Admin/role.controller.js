import { RoleModel } from '../../models/role.model.js';

const seedAdminRole = async () => {
  try {
    const allPermissions = [
      "users_view", "users_create", "users_edit", "users_delete",
      "roles_view", "roles_create", "roles_edit", "roles_permissions",
      "chats_view", "chats_delete", "settings_edit"
    ];

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
  } catch (error) {
    console.error("Lỗi Seed Super Admin Role:", error);
  }
};

const getRoles = async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = "" } = req.query;
    const query = { deleted: false };
    if (keyword) query.title = { $regex: keyword, $options: "i" };

    const total = await RoleModel.countDocuments(query);
    const roles = await RoleModel.find(query)
      .sort({ isSystemAdmin: -1, createdAt: -1 }) // Lệnh này ép Admin luôn đứng ở vị trí số 1
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.json({
      data: roles,
      pagination: { totalItems: total, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), limit: parseInt(limit) },
      keyword
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const createRole = async (req, res) => {
  try {
    const { title, titleId, description } = req.body;
    if (!title || !titleId) return res.status(400).json({ error: 'Tiêu đề và Mã định danh không được trống' });
    const newRole = await RoleModel.create({ title, titleId, description });
    res.status(201).json({ message: 'Tạo nhóm quyền thành công', data: newRole });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const getRoleById = async (req, res) => {
  try {
    const role = await RoleModel.findById(req.params.id);
    if (!role) return res.status(404).json({ error: 'Không tìm thấy nhóm quyền' });
    res.json(role);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updateRole = async (req, res) => {
  try {
    const role = await RoleModel.findById(req.params.id);
    if (role.isSystemAdmin) return res.status(403).json({ error: 'Không thể chỉnh sửa Super Admin' });

    const updatedRole = await RoleModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Cập nhật thành công', data: updatedRole });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteRole = async (req, res) => {
  try {
    const role = await RoleModel.findById(req.params.id);
    if (role.isSystemAdmin) return res.status(403).json({ error: 'Không thể xóa Super Admin' });

    await RoleModel.findByIdAndUpdate(req.params.id, { deleted: true });
    res.json({ message: 'Xóa thành công' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const updatePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    for (const item of permissions) {
      const role = await RoleModel.findById(item._id);
      // Chặn nếu có ai đó cố tình bắn API sửa quyền của Admin
      if (!role.isSystemAdmin) {
        await RoleModel.findByIdAndUpdate(item._id, { permissions: item.permissions });
      }
    }
    res.json({ message: 'Cập nhật phân quyền thành công' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const roleController = {
  seedAdminRole,
  getRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  updatePermissions
}