import axios from "axios";
import { MessageModel } from '../../models/message.model.js'; // Nhớ check lại đường dẫn cho chuẩn với cấu trúc thư mục của bạn nhé

// ─── Mock data phản hồi theo từ khóa ────────────────────────────────
// const mockResponses = [
//   {
//     keywords: ['đau đầu', 'nhức đầu', 'đau nửa đầu'],
//     response: 'Đau đầu có thể do nhiều nguyên nhân như căng thẳng, thiếu ngủ, mất nước. Bạn bị đau đầu bao lâu rồi? Có kèm theo triệu chứng nào khác như buồn nôn, chóng mặt không?'
//   },
//   {
//     keywords: ['sốt', 'nóng', 'nhiệt độ'],
//     response: 'Sốt là phản ứng tự nhiên của cơ thể khi chống lại nhiễm trùng. Bạn đang sốt bao nhiêu độ? Đã uống thuốc hạ sốt chưa? Nếu sốt trên 39°C kéo dài hơn 3 ngày, bạn nên đến gặp bác sĩ.'
//   },
//   {
//     keywords: ['ho', 'ho khan', 'ho có đờm'],
//     response: 'Ho có thể do cảm lạnh, viêm họng hoặc dị ứng. Bạn ho khan hay có đờm? Ho bao nhiêu ngày rồi? Có kèm sốt hoặc khó thở không?'
//   },
//   {
//     keywords: ['đau bụng', 'đau dạ dày', 'buồn nôn', 'nôn'],
//     response: 'Đau bụng có nhiều nguyên nhân. Cơn đau ở vị trí nào? Đau âm ỉ hay đau quặn? Có liên quan đến bữa ăn không? Nếu đau dữ dội hoặc kéo dài, nên đến cơ sở y tế ngay.'
//   },
//   {
//     keywords: ['mất ngủ', 'khó ngủ', 'ngủ không được'],
//     response: 'Mất ngủ ảnh hưởng nhiều đến sức khỏe. Bạn khó ngủ hay ngủ rồi hay thức giấc? Tình trạng này kéo dài bao lâu? Bạn có đang căng thẳng hoặc lo lắng điều gì không?'
//   },
//   {
//     keywords: ['thuốc', 'uống thuốc', 'liều lượng'],
//     response: 'Tôi có thể cung cấp thông tin chung về thuốc, nhưng liều lượng cụ thể cần theo chỉ định của bác sĩ hoặc dược sĩ. Bạn đang hỏi về loại thuốc nào?'
//   },
//   {
//     keywords: ['trẻ em', 'trẻ con', 'bé', 'con tôi'],
//     response: 'Với trẻ em, cần đặc biệt thận trọng hơn. Bé bao nhiêu tuổi? Triệu chứng xuất hiện từ khi nào? Nếu bé dưới 3 tháng tuổi có bất kỳ triệu chứng gì, nên đưa đến bác sĩ ngay.'
//   },
// ]
 
// const defaultResponse = 'Cảm ơn bạn đã chia sẻ. Để tôi có thể tư vấn chính xác hơn, bạn có thể mô tả chi tiết hơn về triệu chứng không? Triệu chứng xuất hiện từ bao giờ và có kèm theo dấu hiệu gì khác không?'
 
// const getMockResponse = (message) => {
//   const lower = message.toLowerCase()
//   const matched = mockResponses.find((item) =>
//     item.keywords.some((kw) => lower.includes(kw))
//   )
//   return matched?.response || defaultResponse
// }

export const aiClient = axios.create({
  baseURL: process.env.AI_SERVER_URL || "http://localhost:8000",
  headers: { 
    "Content-Type": "application/json",
    "X-API-Key": process.env.AI_API_KEY || "key-webapp-abc123"
  },
  timeout: 60000, // AI xử lý lâu nên để 60s
});

// Tạo session mới
export const createSession = async (userId, model = 'qwen-7b') => {
  // AI server tự động tạo session khi gọi predict lần đầu
  return { session_id: `session_${userId}_${Date.now()}` };
};

// Gửi tin nhắn và nhận phản hồi từ AI
export const sendMessage = async (sessionId, message, model = 'qwen-7b', userId) => {
  try {
    const response = await aiClient.post('/api/v1/chat', {
      user_id: userId, 
      message,
      session_id: sessionId
      // enable_tts: false  // hoặc true nếu cần TTS
    });
    console.log("response from chat ai: ", response)
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
    // Fallback to mock
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

// Lấy lịch sử chat theo session
export const getChatHistory = async (sessionId) => {
  const { data } = await aiClient.get(`/chat/${sessionId}`);
  return data;
};

// Xóa session
export const deleteSession = async (sessionId) => {
  const { data } = await aiClient.delete(`/session/${sessionId}`);
  return data;
};

// Mock STT — giả lập chuyển audio thành text
export const speechToText = async (audioBlob) => {
  // if (AI_ENABLED) {
  //   const formData = new FormData()
  //   formData.append('file', audioBlob, 'audio.webm')
  //   const { data } = await aiClient.post('/stt/', formData)
  //   return data.text
  // }

  // MOCK — giả lập delay nhận dạng giọng nói
  await new Promise((r) => setTimeout(r, 800))

  // Trả về ngẫu nhiên 1 trong các câu mẫu
  const mockTexts = [
    'Tôi bị đau đầu mấy ngày nay',
    'Con tôi bị sốt cao',
    'Tôi ho khan kéo dài 1 tuần',
    'Tôi bị đau bụng buổi sáng',
    'Tôi mất ngủ liên tục',
  ]
  return mockTexts[Math.floor(Math.random() * mockTexts.length)]
}

export const streamMessageFromAI = async (userId, conversationId, message, model, onChunk, onEnd, onError) => {
  try {
    const aiResponse = await aiClient.post('/api/v1/chat', {
        user_id: userId,
        session_id: conversationId,
        message: message,
        stream: true
    }, {
        responseType: 'stream' // <--- Nhớ kẹp thêm cái option stream này
    });

    let fullAnswer = "";
    let buffer = ""; // Dùng buffer để đề phòng gói tin bị cắt làm đôi khi truyền qua mạng
    aiResponse.data.setEncoding('utf8');
    aiResponse.data.on('data', (chunk) => {
      // const chunkStr = chunk.toString('utf8');
      
      // 1. Bắn trực tiếp gói tin gốc (data: ... \n\n) xuống cho Controller đẩy về React
      onChunk(chunk);

      // 2. Gom vào buffer để Backend bóc tách và lưu Database
      buffer += chunk;
      const parts = buffer.split('\n\n');
      
      // Giữ lại phần tử cuối cùng (có thể là một gói tin bị đứt dở) trong buffer
      buffer = parts.pop(); 

      for (const part of parts) {
        if (part.startsWith('data: ')) {
          const token = part.slice(6); // Cắt bỏ chữ "data: "
          if (token !== '[DONE]') {
            fullAnswer += token; // Ghép dần các chữ cái thành câu hoàn chỉnh
          }
        }
      }
    });

    aiResponse.data.on('end', async () => {
      // Xử lý nốt chữ cuối cùng nếu còn sót lại trong buffer
      if (buffer.startsWith('data: ')) {
         const token = buffer.slice(6);
         if (token !== '[DONE]') fullAnswer += token;
      }

      // 3. Tự động lưu tin nhắn vào Database khi đã nói xong
      await MessageModel.create({
        conversationId,
        role: 'assistant',
        content: fullAnswer,
        model: model
      });

      // 4. Báo cho Controller biết luồng đã kết thúc
      onEnd();
    });

  } catch (error) {
    console.error("Lỗi stream AI chi tiết:", error.response?.data || error.message);
    onError(error);
  }
};

export const chatClientService = { streamMessageFromAI, sendMessage };