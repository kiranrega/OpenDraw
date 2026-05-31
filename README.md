# OpenDraw 🎨

A **real-time collaborative drawing application** built with modern web technologies. Multiple users can simultaneously draw, create rooms, and collaborate on digital canvases with live updates via WebSockets.

## 🌟 Features

- **Real-time Collaboration** — Multiple users drawing simultaneously on shared canvases
- **Room Management** — Create, join, and delete collaborative drawing rooms
- **User Authentication** — Secure JWT-based auth with password hashing (bcrypt)
- **Rate Limiting** — Protected against brute-force attacks
- **Responsive Design** — Beautiful UI with animations using Framer Motion
- **Type-Safe** — 100% TypeScript across frontend and backend
- **Monorepo Setup** — Shared packages for types, UI components, and configs using Turborepo

## 🏗️ Architecture

OpenDraw follows a **monorepo architecture** with separate frontend, HTTP backend, and WebSocket backend:

```
┌─────────────────┐
│    Frontend     │ (Next.js + React)
│  (Port 3000)    │
└────────┬────────┘
         │
         ├─────────────────────────┐
         │                         │
    ┌────▼────────┐         ┌─────▼──────────┐
    │ HTTP Backend│         │  WS Backend    │
    │(Port 3001)  │         │  (Port 3002)   │
    └────┬────────┘         └─────┬──────────┘
         │                         │
         └────────────┬────────────┘
                      │
              ┌───────▼────────┐
              │   PostgreSQL   │
              │   Database     │
              └────────────────┘
```

### Data Flow

1. **Authentication** → HTTP Backend (JWT tokens)
2. **Room Management** → HTTP Backend (CRUD operations)
3. **Real-time Drawing** → WebSocket Backend (live shape sync)
4. **Persistence** → Database stores users, rooms, and chat history

## 📦 Tech Stack

### Frontend
- **Next.js 16** — React framework with TypeScript
- **Framer Motion** — Smooth animations and page transitions
- **Axios** — HTTP client for API calls
- **Tailwind CSS** — Utility-first CSS framework
- **Lucide Icons** — Beautiful icon library

### HTTP Backend
- **Express 5** — Lightweight Node.js web server
- **JWT (jsonwebtoken)** — Secure token-based authentication
- **bcrypt** — Password hashing and verification
- **Zod** — TypeScript-first schema validation
- **express-rate-limit** — Rate limiting middleware
- **CORS** — Cross-origin request handling

### WebSocket Backend
- **ws** — WebSocket server for real-time communication
- **jsonwebtoken** — Token validation for WS connections

### Database & ORM
- **PostgreSQL** — Relational database
- **Prisma** — Modern ORM with type-safe queries

### Monorepo & Development
- **Turborepo** — Monorepo orchestration and build caching
- **pnpm** — Fast package manager with workspace support
- **TypeScript** — Static type checking
- **ESLint** — Code linting
- **Prettier** — Code formatting

## 📂 Project Structure

```
OpenDraw/
├── apps/
│   ├── frontend/                 # Next.js client application
│   │   ├── app/                  # App router (pages)
│   │   │   ├── dashboard/        # Room management UI
│   │   │   ├── canvas/[roomId]/  # Drawing canvas
│   │   │   ├── signin/           # Auth page
│   │   │   └── signup/           # Registration page
│   │   ├── components/           # React components
│   │   ├── draw/                 # Drawing utilities & HTTP client
│   │   ├── hooks/                # Custom React hooks (auth, screen size)
│   │   └── config.ts             # Frontend configuration
│   │
│   ├── http-backend/             # Express REST API
│   │   └── src/
│   │       ├── index.ts          # Main server & routes
│   │       └── auth/
│   │           └── auth.ts       # JWT middleware
│   │
│   └── ws-backend/               # WebSocket server
│       └── src/
│           └── index.ts          # WebSocket server & handlers
│
├── packages/
│   ├── common/                   # Shared TypeScript types
│   │   └── src/
│   │       └── types.ts          # Zod schemas & interfaces
│   │
│   ├── db/                       # Prisma database setup
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # Database schema
│   │   │   └── migrations/       # Migration history
│   │   └── src/
│   │       └── index.ts          # Prisma client export
│   │
│   ├── ui/                       # Shared React components
│   │   └── src/
│   │       ├── button.tsx        # UI component library
│   │       ├── card.tsx
│   │       ├── code.tsx
│   │       ├── iconButton.tsx
│   │       └── index.tsx
│   │
│   ├── backend-common/           # Shared backend utilities
│   ├── eslint-config/            # ESLint configurations
│   └── typescript-config/        # TypeScript configurations
│
├── pnpm-workspace.yaml           # Workspace configuration
├── turbo.json                    # Turborepo configuration
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** 9.0.0+ ([install](https://pnpm.io/installation))
- **PostgreSQL** (local or remote database)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OpenDraw
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create `.env` files in the appropriate directories:

   **Root `.env`** (for database):
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/opendraw"
   ```

   **`apps/http-backend/.env`**:
   ```env
   JWT_SECRET="your-secret-key-min-32-chars-long"
   ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001"
   DATABASE_URL="postgresql://user:password@localhost:5432/opendraw"
   NODE_ENV="development"
   ```

   **`apps/ws-backend/.env`**:
   ```env
   JWT_SECRET="your-secret-key-min-32-chars-long"
   WS_PORT=3002
   NODE_ENV="development"
   ```

   **`apps/frontend/.env.local`**:
   ```env
   NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
   NEXT_PUBLIC_WS_URL="ws://localhost:3002"
   ```

4. **Initialize the database**
   ```bash
   pnpm exec prisma migrate deploy
   ```

### Running the Project

#### Development Mode (All services)

```bash
pnpm dev
```

This starts all three services concurrently:
- **Frontend** → http://localhost:3000
- **HTTP Backend** → http://localhost:3001
- **WebSocket Backend** → ws://localhost:3002

#### Development Mode (Individual services)

```bash
# Frontend only
pnpm dev --filter=frontend

# HTTP Backend only
pnpm dev --filter=http-backend

# WebSocket Backend only
pnpm dev --filter=ws-backend
```

#### Production Build

```bash
# Build all packages and apps
pnpm build

# Start HTTP Backend
cd apps/http-backend && pnpm start

# Start WebSocket Backend (in another terminal)
cd apps/ws-backend && pnpm start

# Start Frontend (in another terminal)
cd apps/frontend && pnpm start
```

## 📡 API Documentation

### Authentication Endpoints

#### POST `/signup`
Register a new user.

```json
Request:
{
  "username": "string (3-50 chars)",
  "email": "string (valid email)",
  "password": "string (8+ chars, mixed case, number, special char)"
}

Response (201):
{
  "message": "Successfully signed up",
  "userId": "integer"
}
```

#### POST `/signin`
Authenticate and get JWT token.

```json
Request:
{
  "email": "string",
  "password": "string"
}

Response (200):
{
  "token": "jwt-token-string"
}
```

#### POST `/logout`
Client-side logout confirmation (clears token locally).

### Room Management Endpoints (Authenticated)

#### POST `/createroom`
Create a new collaborative room.

```json
Request:
{
  "slug": "string (room name, must be unique)",
  "description": "string (optional)"
}

Response (201):
{
  "message": "room created",
  "room": {
    "id": "integer",
    "slug": "string",
    "adminId": "integer",
    "createdAt": "timestamp"
  }
}
```

#### POST `/deleteroom`
Delete a room (admin only).

```json
Request:
{
  "roomId": "integer"
}

Response (200):
{
  "message": "room deleted successfully"
}
```

#### GET `/room/:slug`
Fetch room details.

```
Response (200):
{
  "room": {
    "id": "integer",
    "slug": "string",
    "adminId": "integer"
  }
}
```

#### GET `/chats/:roomId`
Fetch drawing history for a room (last 50 messages).

```
Response (200):
{
  "messages": [
    {
      "id": "integer",
      "roomId": "integer",
      "message": "shape-json-string",
      "createdAt": "timestamp"
    }
  ]
}
```

### Authentication Headers

All authenticated endpoints require:
```
Authorization: Bearer <jwt-token>
```

## 🔌 WebSocket Events

### Connection

```javascript
const ws = new WebSocket('ws://localhost:3002?token=<jwt-token>');
```

### Client → Server Events

#### `join_room`
Join a collaborative room.

```json
{
  "type": "join_room",
  "roomId": 1
}
```

#### `draw`
Send shape data to be drawn.

```json
{
  "type": "draw",
  "roomId": 1,
  "shape": {
    "id": "uuid",
    "type": "path|circle|rectangle|line",
    "x": 100,
    "y": 100,
    "color": "#000000",
    "strokeWidth": 2,
    "points": [[0,0], [10,10]]
  }
}
```

### Server → Client Events

#### `shapes_update`
Broadcast of new shapes from other users.

```json
{
  "type": "shapes_update",
  "shape": { /* shape object */ }
}
```

#### `connection_confirmed`
Confirmation of successful room join.

```json
{
  "type": "connection_confirmed",
  "roomId": 1,
  "message": "Connected to room"
}
```

## 🔐 Security Features

✅ **JWT Authentication** — Secure token-based auth with 7-day expiration  
✅ **Password Hashing** — bcrypt with salt rounds = 10  
✅ **Rate Limiting** — 20 attempts per 15 minutes on auth endpoints  
✅ **CORS Protection** — Whitelist allowed origins  
✅ **Input Validation** — Zod schema validation on all endpoints  
✅ **Trust Proxy** — Configured for production deployments  
✅ **Authorization Checks** — Room admin verification before deletion  

## 🛠️ Development Commands

```bash
# Build all apps and packages
pnpm build

# Run type checking
pnpm check-types

# Lint code
pnpm lint

# Format code with Prettier
pnpm format

# Run dev server with Turbo watch
pnpm dev

# Clean build artifacts
pnpm clean
```

## 📝 Database Migrations

Create a new migration:
```bash
pnpm exec prisma migrate dev --name migration_name
```

Deploy migrations to production:
```bash
pnpm exec prisma migrate deploy
```

View database:
```bash
pnpm exec prisma studio
```

## 🐛 Troubleshooting

### "Connection refused" error
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`

### "Trust proxy" warning
- Set `app.set('trust proxy', 1)` in HTTP backend (already done)
- Required when behind reverse proxy (e.g., Render)

### WebSocket connection fails
- Check WS_URL matches backend port
- Verify JWT token is being sent
- Ensure firewall allows WebSocket connections

### Port already in use
```bash
# Kill process on port (macOS/Linux)
lsof -ti :3000 | xargs kill -9

# Or use different ports in .env files
```

### Token expired
- Frontend automatically clears expired tokens
- User is redirected to `/signin`
- New token issued on successful re-login

## 📦 Deployment

### Deploying to Render

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Create Render services**:
   - Frontend → Static site (from `apps/frontend`)
   - HTTP Backend → Web service (from `apps/http-backend`)
   - WebSocket Backend → Web service (from `apps/ws-backend`)

3. **Set environment variables** in each service's settings

4. **Update frontend config** with production URLs

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📄 License

MIT License — Feel free to use this project for personal and commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 👤 Author

Kiran — Full-stack developer

---

**Built with ❤️ using Next.js, Express, WebSockets, and PostgreSQL**
