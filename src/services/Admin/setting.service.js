import { SettingModel } from '../../models/setting.model.js';

const getSettings = async () => {
  return await SettingModel.find();
};

const updateSetting = async (modelName, data) => {
  // Upsert: Có rồi thì update, chưa có thì tạo mới
  const updated = await SettingModel.findOneAndUpdate(
    { modelName: modelName.toLowerCase() },
    { $set: data },
    { new: true, upsert: true } 
  );
  return updated;
};

export const settingService = { getSettings, updateSetting };