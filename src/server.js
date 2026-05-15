import express from 'express';
import 'dotenv/config'; 
import cors from 'cors';
import { APIs_V1 as adminRoutes } from './routes/Admin/v1/index.js'; 
import { APIs_V1 as clientRoutes } from './routes/Client/v1/index.js';
import cookieParser from 'cookie-parser';
import * as database from './config/database.js';
import { roleService } from './services/Admin/role.service.js';

database.connect();
await roleService.seedAdminRole();

const app = express();
const port = process.env.PORT;

const allowedOrigins = [
  'http://localhost:5173'
].filter(Boolean) // Loại bỏ undefined

app.use(cors({
  origin: allowedOrigins, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],    
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control']
}))

app.use(cookieParser());
app.use(express.json());

app.use(`/api/admin/v1`, adminRoutes);
app.use('/api/v1', clientRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})