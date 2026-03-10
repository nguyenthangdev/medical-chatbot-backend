import express from 'express';
import 'dotenv/config'; // 1. Tự động load các biến môi trường từ file .env
import mongoose from 'mongoose'; // 2. Import mongoose để kết nối DB
import { APIs_V1 } from './routes/v1/index.js'; // 3. Import các route API của bạn

const app = express();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI; // Lấy URI kết nối từ biến môi trường

app.use(express.json());

// Đăng ký sử dụng toàn bộ API phiên bản v1
app.use('/api/v1', APIs_V1);

app.get('/', (req, res) => {
  res.send('Hello from the medical chatbot backend!');
});

// 4. Bọc hàm listen bên trong block kết nối Database thành công
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
    // Chỉ khi kết nối DB thành công mới cho server lắng nghe request
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); // Dừng ứng dụng nếu không kết nối được DB
  });