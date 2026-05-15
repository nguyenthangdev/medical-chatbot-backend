create or replace view chat_message_analytics as
select
  m.message_id,
  m.conversation_id,
  c.user_id,
  u.sex,
  u.year_of_birth,
  m.role,
  coalesce(m.model, c.model) as model,
  m.intent,
  m.risk_level,
  m.confidence,
  m.blocked,
  m.warning_count,
  m.source_count,
  m.prompt_tokens,
  m.completion_tokens,
  m.total_tokens,
  m.token_remaining,
  m.latency,
  m.content_length,
  m.is_cancelled,
  m.has_audio,
  m.created_at,
  m.updated_at
from bi_messages m
left join bi_conversations c
  on c.conversation_id = m.conversation_id
left join bi_users u
  on u.user_id = c.user_id
where m.deleted = false
  and coalesce(m.status, 'active') = 'active';

create or replace view system_usage_daily as
select
  d.day::date as report_date,
  coalesce(new_users, 0) as new_users,
  coalesce(new_conversations, 0) as new_conversations,
  coalesce(total_messages, 0) as total_messages,
  coalesce(user_messages, 0) as user_messages,
  coalesce(assistant_messages, 0) as assistant_messages
from (
  select generate_series(
    least(
      coalesce((select min(created_at)::date from bi_users), current_date),
      coalesce((select min(created_at)::date from bi_conversations), current_date),
      coalesce((select min(created_at)::date from bi_messages), current_date)
    ),
    current_date,
    interval '1 day'
  ) as day
) d
left join (
  select created_at::date as day, count(*) as new_users
  from bi_users
  where deleted = false
  group by created_at::date
) u on u.day = d.day::date
left join (
  select created_at::date as day, count(*) as new_conversations
  from bi_conversations
  where deleted = false
  group by created_at::date
) c on c.day = d.day::date
left join (
  select
    created_at::date as day,
    count(*) as total_messages,
    count(*) filter (where role = 'user') as user_messages,
    count(*) filter (where role = 'assistant') as assistant_messages
  from bi_messages
  where deleted = false
  group by created_at::date
) m on m.day = d.day::date;

create or replace view chatbot_model_daily as
select
  created_at::date as report_date,
  coalesce(model, 'unknown') as model,
  count(*) filter (where role = 'assistant') as assistant_responses,
  count(*) filter (where role = 'user') as user_messages,
  sum(total_tokens) as total_tokens,
  avg(nullif(latency, 0)) as avg_latency,
  sum(case when is_cancelled then 1 else 0 end) as cancelled_responses,
  avg(nullif(completion_tokens, 0)) as avg_completion_tokens
from chat_message_analytics
group by created_at::date, coalesce(model, 'unknown');

create or replace view medical_safety_daily as
select
  created_at::date as report_date,
  coalesce(risk_level, 'unknown') as risk_level,
  coalesce(intent, 'unknown') as intent,
  count(*) filter (where role = 'assistant') as assistant_responses,
  count(*) filter (where risk_level = 'high') as high_risk_cases,
  count(*) filter (where blocked = true) as blocked_responses,
  sum(warning_count) as warning_count,
  sum(source_count) as source_count
from chat_message_analytics
where role = 'assistant'
group by created_at::date, coalesce(risk_level, 'unknown'), coalesce(intent, 'unknown');

create or replace view ai_model_operations as
select
  coalesce(a.model, s.model_name, 'unknown') as model,
  count(a.message_id) filter (where a.role = 'assistant') as requests,
  sum(a.total_tokens) as total_tokens,
  avg(nullif(a.latency, 0)) as avg_latency,
  avg(nullif(a.completion_tokens, 0)) as avg_completion_tokens,
  sum(case when a.is_cancelled then 1 else 0 end) as cancelled_responses,
  case
    when count(a.message_id) filter (where a.role = 'assistant') = 0 then 0
    else sum(case when a.is_cancelled then 1 else 0 end)::numeric
      / count(a.message_id) filter (where a.role = 'assistant')
  end as cancelled_rate,
  max(s.temperature) as temperature,
  max(s.max_tokens) as max_tokens,
  bool_or(coalesce(s.maintenance_mode, false)) as maintenance_mode
from chat_message_analytics a
full outer join bi_settings s
  on s.model_name = a.model
group by coalesce(a.model, s.model_name, 'unknown');
