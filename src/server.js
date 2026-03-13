import express from 'express';
import 'dotenv/config'; 
import mongoose from 'mongoose'; 
import cors from 'cors'; // 1. Import thư viện cors
import { APIs_V1 } from './routes/Admin/v1/index.js'; 

const app = express();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI; 

// 2. Kích hoạt CORS cho phép Frontend gọi API
// Dùng app.use(cors()) mặc định sẽ cho phép mọi origin gọi đến
// app.use(cors());

// (Tùy chọn nâng cao) Nếu muốn bảo mật hơn, bạn giới hạn chỉ cho Frontend ở port 5173 gọi:
// app.use(cors({ origin: 'http://localhost:5173' }));
const allowedOrigins = [
  'http://localhost:5173',
].filter(Boolean) // Loại bỏ undefined

app.use(cors({
  origin: allowedOrigins, // FE origin
  credentials: true, // Cho phép gửi cookie từ FE
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],     // Các phương thức HTTP được phép
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']   // Cho phép các header cần thiết
}))

app.use(express.json());

// Đăng ký sử dụng toàn bộ API phiên bản v1
app.use('/api/v1', APIs_V1);

app.get('/', (req, res) => {
  res.send('Hello from the medical chatbot backend!');
});

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully!');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1); 
  });