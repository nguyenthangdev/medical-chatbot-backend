import axios from "axios";


// ─── Mock data phản hồi theo từ khóa ────────────────────────────────
const mockResponses = [
  {
    keywords: ['đau đầu', 'nhức đầu', 'đau nửa đầu'],
    response: 'Đau đầu có thể do nhiều nguyên nhân như căng thẳng, thiếu ngủ, mất nước. Bạn bị đau đầu bao lâu rồi? Có kèm theo triệu chứng nào khác như buồn nôn, chóng mặt không?'
  },
  {
    keywords: ['sốt', 'nóng', 'nhiệt độ'],
    response: 'Sốt là phản ứng tự nhiên của cơ thể khi chống lại nhiễm trùng. Bạn đang sốt bao nhiêu độ? Đã uống thuốc hạ sốt chưa? Nếu sốt trên 39°C kéo dài hơn 3 ngày, bạn nên đến gặp bác sĩ.'
  },
  {
    keywords: ['ho', 'ho khan', 'ho có đờm'],
    response: 'Ho có thể do cảm lạnh, viêm họng hoặc dị ứng. Bạn ho khan hay có đờm? Ho bao nhiêu ngày rồi? Có kèm sốt hoặc khó thở không?'
  },
  {
    keywords: ['đau bụng', 'đau dạ dày', 'buồn nôn', 'nôn'],
    response: 'Đau bụng có nhiều nguyên nhân. Cơn đau ở vị trí nào? Đau âm ỉ hay đau quặn? Có liên quan đến bữa ăn không? Nếu đau dữ dội hoặc kéo dài, nên đến cơ sở y tế ngay.'
  },
  {
    keywords: ['mất ngủ', 'khó ngủ', 'ngủ không được'],
    response: 'Mất ngủ ảnh hưởng nhiều đến sức khỏe. Bạn khó ngủ hay ngủ rồi hay thức giấc? Tình trạng này kéo dài bao lâu? Bạn có đang căng thẳng hoặc lo lắng điều gì không?'
  },
  {
    keywords: ['thuốc', 'uống thuốc', 'liều lượng'],
    response: 'Tôi có thể cung cấp thông tin chung về thuốc, nhưng liều lượng cụ thể cần theo chỉ định của bác sĩ hoặc dược sĩ. Bạn đang hỏi về loại thuốc nào?'
  },
  {
    keywords: ['trẻ em', 'trẻ con', 'bé', 'con tôi'],
    response: 'Với trẻ em, cần đặc biệt thận trọng hơn. Bé bao nhiêu tuổi? Triệu chứng xuất hiện từ khi nào? Nếu bé dưới 3 tháng tuổi có bất kỳ triệu chứng gì, nên đưa đến bác sĩ ngay.'
  },
]
 
const defaultResponse = 'Cảm ơn bạn đã chia sẻ. Để tôi có thể tư vấn chính xác hơn, bạn có thể mô tả chi tiết hơn về triệu chứng không? Triệu chứng xuất hiện từ bao giờ và có kèm theo dấu hiệu gì khác không?'
 
const getMockResponse = (message) => {
  const lower = message.toLowerCase()
  const matched = mockResponses.find((item) =>
    item.keywords.some((kw) => lower.includes(kw))
  )
  return matched?.response || defaultResponse
}

const AI_ENABLED = process.env.AI_SERVER_URL


const aiClient = axios.create({
  baseURL: process.env.AI_SERVER_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 60000, // AI xử lý lâu nên để 60s
});

// Tạo session mới
export const createSession = async (userId, model) => {
  // if (AI_ENABLED) {
  //   const { data } = await aiClient.post('/session/', { user_id: userId, model })
  //   return data
  // }
  return { session_id: `mock_session_${Date.now()}` }
};

// Gửi tin nhắn và nhận phản hồi từ AI
export const sendMessage = async (sessionId, message, model) => {
  // if (AI_ENABLED) {
  //   console.log("vao day")
  //   const { data } = await aiClient.post('/chat/', {
  //     session_id: sessionId,
  //     message,
  //     model,
  //     temperature: 0.7,
  //   })
  //   return data
  // }
 
  // MOCK — delay 1s giả lập AI xử lý
  await new Promise((r) => setTimeout(r, 1000))
  return {
    response: getMockResponse(message),
    model_used: 'mock-model',
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