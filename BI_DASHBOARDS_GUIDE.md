# BI Dashboards With Apache Superset

Superset URL:

```txt
http://localhost:8088
```

Login:

```txt
username: admin
password: admin
```

Database connection already created:

```txt
medical_chatbot_bi
```

Datasets already created:

```txt
chat_message_analytics
system_usage_daily
chatbot_model_daily
medical_safety_daily
ai_model_operations
```

## Refresh BI Data

Run these commands from `back-end` whenever MongoDB data changes:

```bash
yarn bi:sync
yarn bi:views
yarn bi:superset
```

`yarn dev` and `yarn production` start the BI sync scheduler automatically when `BI_SYNC_ENABLED` is not `false`.

To run the scheduler as a separate process instead, keep this worker running from `back-end`:

```bash
yarn bi:sync:worker
```

The default interval is 60 seconds. Override it with `BI_SYNC_INTERVAL_MS`.

## Dashboard 1: System Usage Overview

Use these datasets:

```txt
bi_users
bi_conversations
system_usage_daily
chat_message_analytics
```

Recommended charts:

```txt
1. Total Users
Dataset: bi_users
Chart: Big Number
Metric: COUNT(*)

2. New Users By Day
Dataset: system_usage_daily
Chart: Time-series Bar Chart
Time column: report_date
Metric: SUM(new_users)

3. Conversations By Day
Dataset: system_usage_daily
Chart: Time-series Line Chart
Time column: report_date
Metric: SUM(new_conversations)

4. Messages By Day
Dataset: system_usage_daily
Chart: Time-series Bar Chart
Time column: report_date
Metrics: SUM(user_messages), SUM(assistant_messages)

5. Active vs Inactive Users
Dataset: bi_users
Chart: Pie Chart
Dimension: status
Metric: COUNT(*)
```

## Dashboard 2: Chatbot Performance Analytics

Use these datasets:

```txt
chat_message_analytics
chatbot_model_daily
```

Recommended charts:

```txt
1. Messages By Role
Dataset: chat_message_analytics
Chart: Pie Chart
Dimension: role
Metric: COUNT(*)

2. Model Usage
Dataset: chatbot_model_daily
Chart: Bar Chart
Dimension: model
Metric: SUM(assistant_responses)

3. Token Usage By Model
Dataset: chatbot_model_daily
Chart: Bar Chart
Dimension: model
Metric: SUM(total_tokens)

4. Token Usage Over Time
Dataset: chatbot_model_daily
Chart: Time-series Line Chart
Time column: report_date
Metric: SUM(total_tokens)
Series: model

5. Average Latency By Model
Dataset: chatbot_model_daily
Chart: Bar Chart
Dimension: model
Metric: AVG(avg_latency)

6. Cancelled Responses
Dataset: chatbot_model_daily
Chart: Big Number
Metric: SUM(cancelled_responses)
```

## Dashboard 3: Medical Safety Analytics

Use this dataset:

```txt
medical_safety_daily
```

Recommended charts:

```txt
1. Risk Level Distribution
Dataset: medical_safety_daily
Chart: Pie Chart
Dimension: risk_level
Metric: SUM(assistant_responses)

2. High Risk Cases Over Time
Dataset: medical_safety_daily
Chart: Time-series Bar Chart
Time column: report_date
Metric: SUM(high_risk_cases)

3. Intent Distribution
Dataset: medical_safety_daily
Chart: Bar Chart
Dimension: intent
Metric: SUM(assistant_responses)

4. Blocked Responses Over Time
Dataset: medical_safety_daily
Chart: Time-series Line Chart
Time column: report_date
Metric: SUM(blocked_responses)

5. Warnings Over Time
Dataset: medical_safety_daily
Chart: Time-series Line Chart
Time column: report_date
Metric: SUM(warning_count)

6. Source Usage
Dataset: medical_safety_daily
Chart: Big Number
Metric: SUM(source_count)
```

## Dashboard 4: AI Model Operations

Use this dataset:

```txt
ai_model_operations
```

Recommended charts:

```txt
1. Requests By Model
Dataset: ai_model_operations
Chart: Bar Chart
Dimension: model
Metric: SUM(requests)

2. Total Tokens By Model
Dataset: ai_model_operations
Chart: Bar Chart
Dimension: model
Metric: SUM(total_tokens)

3. Average Latency By Model
Dataset: ai_model_operations
Chart: Bar Chart
Dimension: model
Metric: AVG(avg_latency)

4. Average Completion Tokens
Dataset: ai_model_operations
Chart: Bar Chart
Dimension: model
Metric: AVG(avg_completion_tokens)

5. Cancelled Rate By Model
Dataset: ai_model_operations
Chart: Bar Chart
Dimension: model
Metric: AVG(cancelled_rate)

6. Model Maintenance Status
Dataset: ai_model_operations
Chart: Table
Columns: model, temperature, max_tokens, maintenance_mode
```

## Suggested Dashboard Layout

For each dashboard:

```txt
Top row: 2-3 Big Number charts
Middle row: time-series charts
Bottom row: distribution/table charts
```

This gives a clean BI presentation flow:

```txt
System usage -> Chatbot performance -> Medical safety -> Model operations
```
