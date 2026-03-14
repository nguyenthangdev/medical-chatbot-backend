import axios from "axios";

const aiClient = axios.create({
  baseURL: process.env.AI_SERVER_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 60000, // AI xử lý lâu nên để 60s
});

// Tạo session mới
export const createSession = async (userId, model) => {
  // const { data } = await aiClient.post("/session/", {
  //   user_id: userId,
  //   model,
  // });
  // return data; // { session_id, user_id }
  return { session_id: `mock_session_${Date.now()}` }
};

// Gửi tin nhắn và nhận phản hồi từ AI
export const sendMessage = async (sessionId, message, model) => {
//   const { data } = await aiClient.post("/chat/", {
//     session_id: sessionId,
//     message,
//     model,
//     temperature: 0.7,
//   });
//   return data; // { response, model_used }
  await new Promise(r => setTimeout(r, 1000)); // giả lập delay
  return {
    response: `[MOCK] Đây là phản hồi giả cho: "${message}"`,
    model_used: model,
  };
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