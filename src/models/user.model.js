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
    emailVerified: { type: Boolean, default: true },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    loginFailedAttempts: { type: Number, default: 0, select: false },
    loginLockedUntil: { type: Date, select: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    deleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model('User', userSchema);
