import { chatClientService } from '../../services/Client/ai.service.js'
import { ConversationModel } from '../../models/conversation.model.js'
import { MessageModel } from '../../models/message.model.js'
import { createSession, aiClient } from '../../services/Client/ai.service.js'
import { SettingModel } from "../../models/setting.model.js"
import mongoose from 'mongoose'

export const createConversation = async (req, res) => {
  try {
    const { userId, model = 'qwen-7b' } = req.body
    console.log("reqBody: ", req.body)
    if (!userId) return res.status(400).json({ error: 'userId là bắt buộc' })

    const aiData = await createSession(userId, model)
    console.log("aiData: ",aiData)
    const conversation = await ConversationModel.create({
      userId,
      model,
      aiSessionId: aiData.session_id,
      title: 'Cuộc hội thoại mới',
    })

    res.status(201).json({
      conversationId: conversation._id,
      aiSessionId: aiData.session_id,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, message, model = 'qwen-7b' } = req.body
    if (!conversationId || !message) return res.status(400).json({ error: 'Thiếu dữ liệu' })

    const conversation = await ConversationModel.findById(conversationId)
    if (!conversation) return res.status(404).json({ error: 'Không tìm thấy conversation' })

    const baseModelName = model.split('-')[0].toLowerCase(); 
    const config = await SettingModel.findOne({ modelName: baseModelName });
    const maxTokensLimit = config ? config.maxTokens : 2000;
    const isMaintenance = config ? config.maintenanceMode : false;

    if (isMaintenance) {
      return res.json({ response: `⚠️ **Bảo trì:** Mô hình ${baseModelName.toUpperCase()} đang được bảo trì.` });
    }
    // const lastMessage = await MessageModel.findOne({ conversationId }).sort({ createdAt: -1 });
    // const currentUsedTokens = lastMessage?.tokens?.token_remaining || 0;
    const result = await MessageModel.aggregate([
      { $match: { conversationId: new mongoose.Types.ObjectId(conversationId), role: 'assistant' } },
      { $group: { _id: null, totalUsed: { $sum: "$tokens.total_tokens" } } }
    ]);
    const currentUsedTokens = result[0]?.totalUsed || 0;

    if (currentUsedTokens >= maxTokensLimit) {
      return res.json({ 
        response: `🚫 **Hết hạn mức:** Phiên này đã hết hạn sử dụng. Hãy tạo cuộc hội thoại mới.` 
      });
    }
    await MessageModel.create({ 
      conversationId, 
      role: 'user', 
      content: message 
    });
    await ConversationModel.findByIdAndUpdate(conversationId, {
      title: message.substring(0, 40) + (message.length > 40 ? '...' : ''),
    });
    const userId = req.user._id
    const aiData = await chatClientService.sendMessage(conversation.aiSessionId, message, model, userId, maxTokensLimit)
    // Lưu phản hồi AI
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
        token_remaining: aiData.token_remaining
      },
      audio_url: aiData.audio_url,
      latency: aiData.latency_ms
    })
    

    // Cập nhật title nếu là tin nhắn đầu tiên
    const count = await MessageModel.countDocuments({ conversationId })
    if (count <= 2) {
      await ConversationModel.findByIdAndUpdate(conversationId, {
        title: message.substring(0, 50),
      })
    }

    res.json({ 
      response: aiData.answer, 
      model_used: aiData.model_used, 
      intent: aiData.intent,
      risk_level: aiData.risk_level,
      confidence: aiData.confidence,
      blocked: aiData.blocked,
      warnings: aiData.warnings,
      sources: aiData.rag_sources,
      prompt_tokens: aiData.prompt_tokens,
      completion_tokens: aiData.completion_tokens,
      total_tokens: aiData.total_tokens,
      audio_url: aiData.audio_url,
      token_remaining: aiData.token_remaining,
      latency: aiData.latency_ms
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getConversations = async (req, res) => {
  try {
    const { userId } = req.params
    const conversations = await ConversationModel.find({ 
      userId, 
      deleted: { $ne: true } 
    }).sort({ updatedAt: -1 }).lean()
    res.json(conversations)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const messages = await MessageModel.find({ 
      conversationId,
      deleted: { $ne: true } 
    }).sort({ createdAt: 1 }).lean()
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params
    await ConversationModel.findByIdAndUpdate(conversationId, { deleted: true })
    await MessageModel.updateMany({ conversationId }, { deleted: true })
    res.json({ message: 'Đã xóa thành công hội thoại' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const renameConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;
    await ConversationModel.findByIdAndUpdate(conversationId, { title });
    res.json({ message: 'Đã đổi tên thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAllConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversations = await ConversationModel.find({ userId });
    const convIds = conversations.map(c => c._id);
    
    await ConversationModel.updateMany({ userId }, { deleted: true });
    await MessageModel.updateMany({ conversationId: { $in: convIds } }, { deleted: true });
    
    res.json({ message: 'Đã xóa thành công toàn bộ lịch sử  tin nhắn'  });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sttController = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const formData = new FormData();
    formData.append('file', req.file.buffer, { filename: req.file.originalname });
    
    const response = await aiClient.post('/api/stt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    res.json({ text: response.data.text });
  } catch (error) {
    res.status(500).json({ error: 'STT failed', details: error.message });
  }
};

export const ttsController = async (req, res) => {
  try {
    const { text } = req.body;
    const response = await aiClient.post('/api/tts', { text }, { responseType: 'blob' });
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: 'TTS failed' });
  }
};

// POST /api/v1/chat/message-stream
export const streamMessage = async (req, res) => {
  console.log("req.body from streamMessage: ", req.body)
  const { conversationId, message, model = 'qwen-7b' } = req.body;
  
  // Giả định bạn có middleware xác thực nhét thông tin user vào req.user
  const userId = req.user?._id; 
  console.log("userId from streamMessage: ", userId)
  // Bật công tắc Header SSE (Server-Sent Events)
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); 

  // Giao việc cho Service
  await chatClientService.streamMessageFromAI(
    userId,
    conversationId,
    message,
    model,
    // Callback 1: Có chữ mới -> Write xuống Frontend
    (chunk) => {
      res.write(chunk);
    },
    // Callback 2: Khi AI nói xong -> Đóng kết nối
    () => {
      res.end();
    },
    // Callback 3: Lỗi thì báo lỗi
    (error) => {
      res.write(`data: [ERROR]\n\n`);
      res.end();
    }
  );
};

export const chatController = {
  createConversation,
  sendMessage,
  getConversations,
  getMessages,
  deleteConversation,
  sttController,
  ttsController,
  streamMessage,
  renameConversation,
  deleteAllConversations
};