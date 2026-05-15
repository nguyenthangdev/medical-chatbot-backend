import { biService } from '../../services/Admin/bi.service.js';

const getDashboards = async (_req, res) => {
  try {
    res.json({
      dashboards: biService.getDashboards(),
    });
  } catch (error) {
    res.status(500).json({ message: 'Không thể lấy danh sách BI dashboard.' });
  }
};

const getGuestToken = async (req, res) => {
  try {
    const result = await biService.getGuestToken({
      dashboardKey: req.params.dashboardKey,
      accountAdmin: req.accountAdmin,
    });

    res.json(result);
  } catch (error) {
    if (error.statusCode === 404 || error.message === 'UNKNOWN_DASHBOARD') {
      return res.status(404).json({ message: 'Không tìm thấy BI dashboard.' });
    }

    res.status(500).json({
      message: 'Không thể tạo guest token Superset.',
      details: error.response?.data || error.message,
    });
  }
};

export const biController = {
  getDashboards,
  getGuestToken,
};
