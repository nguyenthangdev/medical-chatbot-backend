import 'dotenv/config';

const SUPERSET_URL = process.env.SUPERSET_URL || 'http://localhost:8088';
const SUPERSET_USERNAME = process.env.SUPERSET_USERNAME || 'admin';
const SUPERSET_PASSWORD = process.env.SUPERSET_PASSWORD || 'admin';

const DATASETS = {
  chatMessageAnalytics: 'chat_message_analytics',
  systemUsageDaily: 'system_usage_daily',
  chatbotModelDaily: 'chatbot_model_daily',
  medicalSafetyDaily: 'medical_safety_daily',
  aiModelOperations: 'ai_model_operations',
  biUsers: 'bi_users',
  biConversations: 'bi_conversations',
};

const DASHBOARDS = [
  {
    title: 'BI - System Usage Overview',
    slug: 'bi-system',
    charts: [
      bigNumber('Total Users', DATASETS.biUsers, 'count'),
      bigNumber('Total Conversations', DATASETS.biConversations, 'count'),
      timeSeriesBar('New Users By Day', DATASETS.systemUsageDaily, 'report_date', 'sum__new_users'),
      timeSeriesLine('Conversations By Day', DATASETS.systemUsageDaily, 'report_date', 'sum__new_conversations'),
      timeSeriesBar('Messages By Day', DATASETS.systemUsageDaily, 'report_date', 'sum__total_messages'),
      pie('Active vs Inactive Users', DATASETS.biUsers, 'status', 'count'),
    ],
  },
  {
    title: 'BI - Chatbot Performance Analytics',
    slug: 'bi-chatbot',
    charts: [
      pie('Messages By Role', DATASETS.chatMessageAnalytics, 'role', 'count'),
      bar('Model Usage', DATASETS.chatbotModelDaily, 'model', 'sum__assistant_responses'),
      bar('Token Usage By Model', DATASETS.chatbotModelDaily, 'model', 'sum__total_tokens'),
      timeSeriesLine('Token Usage Over Time', DATASETS.chatbotModelDaily, 'report_date', 'sum__total_tokens', 'model'),
      bar('Average Latency By Model', DATASETS.chatbotModelDaily, 'model', 'avg__avg_latency'),
      bigNumber('Cancelled Responses', DATASETS.chatbotModelDaily, 'sum__cancelled_responses'),
    ],
  },
  {
    title: 'BI - Medical Safety Analytics',
    slug: 'bi-safety',
    charts: [
      pie('Risk Level Distribution', DATASETS.medicalSafetyDaily, 'risk_level', 'sum__assistant_responses'),
      timeSeriesBar('High Risk Cases Over Time', DATASETS.medicalSafetyDaily, 'report_date', 'sum__high_risk_cases'),
      bar('Intent Distribution', DATASETS.medicalSafetyDaily, 'intent', 'sum__assistant_responses'),
      timeSeriesLine('Blocked Responses Over Time', DATASETS.medicalSafetyDaily, 'report_date', 'sum__blocked_responses'),
      timeSeriesLine('Warnings Over Time', DATASETS.medicalSafetyDaily, 'report_date', 'sum__warning_count'),
      bigNumber('Source Usage', DATASETS.medicalSafetyDaily, 'sum__source_count'),
    ],
  },
  {
    title: 'BI - AI Model Operations',
    slug: 'bi-models',
    charts: [
      bar('Requests By Model', DATASETS.aiModelOperations, 'model', 'sum__requests'),
      bar('Total Tokens By Model', DATASETS.aiModelOperations, 'model', 'sum__total_tokens'),
      bar('Average Latency By Model', DATASETS.aiModelOperations, 'model', 'avg__avg_latency'),
      bar('Average Completion Tokens', DATASETS.aiModelOperations, 'model', 'avg__avg_completion_tokens'),
      bar('Cancelled Rate By Model', DATASETS.aiModelOperations, 'model', 'avg__cancelled_rate'),
      table('Model Maintenance Status', DATASETS.aiModelOperations, ['model', 'temperature', 'max_tokens', 'maintenance_mode']),
    ],
  },
];

function metric(metricName) {
  if (metricName === 'count') return 'count';

  const [aggregate, column] = metricName.split('__');
  return {
    aggregate: aggregate.toUpperCase(),
    column: {
      column_name: column,
      type: 'INTEGER',
    },
    expressionType: 'SIMPLE',
    label: `${aggregate.toUpperCase()}(${column})`,
  };
}

function baseParams(datasetName, vizType) {
  return {
    datasource: datasetName,
    viz_type: vizType,
    adhoc_filters: [],
    row_limit: 10000,
  };
}

function bigNumber(name, datasetName, metricName) {
  return {
    name,
    datasetName,
    vizType: 'big_number_total',
    params: {
      ...baseParams(datasetName, 'big_number_total'),
      metric: metric(metricName),
      header_font_size: 0.4,
      subheader_font_size: 0.15,
      y_axis_format: 'SMART_NUMBER',
    },
  };
}

function pie(name, datasetName, groupby, metricName) {
  return {
    name,
    datasetName,
    vizType: 'pie',
    params: {
      ...baseParams(datasetName, 'pie'),
      groupby: [groupby],
      metric: metric(metricName),
      show_labels: true,
      labels_outside: true,
      donut: false,
      number_format: 'SMART_NUMBER',
    },
  };
}

function bar(name, datasetId, groupby, metricName) {
  return pie(name, datasetId, groupby, metricName);
}

function timeSeriesBar(name, datasetId, timeColumn, metricName, seriesColumn = null) {
  return timeSeries(name, datasetId, timeColumn, metricName, seriesColumn);
}

function timeSeriesLine(name, datasetId, timeColumn, metricName, seriesColumn = null) {
  return timeSeries(name, datasetId, timeColumn, metricName, seriesColumn);
}

function timeSeries(name, datasetName, timeColumn, metricName, seriesColumn) {
  const columns = [timeColumn];
  if (seriesColumn) columns.push(seriesColumn);
  const metricColumn = typeof metricName === 'string' && metricName.includes('__')
    ? metricName.split('__')[1]
    : null;
  if (metricColumn) columns.push(metricColumn);

  return {
    name,
    datasetName,
    vizType: 'table',
    params: {
      ...baseParams(datasetName, 'table'),
      all_columns: [...new Set(columns)],
      order_desc: true,
      page_length: 20,
    },
  };
}

function table(name, datasetName, columns) {
  return {
    name,
    datasetName,
    vizType: 'table',
    params: {
      ...baseParams(datasetName, 'table'),
      all_columns: columns,
      order_desc: true,
      page_length: 20,
    },
  };
}

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

const apiHeaders = ({ accessToken, csrfToken, csrfCookie }) => ({
  Authorization: `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'X-CSRFToken': csrfToken,
  ...(csrfCookie ? { Cookie: csrfCookie } : {}),
});

const createDashboard = async (auth, title, slug) => {
  try {
    const { data } = await requestJson(`${SUPERSET_URL}/api/v1/dashboard/`, {
      method: 'POST',
      headers: apiHeaders(auth),
      body: JSON.stringify({ dashboard_title: title, slug, published: true }),
    });

    return data.id;
  } catch (error) {
    if (error.status !== 422 && error.status !== 409) {
      throw error;
    }

    const dashboardId = await findDashboardId(auth.accessToken, slug);
    if (!dashboardId) {
      throw error;
    }

    console.log(`Dashboard already exists: ${title} (${slug})`);
    return dashboardId;
  }
};

const findDashboardId = async (accessToken, slug) => {
  const { data } = await requestJson(`${SUPERSET_URL}/api/v1/dashboard/?page_size=100`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return data.result.find((dashboard) => dashboard.slug === slug)?.id || null;
};

const getDatasetIds = async (accessToken) => {
  const { data } = await requestJson(`${SUPERSET_URL}/api/v1/dataset/?page_size=100`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return new Map(data.result.map((dataset) => [dataset.table_name, dataset.id]));
};

const createChart = async (auth, dashboardId, chart) => {
  const datasetId = auth.datasetIds.get(chart.datasetName);
  if (!datasetId) {
    throw new Error(`Superset dataset not found: ${chart.datasetName}`);
  }

  const params = {
    ...chart.params,
    datasource: `${datasetId}__table`,
  };

  const { data } = await requestJson(`${SUPERSET_URL}/api/v1/chart/`, {
    method: 'POST',
    headers: apiHeaders(auth),
    body: JSON.stringify({
      slice_name: chart.name,
      viz_type: chart.vizType,
      datasource_id: datasetId,
      datasource_type: 'table',
      dashboards: [dashboardId],
      params: JSON.stringify(params),
    }),
  });

  const chartId = data.id;
  const { data: chartData } = await requestJson(`${SUPERSET_URL}/api/v1/chart/${chartId}`, {
    headers: { Authorization: `Bearer ${auth.accessToken}` },
  });

  return {
    id: chartId,
    uuid: chartData.result.uuid,
    sliceName: chartData.result.slice_name,
  };
};

const buildPositionJson = (dashboardTitle, charts) => {
  const rootId = 'ROOT_ID';
  const headerId = 'HEADER_ID';
  const gridId = 'GRID_ID';
  const rows = [];
  const position = {
    DASHBOARD_VERSION_KEY: 'v2',
    [rootId]: {
      type: 'ROOT',
      id: rootId,
      children: [gridId],
    },
    [headerId]: {
      type: 'HEADER',
      id: headerId,
      meta: {
        text: dashboardTitle,
      },
    },
    [gridId]: {
      type: 'GRID',
      id: gridId,
      parents: [rootId],
      children: rows,
    },
  };

  for (let index = 0; index < charts.length; index += 2) {
    const rowId = `ROW-${index / 2}`;
    const rowCharts = charts.slice(index, index + 2);
    const rowChartIds = rowCharts.map((chart) => `CHART-${chart.id}`);
    rows.push(rowId);
    position[rowId] = {
      type: 'ROW',
      id: rowId,
      parents: [rootId, gridId],
      children: rowChartIds,
      meta: {
        background: 'BACKGROUND_TRANSPARENT',
      },
    };

    for (const chart of rowCharts) {
      const chartComponentId = `CHART-${chart.id}`;
      position[chartComponentId] = {
        type: 'CHART',
        id: chartComponentId,
        parents: [rootId, gridId, rowId],
        children: [],
        meta: {
          chartId: chart.id,
          uuid: chart.uuid,
          sliceName: chart.sliceName,
          height: 50,
          width: 6,
        },
      };
    }
  }

  return JSON.stringify(position);
};

const updateDashboardLayout = async (auth, dashboardId, dashboardTitle, charts) => {
  await requestJson(`${SUPERSET_URL}/api/v1/dashboard/${dashboardId}`, {
    method: 'PUT',
    headers: apiHeaders(auth),
    body: JSON.stringify({
      position_json: buildPositionJson(dashboardTitle, charts),
    }),
  });
};

const main = async () => {
  try {
    const accessToken = await login();
    const { csrfToken, csrfCookie } = await getCsrf(accessToken);
    const datasetIds = await getDatasetIds(accessToken);
    const auth = { accessToken, csrfToken, csrfCookie, datasetIds };

    for (const dashboard of DASHBOARDS) {
      const dashboardId = await createDashboard(auth, dashboard.title, dashboard.slug);
      const createdCharts = [];

      for (const chart of dashboard.charts) {
        const createdChart = await createChart(auth, dashboardId, chart);
        createdCharts.push(createdChart);
      }

      await updateDashboardLayout(auth, dashboardId, dashboard.title, createdCharts);
      console.log(`Created dashboard: ${dashboard.title} (${dashboard.slug})`);
    }

    console.log('Superset BI dashboards are ready.');
  } catch (error) {
    console.error('Failed to setup Superset dashboards:', error.data || error);
    process.exitCode = 1;
  }
};

main();
