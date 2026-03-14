import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, trim: true },
    password: { type: String, required: false, select: false }, 
    fullName: { type: String, required: true },
    yearOfBirth: { type: String },
    sex: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], default: 'MALE' },
    address: { type: String },
    phone: { type: String },
    avatar: { type: String },
    totalTokensUsed: { type: Number, default: 0 },
    googleId: { type: String, unique: true, sparse: true, select: false },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model('User', userSchema);