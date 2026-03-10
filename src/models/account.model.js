import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false }, // Ẩn password khi query
    fullName: { type: String, required: true },
    phone: { type: String },
    avatar: { type: String },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true } // Tự động tạo createdAt, updatedAt
);

export const AccountModel = mongoose.model('Account', accountSchema, 'my-account');