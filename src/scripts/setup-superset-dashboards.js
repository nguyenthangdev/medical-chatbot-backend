import 'dotenv/config';

const SUPERSET_URL = process.env.SUPERSET_URL || 'http://localhost:8088';
const SUPERSET_USERNAME = process.env.SUPERSET_USERNAME || 'admin';
const SUPERSET_PASSWORD = process.env.SUPERSET_PASSWORD || 'admin';

const DASHBOARDS = [
  {
    title: 'BI - System Usage Overview',
    slug: 'bi-system',
    charts: [
      bigNumber('Total Users', 6, 'count'),
      bigNumber('Total Conversations', 7, 'count'),
      timeSeriesBar('New Users By Day', 2, 'report_date', 'sum__new_users'),
      timeSeriesLine('Conversations By Day', 2, 'report_date', 'sum__new_conversations'),
      timeSeriesBar('Messages By Day', 2, 'report_date', 'sum__total_messages'),
      pie('Active vs Inactive Users', 6, 'status', 'count'),
    ],
  },
  {
    title: 'BI - Chatbot Performance Analytics',
    slug: 'bi-chatbot',
    charts: [
      pie('Messages By Role', 1, 'role', 'count'),
      bar('Model Usage', 3, 'model', 'sum__assistant_responses'),
      bar('Token Usage By Model', 3, 'model', 'sum__total_tokens'),
      timeSeriesLine('Token Usage Over Time', 3, 'report_date', 'sum__total_tokens', 'model'),
      bar('Average Latency By Model', 3, 'model', 'avg__avg_latency'),
      bigNumber('Cancelled Responses', 3, 'sum__cancelled_responses'),
    ],
  },
  {
    title: 'BI - Medical Safety Analytics',
    slug: 'bi-safety',
    charts: [
      pie('Risk Level Distribution', 4, 'risk_level', 'sum__assistant_responses'),
      timeSeriesBar('High Risk Cases Over Time', 4, 'report_date', 'sum__high_risk_cases'),
      bar('Intent Distribution', 4, 'intent', 'sum__assistant_responses'),
      timeSeriesLine('Blocked Responses Over Time', 4, 'report_date', 'sum__blocked_responses'),
      timeSeriesLine('Warnings Over Time', 4, 'report_date', 'sum__warning_count'),
      bigNumber('Source Usage', 4, 'sum__source_count'),
    ],
  },
  {
    title: 'BI - AI Model Operations',
    slug: 'bi-models',
    charts: [
      bar('Requests By Model', 5, 'model', 'sum__requests'),
      bar('Total Tokens By Model', 5, 'model', 'sum__total_tokens'),
      bar('Average Latency By Model', 5, 'model', 'avg__avg_latency'),
      bar('Average Completion Tokens', 5, 'model', 'avg__avg_completion_tokens'),
      bar('Cancelled Rate By Model', 5, 'model', 'avg__cancelled_rate'),
      table('Model Maintenance Status', 5, ['model', 'temperature', 'max_tokens', 'maintenance_mode']),
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

function baseParams(datasetId, vizType) {
  return {
    datasource: `${datasetId}__table`,
    viz_type: vizType,
    adhoc_filters: [],
    row_limit: 10000,
  };
}

function bigNumber(name, datasetId, metricName) {
  return {
    name,
    datasetId,
    vizType: 'big_number_total',
    params: {
      ...baseParams(datasetId, 'big_number_total'),
      metric: metric(metricName),
      header_font_size: 0.4,
      subheader_font_size: 0.15,
      y_axis_format: 'SMART_NUMBER',
    },
  };
}

function pie(name, datasetId, groupby, metricName) {
  return {
    name,
    datasetId,
    vizType: 'pie',
    params: {
      ...baseParams(datasetId, 'pie'),
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

function timeSeries(name, datasetId, timeColumn, metricName, seriesColumn) {
  const columns = [timeColumn];
  if (seriesColumn) columns.push(seriesColumn);
  const metricColumn = typeof metricName === 'string' && metricName.includes('__')
    ? metricName.split('__')[1]
    : null;
  if (metricColumn) columns.push(metricColumn);

  return {
    name,
    datasetId,
    vizType: 'table',
    params: {
      ...baseParams(datasetId, 'table'),
      all_columns: [...new Set(columns)],
      order_desc: true,
      page_length: 20,
    },
  };
}

function table(name, datasetId, columns) {
  return {
    name,
    datasetId,
    vizType: 'table',
    params: {
      ...baseParams(datasetId, 'table'),
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
  const { data } = await requestJson(`${SUPERSET_URL}/api/v1/dashboard/`, {
    method: 'POST',
    headers: apiHeaders(auth),
    body: JSON.stringify({ dashboard_title: title, slug, published: true }),
  });

  return data.id;
};

const createChart = async (auth, dashboardId, chart) => {
  const { data } = await requestJson(`${SUPERSET_URL}/api/v1/chart/`, {
    method: 'POST',
    headers: apiHeaders(auth),
    body: JSON.stringify({
      slice_name: chart.name,
      viz_type: chart.vizType,
      datasource_id: chart.datasetId,
      datasource_type: 'table',
      dashboards: [dashboardId],
      params: JSON.stringify(chart.params),
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
    const auth = { accessToken, csrfToken, csrfCookie };

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
