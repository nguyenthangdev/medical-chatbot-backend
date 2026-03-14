// back-end/src/controllers/chatController.js
import * as aiService from '../../services/Client/ai.service.js'
import { ConversationModel } from '../../models/conversation.model.js'
import { MessageModel } from '../../models/message.model.js'

// POST /api/v1/chat/conversation — Tạo conversation mới
export const createConversation = async (req, res) => {
  try {
    const { userId, model = 'qwen-7b' } = req.body
    console.log("reqBody: ", req.body)
    if (!userId) return res.status(400).json({ error: 'userId là bắt buộc' })

    const aiData = await aiService.createSession(userId, model)
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

// POST /api/v1/chat/message — Gửi tin nhắn, lưu cả 2 chiều vào DB
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, message, model = 'qwen-7b' } = req.body
    if (!conversationId || !message)
      return res.status(400).json({ error: 'conversationId và message là bắt buộc' })

    const conversation = await ConversationModel.findById(conversationId)
        console.log('💬 Conversation found:', conversation) // ← thêm dòng này

    if (!conversation)
      return res.status(404).json({ error: 'Không tìm thấy conversation' })

    // Lưu tin nhắn user
    await MessageModel.create({ conversationId, role: 'user', content: message })

    // Gọi AI server
    const startTime = Date.now()
    const aiData = await aiService.sendMessage(conversation.aiSessionId, message, model)
    console.log("aiDATA: ", sendMessage)
    const latency = `${Date.now() - startTime}ms`

    // Lưu phản hồi AI
    await MessageModel.create({
      conversationId,
      role: 'assistant',
      content: aiData.response,
      model: aiData.model_used,
      latency,
    })

    // Cập nhật title nếu là tin nhắn đầu tiên
    const count = await MessageModel.countDocuments({ conversationId })
    if (count <= 2) {
      await ConversationModel.findByIdAndUpdate(conversationId, {
        title: message.substring(0, 50),
      })
    }

    res.json({ response: aiData.response, model_used: aiData.model_used, latency })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/v1/chat/conversations/:userId — Danh sách conversations (sidebar)
export const getConversations = async (req, res) => {
  try {
    const { userId } = req.params
    const conversations = await ConversationModel.find({ userId }).sort({ updatedAt: -1 }).lean()
    res.json(conversations)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// GET /api/v1/chat/messages/:conversationId — Lịch sử messages
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params
    const messages = await MessageModel.find({ conversationId }).sort({ createdAt: 1 }).lean()
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// DELETE /api/v1/chat/conversation/:conversationId — Xóa conversation + messages
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params
    await MessageModel.deleteMany({ conversationId })
    await ConversationModel.findByIdAndDelete(conversationId)
    res.json({ message: 'Đã xóa conversation' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Thêm vào cuối chat.controller.js
export const sttController = async (req, res) => {
  try {
    console.log('📁 File nhận được:', req.file) 
    const text = await aiService.speechToText(req.file?.buffer)
    console.log("text:", text)
    res.json({ text })
  } catch (err) {
    console.error('❌ STT Error:', err.message) // ← xem lỗi cụ thể
    res.status(500).json({ error: err.message })
  }
}