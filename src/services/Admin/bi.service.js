import axios from 'axios';

const DEFAULT_DASHBOARDS = {
  system: {
    id: '2',
    title: 'Tổng quan hệ thống',
  },
  chatbot: {
    id: '3',
    title: 'Hiệu năng chatbot',
  },
  safety: {
    id: '4',
    title: 'An toàn y tế',
  },
  models: {
    id: '5',
    title: 'Quản trị mô hình AI',
  },
};

const getSupersetConfig = () => {
  const supersetUrl = process.env.SUPERSET_URL || 'http://localhost:8088';

  return {
    supersetUrl,
    username: process.env.SUPERSET_USERNAME || 'admin',
    password: process.env.SUPERSET_PASSWORD || 'admin',
    allowedDomains: (process.env.SUPERSET_EMBED_ALLOWED_DOMAINS || 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((domain) => domain.trim())
      .filter(Boolean),
  };
};

const getDashboardMap = () => ({
  system: {
    ...DEFAULT_DASHBOARDS.system,
    id: process.env.SUPERSET_DASHBOARD_SYSTEM || DEFAULT_DASHBOARDS.system.id,
  },
  chatbot: {
    ...DEFAULT_DASHBOARDS.chatbot,
    id: process.env.SUPERSET_DASHBOARD_CHATBOT || DEFAULT_DASHBOARDS.chatbot.id,
  },
  safety: {
    ...DEFAULT_DASHBOARDS.safety,
    id: process.env.SUPERSET_DASHBOARD_SAFETY || DEFAULT_DASHBOARDS.safety.id,
  },
  models: {
    ...DEFAULT_DASHBOARDS.models,
    id: process.env.SUPERSET_DASHBOARD_MODELS || DEFAULT_DASHBOARDS.models.id,
  },
});

const supersetRequest = async ({ method = 'get', url, accessToken, csrfToken, csrfCookie, data }) => {
  const response = await axios({
    method,
    url,
    data,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
      ...(csrfCookie ? { Cookie: csrfCookie } : {}),
      'Content-Type': 'application/json',
    },
  });

  return response;
};

const loginSuperset = async () => {
  const { supersetUrl, username, password } = getSupersetConfig();
  const response = await supersetRequest({
    method: 'post',
    url: `${supersetUrl}/api/v1/security/login`,
    data: {
      username,
      password,
      provider: 'db',
      refresh: true,
    },
  });

  return response.data.access_token;
};

const getCsrfToken = async (accessToken) => {
  const { supersetUrl } = getSupersetConfig();
  const response = await supersetRequest({
    url: `${supersetUrl}/api/v1/security/csrf_token/`,
    accessToken,
  });

  return {
    csrfToken: response.data.result,
    csrfCookie: response.headers['set-cookie']?.[0]?.split(';')[0],
  };
};

const ensureEmbeddedDashboard = async ({ dashboardId, accessToken, csrfToken, csrfCookie }) => {
  const { supersetUrl, allowedDomains } = getSupersetConfig();

  try {
    const response = await supersetRequest({
      url: `${supersetUrl}/api/v1/dashboard/${dashboardId}/embedded`,
      accessToken,
    });

    return response.data.result.uuid;
  } catch (error) {
    if (error.response?.status !== 404) throw error;
  }

  const response = await supersetRequest({
    method: 'post',
    url: `${supersetUrl}/api/v1/dashboard/${dashboardId}/embedded`,
    accessToken,
    csrfToken,
    csrfCookie,
    data: {
      allowed_domains: allowedDomains,
    },
  });

  return response.data.result.uuid;
};

const createGuestToken = async ({ embeddedDashboardId, accessToken, csrfToken, csrfCookie, accountAdmin }) => {
  const { supersetUrl } = getSupersetConfig();
  const response = await supersetRequest({
    method: 'post',
    url: `${supersetUrl}/api/v1/security/guest_token/`,
    accessToken,
    csrfToken,
    csrfCookie,
    data: {
      resources: [
        {
          type: 'dashboard',
          id: embeddedDashboardId,
        },
      ],
      rls: [],
      user: {
        username: accountAdmin?.email || accountAdmin?.username || String(accountAdmin?._id || 'admin'),
        first_name: accountAdmin?.fullName || accountAdmin?.username || 'Admin',
        last_name: 'BI',
      },
    },
  });

  return response.data.token;
};

const getDashboards = () => {
  const { supersetUrl } = getSupersetConfig();
  const dashboardMap = getDashboardMap();

  return Object.entries(dashboardMap).map(([key, dashboard]) => ({
    key,
    title: dashboard.title,
    supersetUrl: `${supersetUrl}/superset/dashboard/${dashboard.id}/`,
  }));
};

const getGuestToken = async ({ dashboardKey, accountAdmin }) => {
  const { supersetUrl } = getSupersetConfig();
  const dashboard = getDashboardMap()[dashboardKey];

  if (!dashboard) {
    const error = new Error('UNKNOWN_DASHBOARD');
    error.statusCode = 404;
    throw error;
  }

  const accessToken = await loginSuperset();
  const { csrfToken, csrfCookie } = await getCsrfToken(accessToken);
  const embeddedDashboardId = await ensureEmbeddedDashboard({
    dashboardId: dashboard.id,
    accessToken,
    csrfToken,
    csrfCookie,
  });
  const token = await createGuestToken({
    embeddedDashboardId,
    accessToken,
    csrfToken,
    csrfCookie,
    accountAdmin,
  });

  return {
    token,
    dashboardId: embeddedDashboardId,
    supersetDomain: supersetUrl,
  };
};

export const biService = {
  getDashboards,
  getGuestToken,
};
