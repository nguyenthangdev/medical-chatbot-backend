import 'dotenv/config';
import mongoose from 'mongoose';
import { biPool } from '../config/biDatabase.js';
import { UserModel } from '../models/user.model.js';
import { ConversationModel } from '../models/conversation.model.js';
import { MessageModel } from '../models/message.model.js';
import { SettingModel } from '../models/setting.model.js';

const STOPPED_RESPONSE_MESSAGE = 'Đã dừng câu trả lời đang chạy.';

const toDate = (value) => {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
};

const toId = (value) => {
  if (!value) return null;
  return String(value);
};

const toInteger = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : fallback;

  const parsed = Number.parseInt(String(value).replace(/[^\d-]/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableInteger = (value) => {
  if (value === null || value === undefined || value === '') return null;
  return toInteger(value, null);
};

const requireEnv = (name) => {
  if (!process.env[name]) {
    throw new Error(`Missing required env: ${name}`);
  }
};

const syncUsers = async () => {
  const users = await UserModel.find().lean();

  for (const user of users) {
    await biPool.query(
      `
      insert into bi_users (
        user_id,
        full_name,
        sex,
        year_of_birth,
        status,
        deleted,
        created_at,
        updated_at
      )
      values ($1,$2,$3,$4,$5,$6,$7,$8)
      on conflict (user_id) do update set
        full_name = excluded.full_name,
        sex = excluded.sex,
        year_of_birth = excluded.year_of_birth,
        status = excluded.status,
        deleted = excluded.deleted,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at
      `,
      [
        toId(user._id),
        user.fullName || null,
        user.sex || null,
        user.yearOfBirth || null,
        user.status || null,
        Boolean(user.deleted),
        toDate(user.createdAt),
        toDate(user.updatedAt),
      ]
    );
  }

  console.log(`Synced users: ${users.length}`);
};

const syncConversations = async () => {
  const conversations = await ConversationModel.find().lean();

  for (const conversation of conversations) {
    await biPool.query(
      `
      insert into bi_conversations (
        conversation_id,
        user_id,
        title,
        model,
        status,
        deleted,
        created_at,
        updated_at
      )
      values ($1,$2,$3,$4,$5,$6,$7,$8)
      on conflict (conversation_id) do update set
        user_id = excluded.user_id,
        title = excluded.title,
        model = excluded.model,
        status = excluded.status,
        deleted = excluded.deleted,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at
      `,
      [
        toId(conversation._id),
        toId(conversation.userId),
        conversation.title || null,
        conversation.model || null,
        conversation.status || null,
        Boolean(conversation.deleted),
        toDate(conversation.createdAt),
        toDate(conversation.updatedAt),
      ]
    );
  }

  console.log(`Synced conversations: ${conversations.length}`);
};

const syncMessages = async () => {
  const messages = await MessageModel.find().lean();

  for (const message of messages) {
    const warnings = Array.isArray(message.warnings) ? message.warnings : [];
    const sources = Array.isArray(message.sources) ? message.sources : [];
    const content = message.content || '';

    await biPool.query(
      `
      insert into bi_messages (
        message_id,
        conversation_id,
        role,
        model,
        intent,
        risk_level,
        confidence,
        blocked,
        warning_count,
        source_count,
        prompt_tokens,
        completion_tokens,
        total_tokens,
        token_remaining,
        latency,
        content_length,
        is_cancelled,
        has_audio,
        status,
        deleted,
        created_at,
        updated_at
      )
      values (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
        $12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
      )
      on conflict (message_id) do update set
        conversation_id = excluded.conversation_id,
        role = excluded.role,
        model = excluded.model,
        intent = excluded.intent,
        risk_level = excluded.risk_level,
        confidence = excluded.confidence,
        blocked = excluded.blocked,
        warning_count = excluded.warning_count,
        source_count = excluded.source_count,
        prompt_tokens = excluded.prompt_tokens,
        completion_tokens = excluded.completion_tokens,
        total_tokens = excluded.total_tokens,
        token_remaining = excluded.token_remaining,
        latency = excluded.latency,
        content_length = excluded.content_length,
        is_cancelled = excluded.is_cancelled,
        has_audio = excluded.has_audio,
        status = excluded.status,
        deleted = excluded.deleted,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at
      `,
      [
        toId(message._id),
        toId(message.conversationId),
        message.role || null,
        message.model || null,
        message.intent || null,
        message.risk_level || null,
        message.confidence || null,
        Boolean(message.blocked),
        warnings.length,
        sources.length,
        toInteger(message.tokens?.prompt_tokens),
        toInteger(message.tokens?.completion_tokens),
        toInteger(message.tokens?.total_tokens),
        toNullableInteger(message.tokens?.token_remaining),
        toNullableInteger(message.latency),
        content.length,
        Boolean(message.isCancelled) || content === STOPPED_RESPONSE_MESSAGE,
        Boolean(message.audio_url),
        message.status || null,
        Boolean(message.deleted),
        toDate(message.createdAt),
        toDate(message.updatedAt),
      ]
    );
  }

  console.log(`Synced messages: ${messages.length}`);
};

const syncSettings = async () => {
  const settings = await SettingModel.find().lean();

  for (const setting of settings) {
    await biPool.query(
      `
      insert into bi_settings (
        model_name,
        temperature,
        max_tokens,
        maintenance_mode,
        created_at,
        updated_at
      )
      values ($1,$2,$3,$4,$5,$6)
      on conflict (model_name) do update set
        temperature = excluded.temperature,
        max_tokens = excluded.max_tokens,
        maintenance_mode = excluded.maintenance_mode,
        created_at = excluded.created_at,
        updated_at = excluded.updated_at
      `,
      [
        setting.modelName,
        setting.temperature ?? null,
        toNullableInteger(setting.maxTokens),
        Boolean(setting.maintenanceMode),
        toDate(setting.createdAt),
        toDate(setting.updatedAt),
      ]
    );
  }

  console.log(`Synced settings: ${settings.length}`);
};

const main = async () => {
  try {
    requireEnv('MONGODB_URI');
    requireEnv('BI_DATABASE_URL');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    await syncUsers();
    await syncConversations();
    await syncMessages();
    await syncSettings();

    console.log('BI sync completed.');
  } catch (error) {
    console.error('BI sync failed:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
    await biPool.end().catch(() => {});
  }
};

main();
