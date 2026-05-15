import 'dotenv/config';

const SUPERSET_URL = process.env.SUPERSET_URL || 'http://localhost:8088';
const SUPERSET_USERNAME = process.env.SUPERSET_USERNAME || 'admin';
const SUPERSET_PASSWORD = process.env.SUPERSET_PASSWORD || 'admin';
const SUPERSET_DATABASE_NAME = process.env.SUPERSET_DATABASE_NAME || 'medical_chatbot_bi';
const SUPERSET_SCHEMA = process.env.SUPERSET_SCHEMA || 'public';

const DATASETS = [
  'bi_users',
  'bi_conversations',
  'chat_message_analytics',
  'system_usage_daily',
  'chatbot_model_daily',
  'medical_safety_daily',
  'ai_model_operations',
];

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.errors?.[0]?.message || text;
    const error = new Error(message || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return { response, data };
};

const login = async () => {
  const { data } = await requestJson(`${SUPERSET_URL}/api/v1/security/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: SUPERSET_USERNAME,
      password: SUPERSET_PASSWORD,
      provider: 'db',
      refresh: true,
    }),
  });

  return data.access_token;
};

const getCsrf = async (accessToken) => {
  const { response, data } = await requestJson(`${SUPERSET_URL}/api/v1/security/csrf_token/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return {
    csrfToken: data.result,
    csrfCookie: response.headers.get('set-cookie')?.split(';')[0],
  };
};

const getDatabaseId = async (accessToken) => {
  const { data } = await requestJson(`${SUPERSET_URL}/api/v1/database/`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const database = data.result.find((item) => item.database_name === SUPERSET_DATABASE_NAME);
  if (!database) {
    throw new Error(`Superset database not found: ${SUPERSET_DATABASE_NAME}`);
  }

  return database.id;
};

const createDataset = async ({ accessToken, csrfToken, csrfCookie, databaseId, tableName }) => {
  try {
    await requestJson(`${SUPERSET_URL}/api/v1/dataset/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
        ...(csrfCookie ? { Cookie: csrfCookie } : {}),
      },
      body: JSON.stringify({
        database: databaseId,
        schema: SUPERSET_SCHEMA,
        table_name: tableName,
      }),
    });

    console.log(`Created dataset: ${tableName}`);
  } catch (error) {
    if (error.status === 422 || error.status === 409 || String(error.message).toLowerCase().includes('already')) {
      console.log(`Dataset already exists: ${tableName}`);
      return;
    }

    throw error;
  }
};

const main = async () => {
  try {
    const accessToken = await login();
    const { csrfToken, csrfCookie } = await getCsrf(accessToken);
    const databaseId = await getDatabaseId(accessToken);

    for (const tableName of DATASETS) {
      await createDataset({ accessToken, csrfToken, csrfCookie, databaseId, tableName });
    }

    console.log('Superset datasets are ready.');
  } catch (error) {
    console.error('Failed to setup Superset datasets:', error.data || error);
    process.exitCode = 1;
  }
};

main();
