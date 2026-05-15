<div align="center">

# 🧩 Medical Chatbot Node Back-end

**REST API gateway cho hệ thống Medical Chatbot, xử lý xác thực, phân quyền, quản trị dữ liệu, chat và tích hợp BI/AI.**

![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

## 📌 Mô tả ngắn

`back-end` là Node.js API server cho nền tảng Medical Chatbot. Service này đóng vai trò gateway giữa front-end, MongoDB, hệ thống BI và AI server. Back-end quản lý authentication, authorization, user/account/role, conversation, message, upload file, cấu hình hệ thống và dữ liệu dashboard.

---

## 🖼️ Demo / Preview

```txt
API Base URL:       http://localhost:5000
Client API Prefix:  /api/v1
Admin API Prefix:   /api/admin/v1
AI Server URL:      http://localhost:8000
Superset URL:       http://localhost:8088
```

---

## ✨ Tính năng

- Xác thực client và admin bằng JWT.
- Refresh token và cookie-based session.
- Phân quyền admin theo role/permission.
- Quản lý user, account, role, permission.
- Quản lý conversation và message.
- API chat kết nối sang AI server.
- Upload file qua Cloudinary.
- Tích hợp BI database và Apache Superset.
- Script đồng bộ dữ liệu BI, tạo view, dataset và dashboard.
- Validate request bằng Joi.
- Chuẩn bị nền tảng cho realtime với Socket.IO.

---

## 🧰 Tech Stack

| Nhóm | Công nghệ |
|---|---|
| Runtime | Node.js, ES Modules |
| Framework | Express 5 |
| Database | MongoDB, Mongoose |
| BI Database | PostgreSQL client (`pg`) |
| Auth | JWT, Cookie Parser, bcrypt/bcryptjs |
| Validation | Joi |
| Upload | Multer, Cloudinary |
| Realtime | Socket.IO |
| HTTP Client | Axios |
| Dev Tools | Nodemon, Cross Env |

---

## 📁 Cấu trúc project

```txt
back-end/
├── src/
│   ├── config/
│   │   ├── database.js          # Kết nối MongoDB
│   │   ├── cloudinary.js        # Cấu hình Cloudinary
│   │   └── biDatabase.js        # Kết nối BI database
│   ├── controllers/
│   │   ├── Admin/               # Controller cho admin
│   │   ├── Client/              # Controller cho client
│   │   └── General/             # Controller dùng chung
│   ├── helpers/                 # Pagination, search, slug...
│   ├── middlewares/
│   │   ├── Admin/               # Auth + permission middleware
│   │   └── Client/              # Client auth middleware
│   ├── models/                  # Mongoose models
│   ├── providers/               # JWT provider
│   ├── routes/
│   │   ├── Admin/v1/
│   │   ├── Admin/v2/
│   │   ├── Client/v1/
│   │   └── General/
│   ├── scripts/                 # BI setup/sync scripts
│   ├── services/
│   │   ├── Admin/
│   │   └── Client/
│   ├── sockets/
│   ├── validations/
│   └── server.js                # Entry point
├── .env.example
├── package.json
├── yarn.lock
└── README.md
```

---

## ⚙️ Cài đặt

### Yêu cầu môi trường

- Node.js 20+
- Yarn 1.x
- MongoDB local hoặc MongoDB Atlas
- AI server nếu dùng chức năng chat AI
- PostgreSQL và Superset nếu dùng BI dashboard

### Cài dependencies

```bash
cd back-end
yarn install
```

---

## 🔐 Biến môi trường (`.env`)

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

| Biến | Ví dụ | Mô tả |
|---|---|---|
| `PORT` | `5000` | Port chạy Express API. |
| `MONGODB_URI` | `mongodb://localhost:27017/medical-chatbot` | URI kết nối MongoDB. |
| `JWT_SECRET` | `change_me` | Secret JWT dùng chung nếu cần. |
| `JWT_ACCESS_TOKEN_SECRET_ADMIN` | `change_me_admin_access` | Secret tạo access token cho admin. |
| `JWT_REFRESH_TOKEN_SECRET_ADMIN` | `change_me_admin_refresh` | Secret tạo refresh token cho admin. |
| `JWT_ACCESS_TOKEN_SECRET_CLIENT` | `change_me_client_access` | Secret tạo access token cho client. |
| `JWT_REFRESH_TOKEN_SECRET_CLIENT` | `change_me_client_refresh` | Secret tạo refresh token cho client. |
| `AI_SERVER_URL` | `http://localhost:8000` | URL của AI/FastAPI server. |
| `BI_DATABASE_URL` | `postgresql://user:pass@localhost:5432/db` | Kết nối database phục vụ BI. |
| `SUPERSET_URL` | `http://localhost:8088` | URL Apache Superset. |
| `SUPERSET_USERNAME` | `admin` | Tài khoản Superset. |
| `SUPERSET_PASSWORD` | `admin` | Mật khẩu Superset. |
| `SUPERSET_EMBED_ALLOWED_DOMAINS` | `http://localhost:5173,http://127.0.0.1:5173` | Domain được phép nhúng dashboard. |
| `SUPERSET_DASHBOARD_SYSTEM` | `2` | ID dashboard hệ thống. |
| `SUPERSET_DASHBOARD_CHATBOT` | `3` | ID dashboard chatbot. |
| `SUPERSET_DASHBOARD_SAFETY` | `4` | ID dashboard safety. |
| `SUPERSET_DASHBOARD_MODELS` | `5` | ID dashboard models. |

Ví dụ tối thiểu:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medical-chatbot
JWT_SECRET=change_me
JWT_ACCESS_TOKEN_SECRET_ADMIN=change_me_admin_access
JWT_REFRESH_TOKEN_SECRET_ADMIN=change_me_admin_refresh
JWT_ACCESS_TOKEN_SECRET_CLIENT=change_me_client_access
JWT_REFRESH_TOKEN_SECRET_CLIENT=change_me_client_refresh
AI_SERVER_URL=http://localhost:8000
```

> 🔒 **Security Note**  
> Không commit file `.env` thật lên Git. Hãy rotate token/secret nếu thông tin từng bị public.

---

## 🚀 Chạy local

### 1. Chạy MongoDB

```bash
mongod
```

Hoặc cấu hình `MONGODB_URI` trỏ tới MongoDB Atlas.

### 2. Chạy AI server

Nếu dùng chức năng chat AI, khởi động project `healthcare-system-backend` tại port `8000`.

### 3. Chạy Node API

```bash
cd back-end
yarn dev
```

Server sẽ chạy tại:

```txt
http://localhost:5000
```

---

## 🏭 Build production

Project hiện chạy trực tiếp từ source ES Modules:

```bash
cd back-end
BUILD_MODE=production node ./src/server.js
```

Gợi ý chạy bằng PM2:

```bash
pm2 start src/server.js --name medical-chatbot-api
```

> ⚠️ **Note**  
> Script `build` hiện chưa tạo bundle production hoàn chỉnh. Nếu cần build artifact riêng, nên bổ sung pipeline bằng Babel, SWC hoặc chạy trực tiếp bằng Node.js như hiện tại.

---

## 🔌 Cấu hình API

### Client API

```txt
/api/v1
├── /auth
├── /my-profile
└── /chat
```

### Admin API

```txt
/api/admin/v1
├── /auth
├── /my-profile
├── /users
├── /conversations
├── /messages
├── /accounts
├── /upload
├── /settings
├── /roles
└── /bi
```

### Luồng kiến trúc

```txt
React Front-end
    │
    ▼
Express Back-end
    │
    ├── MongoDB
    ├── Cloudinary
    ├── PostgreSQL / BI Database
    ├── Apache Superset
    └── FastAPI AI Server
            ├── Medical RAG
            ├── LLM
            ├── STT
            └── TTS
```

---

## 📊 BI / Superset

Các script hỗ trợ BI:

```bash
yarn bi:sync
yarn bi:views
yarn bi:superset
yarn bi:dashboards
```

Mục đích:

- `bi:sync`: đồng bộ dữ liệu phục vụ phân tích.
- `bi:views`: tạo/cập nhật database views.
- `bi:superset`: cấu hình dataset trên Superset.
- `bi:dashboards`: cấu hình dashboard Superset.

---

## 🚢 Deployment

Có thể deploy lên:

- VPS + PM2
- Render
- Railway
- Fly.io
- Docker host

Checklist production:

- Cấu hình `.env` production.
- Dùng MongoDB Atlas hoặc MongoDB server được bảo mật.
- Bật HTTPS ở reverse proxy.
- Cấu hình CORS theo domain front-end thật.
- Dùng JWT secret mạnh và riêng cho từng môi trường.
- Bảo vệ cookie bằng cấu hình secure/sameSite phù hợp.
- Không expose Superset credential.
- Theo dõi log, memory và error rate.

---

## 🧪 Kiểm tra chất lượng

```bash
yarn lint
```

---

## 🗺️ Roadmap

- [ ] Chuẩn hóa script production build.
- [ ] Bổ sung OpenAPI/Swagger documentation cho Express API.
- [ ] Thêm unit test cho service và middleware.
- [ ] Thêm integration test cho auth, role, chat.
- [ ] Hoàn thiện realtime chat bằng Socket.IO hoặc SSE.
- [ ] Chuẩn hóa error response toàn hệ thống.
- [ ] Bổ sung audit log cho admin actions.
- [ ] Thêm Dockerfile và Docker Compose.

---

## 📄 License

MIT License.
