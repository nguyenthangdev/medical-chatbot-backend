drop view if exists ai_model_operations;
drop view if exists medical_safety_daily;
drop view if exists chatbot_model_daily;
drop view if exists system_usage_daily;
drop view if exists chat_message_analytics;

create table if not exists bi_users (
  user_id text primary key,
  full_name text,
  sex text,
  year_of_birth integer,
  status text,
  deleted boolean not null default false,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create table if not exists bi_conversations (
  conversation_id text primary key,
  user_id text,
  title text,
  model text,
  status text,
  deleted boolean not null default false,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create table if not exists bi_messages (
  message_id text primary key,
  conversation_id text,
  role text,
  model text,
  intent text,
  risk_level text,
  confidence text,
  blocked boolean not null default false,
  warning_count integer not null default 0,
  source_count integer not null default 0,
  prompt_tokens integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens integer not null default 0,
  token_remaining integer,
  latency integer,
  content_length integer not null default 0,
  is_cancelled boolean not null default false,
  has_audio boolean not null default false,
  status text,
  deleted boolean not null default false,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create table if not exists bi_settings (
  model_name text primary key,
  temperature numeric,
  max_tokens integer,
  maintenance_mode boolean not null default false,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
);

create index if not exists idx_bi_conversations_user_id
  on bi_conversations (user_id);

create index if not exists idx_bi_conversations_created_at
  on bi_conversations (created_at);

create index if not exists idx_bi_messages_conversation_id
  on bi_messages (conversation_id);

create index if not exists idx_bi_messages_created_at
  on bi_messages (created_at);

create index if not exists idx_bi_messages_role
  on bi_messages (role);

create index if not exists idx_bi_messages_model
  on bi_messages (model);

alter table bi_messages
  alter column confidence type text
  using confidence::text;
