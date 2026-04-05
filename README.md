# ShopeeFake

Monorepo mẫu cho ứng dụng thương mại điện tử: **Backend** (Node.js + Express + Prisma) và **Frontend** (React + Vite).

## Yêu cầu

- [Node.js](https://nodejs.org/) 20 trở lên (khuyến nghị LTS)
- npm (đi kèm Node)

## Cấu trúc thư mục

```
ShopeeFake/
├── backend/          # API REST, Prisma ORM, SQLite (dev)
├── frontend/         # SPA React + Vite
└── README.md
```

## Database

- **SQLite** file `backend/prisma/dev.db` (tạo sau khi chạy migration).
- Bảng: **User**, **Product**, **Order**, **OrderItem** (OrderItem liên kết đơn hàng với sản phẩm và số lượng).

Đổi chuỗi kết nối trong `backend/.env` (xem `backend/.env.example`).

## Chạy project (development)

### 1. Backend

```bash
cd backend
copy .env.example .env
npm install
npx prisma migrate deploy
npm run dev
```

*(Trên macOS/Linux: `cp .env.example .env`.)*

API mặc định: [http://localhost:3001](http://localhost:3001)

- `GET /` — JSON Hello World
- `GET /api/health` — kiểm tra kết nối database

### 2. Frontend

Mở terminal mới:

```bash
cd frontend
npm install
npm run dev
```

Giao diện: [http://localhost:5173](http://localhost:5173) — màn hình **Hello World** và trạng thái API/DB (proxy `/api` → backend).

## Lệnh hữu ích (backend)

| Lệnh | Mô tả |
|------|--------|
| `npm run dev` | Chạy API với hot reload (tsx) |
| `npm run db:migrate` | Tạo/áp migration khi đổi `schema.prisma` |
| `npm run db:studio` | Mở Prisma Studio quản lý dữ liệu |

## Build production

**Backend:** `cd backend && npm run build && npm start`  
**Frontend:** `cd frontend && npm run build` — thư mục `frontend/dist` để deploy tĩnh.

## SCRUM-8 — Tiêu chí nghiệm thu

- [x] Source code Backend và Frontend trong repo.
- [x] Hello World chạy trên localhost (frontend + API).
- [x] Database có schema User, Product, Order (và OrderItem), kết nối qua Prisma.
- [x] README hướng dẫn chạy project.
