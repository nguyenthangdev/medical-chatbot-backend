import axios from "axios";
import mongoose from 'mongoose';
import { MessageModel } from '../../models/message.model.js'; 
import { ConversationModel } from "../../models/conversation.model.js";
import { SettingModel } from "../../models/setting.model.js";

const aiClient = axios.create({
  baseURL: process.env.AI_SERVER_URL,
  headers: { 
    "Content-Type": "application/json",
    "X-API-Key": process.env.AI_API_KEY
  },
  timeout: 120000, 
});

const normalizeTranscript = (text = '') => text
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/đ/g, 'd')
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const isNoSpeechHallucination = (text = '') => {
  const normalizedText = normalizeTranscript(text);
  if (!normalizedText) return false;

  const knownHallucinations = [
    'hay subscribe cho kenh ghien mi go de khong bo lo nhung video hap dan'
  ];
  const promotionalOutroPattern = /^hay subscribe cho kenh .+ de khong bo lo nhung video hap dan$/;

  return promotionalOutroPattern.test(normalizedText)
    || knownHallucinations.some((phrase) => normalizedText === phrase || normalizedText.includes(phrase));
};

const createSession = async (userId, model = 'qwen-7b') => {
  return { session_id: `session_${userId}_${Date.now()}` };
};

const createNewConversation = async (userId, model) => {
  const aiData = await createSession(userId, model);
  const conversation = await ConversationModel.create({
    userId,
    model,
    aiSessionId: aiData.session_id,
    title: 'Cuộc hội thoại mới',
    tokenWindowStartedAt: new Date(),
  });
  return { conversationId: conversation._id, aiSessionId: aiData.session_id };
};

const normalizePositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getTokenQuotaState = async ({ conversation, conversationId, maxTokensLimit, refillIntervalMinutes }) => {
  const now = new Date();
  const fallbackWindowStart = conversation.tokenWindowStartedAt || conversation.createdAt || now;
  const refillMs = refillIntervalMinutes * 60 * 1000;
  let tokenWindowStartedAt = fallbackWindowStart;

  if (now.getTime() - tokenWindowStartedAt.getTime() >= refillMs) {
    tokenWindowStartedAt = now;
    await ConversationModel.findByIdAndUpdate(conversationId, { tokenWindowStartedAt });
  } else if (!conversation.tokenWindowStartedAt) {
    await ConversationModel.findByIdAndUpdate(conversationId, { tokenWindowStartedAt });
  }

  const result = await MessageModel.aggregate([
    {
      $match: {
        conversationId: new mongoose.Types.ObjectId(conversationId),
        role: 'assistant',
        createdAt: { $gte: tokenWindowStartedAt }
      }
    },
    { $group: { _id: null, totalUsed: { $sum: "$tokens.total_tokens" } } }
  ]);
  const usedTokens = result[0]?.totalUsed || 0;
  const resetAt = new Date(tokenWindowStartedAt.getTime() + refillMs);

  return {
    usedTokens,
    remainingTokens: Math.max(maxTokensLimit - usedTokens, 0),
    tokenWindowStartedAt,
    resetAt,
    refillIntervalMinutes,
  };
};

const sendMessage = async (sessionId, message, model = 'qwen-7b', userId, maxTokensLimit) => {
  try {
    const response = await aiClient.post('/api/v1/chat', {
      user_id: userId, 
      message,
      session_id: sessionId
    });
    return {
      answer: response.data.answer,
      session_id: response.data.session_id,
      model_used: model,
      intent: response.data.intent,
      risk_level: response.data.risk_level,
      confidence: response.data.confidence,
      blocked: response.data.blocked,
      warnings: response.data.warnings,
      rag_sources: response.data.rag_sources || [],
      prompt_tokens: response.data.prompt_tokens,
      completion_tokens: response.data.completion_tokens,
      total_tokens: response.data.total_tokens,
      audio_url: response.data.audio_url,
      token_remaining: response.data.token_remaining,
      latency_ms: response.data.latency_ms
    };
  } catch (error) {
    console.error('AI service error:', error.response?.data || error.message);
    return {
      answer: "Lỗi hệ thống, vui lòng thử lại sau.",
      session_id: sessionId,
      intent: 'general',
      risk_level: 'low',
      confidence: "high",
      blocked: false,
      warnings: [],
      sources: []
    };
  }
};

const processAndSaveMessage = async (userId, conversationId, message, model) => {
  const conversation = await ConversationModel.findById(conversationId);
  if (!conversation) throw new Error('NOT_FOUND_CONVERSATION');

  // Kiểm tra cấu hình và Maintenance
  const baseModelName = model.split('-')[0].toLowerCase(); 
  const config = await SettingModel.findOne({ modelName: baseModelName });
  const maxTokensLimit = normalizePositiveInteger(config?.maxTokens, 2000);
  const refillIntervalMinutes = normalizePositiveInteger(config?.tokenRefillIntervalMinutes, 30);
  const isMaintenance = config ? config.maintenanceMode : false;

  if (isMaintenance) {
    return { type: 'MAINTENANCE', response: `⚠️ **Bảo trì:** Mô hình ${baseModelName.toUpperCase()} đang được bảo trì.` };
  }

  // Kiểm tra giới hạn Token trong cửa sổ quota hiện tại. Hết thời gian refill thì quota tự về lại maxTokens.
  const quotaState = await getTokenQuotaState({
    conversation,
    conversationId,
    maxTokensLimit,
    refillIntervalMinutes,
  });

  if (quotaState.usedTokens >= maxTokensLimit) {
    const waitMinutes = Math.max(1, Math.ceil((quotaState.resetAt.getTime() - Date.now()) / 60000));
    return {
      type: 'LIMIT_EXCEEDED',
      response: `🚫 **Hết hạn mức:** Phiên này đã dùng hết ${maxTokensLimit} token. Bạn có thể tiếp tục chat sau khoảng ${waitMinutes} phút.`,
      tokenQuota: {
        maxTokens: maxTokensLimit,
        usedTokens: quotaState.usedTokens,
        remainingTokens: 0,
        resetAt: quotaState.resetAt,
        refillIntervalMinutes: quotaState.refillIntervalMinutes,
        waitMinutes,
      },
    };
  }

  // Lưu tin nhắn User và cập nhật tiêu đề tạm
  await MessageModel.create({ conversationId, role: 'user', content: message });
  await ConversationModel.findByIdAndUpdate(conversationId, {
    title: message.substring(0, 40) + (message.length > 40 ? '...' : ''),
  });

  // Gọi AI
  const aiData = await sendMessage(conversation.aiSessionId, message, model, userId, maxTokensLimit);
  const totalTokens = normalizePositiveInteger(aiData.total_tokens, 0);
  const tokenRemaining = Number.isFinite(Number(aiData.token_remaining))
    ? Number(aiData.token_remaining)
    : Math.max(quotaState.remainingTokens - totalTokens, 0);

  // Lưu tin nhắn Assistant
  await MessageModel.create({
    conversationId,
    role: 'assistant',
    content: aiData.answer,
    model: aiData.model_used,
    intent: aiData.intent,
    risk_level: aiData.risk_level,
    confidence: aiData.confidence,
    blocked: aiData.blocked,
    warnings: aiData.warnings,
    sources: aiData.rag_sources,
    tokens: {
      prompt_tokens: aiData.prompt_tokens,
      completion_tokens: aiData.completion_tokens,
      total_tokens: aiData.total_tokens,
      token_remaining: tokenRemaining
    },
    audio_url: aiData.audio_url,
    latency: aiData.latency_ms
  });

  // Chốt title nếu là những câu đầu
  const count = await MessageModel.countDocuments({ conversationId });
  if (count <= 2) {
    await ConversationModel.findByIdAndUpdate(conversationId, { title: message.substring(0, 50) });
  }

  return {
    type: 'SUCCESS',
    aiData: {
      ...aiData,
      token_remaining: tokenRemaining,
    },
  };
};

const getConversationsList = async (userId) => {
  return await ConversationModel.find({ 
    userId, 
    deleted: { $ne: true },
    status: { $ne: 'inactive' }
  }).sort({ updatedAt: -1 }).lean();
};

const getMessagesList = async (conversationId) => {
  return await MessageModel.find({ 
    conversationId,
    deleted: { $ne: true },
    status: { $ne: 'inactive' }
  }).sort({ createdAt: 1 }).lean();
};

const deleteConversation = async (conversationId) => {
  await ConversationModel.findByIdAndUpdate(conversationId, { status: 'inactive' });
  await MessageModel.updateMany({ conversationId }, { status: 'inactive' });
  return true;
};

const renameConversation = async (conversationId, title) => {
  await ConversationModel.findByIdAndUpdate(conversationId, { title });
  return true;
};

const deleteAllConversations = async (userId) => {
  const conversations = await ConversationModel.find({ userId });
  const convIds = conversations.map(c => c._id);
  
  await ConversationModel.updateMany({ userId }, { status: 'inactive' });
  await MessageModel.updateMany({ conversationId: { $in: convIds } }, { status: 'inactive' });
  return true;
};

const cancelChatSession = async (userId, conversationId) => {
  let aiSessionId = null;
  if (conversationId) {
    const conversation = await ConversationModel.findOne({
      _id: conversationId, userId, deleted: { $ne: true }, status: { $ne: 'inactive' }
    });
    aiSessionId = conversation?.aiSessionId || null;
  }

  const response = await aiClient.post('/api/v1/chat/cancel', {
    user_id: String(userId),
    session_id: aiSessionId
  });
  return response.data;
};

const processSTT = async (fileBuffer, mimetype, originalname) => {
  const formData = new FormData();
  const audioBlob = new Blob([fileBuffer], { type: mimetype || 'audio/webm' });
  formData.append('file', audioBlob, originalname || 'audio.webm');
  
  const aiServerUrl = process.env.AI_SERVER_URL;
  const response = await fetch(`${aiServerUrl}/api/stt`, {
    method: 'POST',
    headers: { "X-API-Key": process.env.AI_API_KEY || "" },
    body: formData
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'STT failed');
  if (isNoSpeechHallucination(data.text)) return { ...data, text: '' };
  return data;
};

const processTTS = async (userId, conversationId, text) => {
  const response = await aiClient.post('/api/tts', null, { params: { text } });
  const audioUrl = response.data?.audio_url;
  const aiServerUrl = process.env.AI_SERVER_URL;
  const fullAudioUrl = audioUrl?.startsWith('http') ? audioUrl : `${aiServerUrl}${audioUrl}`;

  if (conversationId) {
    const conversation = await ConversationModel.findOne({
      _id: conversationId, userId, deleted: { $ne: true }, status: { $ne: 'inactive' }
    });

    if (conversation) {
      await MessageModel.findOneAndUpdate(
        { conversationId, role: 'assistant', content: text },
        { audio_url: fullAudioUrl },
        { sort: { createdAt: -1 } }
      );
    }
  }
  return fullAudioUrl;
};

const streamMessageFromAI = async (userId, conversationId, message, model, onChunk, onEnd, onError) => {
  try {
    const aiResponse = await aiClient.post('/api/v1/chat', {
        user_id: userId,
        session_id: conversationId,
        message: message,
        stream: true
    }, { responseType: 'stream' });

    let fullAnswer = "";
    let buffer = ""; 
    aiResponse.data.setEncoding('utf8');
    aiResponse.data.on('data', (chunk) => {
      onChunk(chunk);
      buffer += chunk;
      const parts = buffer.split('\n\n');
      buffer = parts.pop(); 

      for (const part of parts) {
        if (part.startsWith('data: ')) {
          const token = part.slice(6); 
          if (token !== '[DONE]') fullAnswer += token; 
        }
      }
    });

    aiResponse.data.on('end', async () => {
      if (buffer.startsWith('data: ')) {
         const token = buffer.slice(6);
         if (token !== '[DONE]') fullAnswer += token;
      }
      await MessageModel.create({ conversationId, role: 'assistant', content: fullAnswer, model: model });
      onEnd();
    });

  } catch (error) {
    console.error("Lỗi stream AI chi tiết:", error.response?.data || error.message);
    onError(error);
  }
};

export const chatService = { 
  createNewConversation,
  processAndSaveMessage,
  getConversationsList,
  getMessagesList,
  cancelChatSession,
  processSTT,
  processTTS,
  streamMessageFromAI, 
  sendMessage, 
  deleteConversation, 
  renameConversation, 
  deleteAllConversations 
};
