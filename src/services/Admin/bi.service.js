import axios from 'axios';

const DEFAULT_DASHBOARDS = {
  system: {
    slug: 'bi-system',
    title: 'Tổng quan hệ thống',
  },
  chatbot: {
    slug: 'bi-chatbot',
    title: 'Hiệu năng chatbot',
  },
  safety: {
    slug: 'bi-safety',
    title: 'An toàn y tế',
  },
  models: {
    slug: 'bi-models',
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
    fallbackId: process.env.SUPERSET_DASHBOARD_SYSTEM,
  },
  chatbot: {
    ...DEFAULT_DASHBOARDS.chatbot,
    fallbackId: process.env.SUPERSET_DASHBOARD_CHATBOT,
  },
  safety: {
    ...DEFAULT_DASHBOARDS.safety,
    fallbackId: process.env.SUPERSET_DASHBOARD_SAFETY,
  },
  models: {
    ...DEFAULT_DASHBOARDS.models,
    fallbackId: process.env.SUPERSET_DASHBOARD_MODELS,
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

const getSupersetDashboards = async (accessToken) => {
  const { supersetUrl } = getSupersetConfig();
  const response = await supersetRequest({
    url: `${supersetUrl}/api/v1/dashboard/?page_size=100`,
    accessToken,
  });

  return response.data.result || [];
};

const resolveDashboardId = async ({ dashboard, accessToken }) => {
  const dashboards = await getSupersetDashboards(accessToken);
  const matchedDashboard = dashboards.find((item) => item.slug === dashboard.slug);

  if (matchedDashboard?.id) {
    return matchedDashboard.id;
  }

  if (dashboard.fallbackId) {
    return dashboard.fallbackId;
  }

  const error = new Error(`SUPERSET_DASHBOARD_NOT_FOUND: ${dashboard.slug}`);
  error.statusCode = 404;
  throw error;
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
    supersetUrl: `${supersetUrl}/superset/dashboard/${dashboard.slug}/`,
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
  const dashboardId = await resolveDashboardId({ dashboard, accessToken });
  const embeddedDashboardId = await ensureEmbeddedDashboard({
    dashboardId,
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
