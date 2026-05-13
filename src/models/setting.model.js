import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  modelName: { 
    type: String, 
    required: true, 
    unique: true,
    enum: ['qwen', 'gemini', 'claude'] 
  },
  temperature: { type: Number, default: 0.7 },
  maxTokens: { type: Number, default: 2000 },
  maintenanceMode: { type: Boolean, default: false }
}, { timestamps: true });

export const SettingModel = mongoose.model('Setting', settingSchema);