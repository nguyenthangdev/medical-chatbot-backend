import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    titleId: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
    permissions: { type: [String], default: [] },
    deleted: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isSystemAdmin: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const RoleModel = mongoose.model('Role', roleSchema);