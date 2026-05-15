import { chatService } from '../../services/Client/chat.service.js';

const createConversation = async (req, res) => {
  try {
    const { userId, model = 'qwen-7b' } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId là bắt buộc' });

    const result = await chatService.createNewConversation(userId, model);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { conversationId, message, model = 'qwen-7b' } = req.body;
    if (!conversationId || !message) return res.status(400).json({ error: 'Thiếu dữ liệu' });

    const userId = req.user._id;
    const result = await chatService.processAndSaveMessage(userId, conversationId, message, model);

    if (result.type === 'MAINTENANCE' || result.type === 'LIMIT_EXCEEDED') {
      return res.json({ response: result.response });
    }

    const aiData = result.aiData;
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
    });
  } catch (err) {
    if (err.message === 'NOT_FOUND_CONVERSATION') {
      return res.status(404).json({ error: 'Không tìm thấy conversation' });
    }
    res.status(500).json({ error: err.message });
  }
};

const getConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await chatService.getConversationsList(userId);
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await chatService.getMessagesList(conversationId);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    await chatService.deleteConversation(conversationId);
    res.json({ code: 200, message: 'Đã xóa thành công hội thoại' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const renameConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;
    await chatService.renameConversation(conversationId, title);
    res.json({ code: 200, message: 'Đã đổi tên thành công' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteAllConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    await chatService.deleteAllConversations(userId);
    res.json({ code: 200, message: 'Đã xóa thành công toàn bộ lịch sử tin nhắn' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancelChat = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.user._id;
    const data = await chatService.cancelChatSession(userId, conversationId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Cancel failed', details: error.response?.data || error.message });
  }
};

const sttController = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const data = await chatService.processSTT(req.file.buffer, req.file.mimetype, req.file.originalname);
    res.json({ text: data.text });
  } catch (error) {
    res.status(500).json({ error: 'STT failed', details: error.message });
  }
};

const ttsController = async (req, res) => {
  try {
    const { text, conversationId } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Text is required' });

    const audio_url = await chatService.processTTS(req.user._id, conversationId, text);
    res.json({ audio_url });
  } catch (error) {
    res.status(500).json({ error: 'TTS failed', details: error.response?.data || error.message });
  }
};

const streamMessage = async (req, res) => {
  const { conversationId, message, model = 'qwen-7b' } = req.body;
  const userId = req.user?._id; 

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); 

  await chatService.streamMessageFromAI(
    userId,
    conversationId,
    message,
    model,
    (chunk) => { res.write(chunk); },
    () => { res.end(); },
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
  deleteAllConversations,
  cancelChat
};