import express from 'express';
import 'dotenv/config'; 
import mongoose from 'mongoose'; 
import cors from 'cors';
import { APIs_V1 as adminRoutes } from './routes/Admin/v1/index.js'; 
import { APIs_V1 as clientRoutes } from './routes/Client/v1/index.js';
import cookieParser from 'cookie-parser';
const app = express();
const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI; 

const allowedOrigins = [
  'http://localhost:5173',
].filter(Boolean) // Loại bỏ undefined

app.use(cors({
  origin: allowedOrigins, // FE origin
  credentials: true, // Cho phép gửi cookie từ FE
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],     // Các phương thức HTTP được phép
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']   // Cho phép các header cần thiết
}))

app.use(cookieParser()); // Để giải mã cookie
app.use(express.json());

app.use('/api/v1', adminRoutes);
app.use('/api/v1', clientRoutes);

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