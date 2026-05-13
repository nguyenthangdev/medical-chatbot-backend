import { StatusCodes } from 'http-status-codes';
import { settingService } from '../../services/Admin/setting.service.js';

const getSettings = async (req, res) => {
  try {
    const settings = await settingService.getSettings();
    res.status(StatusCodes.OK).json({ data: settings });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

const updateSetting = async (req, res) => {
  try {
    const { modelName } = req.params;
    const updated = await settingService.updateSetting(modelName, req.body);
    res.status(StatusCodes.OK).json({ message: 'Lưu cài đặt thành công!', data: updated });
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
  }
};

export const settingController = { getSettings, updateSetting };