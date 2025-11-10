# CryptoPulse AI Intelligence Dashboard 🚀

> **Real-time cryptocurrency market insights powered by AI**

A production-ready MVP that combines real-time market data with AI-generated insights, featuring automatic asset detection, WebSocket updates, and a beautiful dark-themed responsive UI.

## ✨ Features

### Core Functionality
- 🤖 **AI-Generated Insights** - GPT-4 powered market analysis with sentiment scoring
- 📊 **Real-Time Price Updates** - Live price feeds via Binance WebSocket
- 🎯 **Intelligent Asset Detection** - Automatic cryptocurrency mention highlighting
- 💬 **Interactive Asset Badges** - Hover for detailed price information
- 📈 **Top Movers Dashboard** - Track gainers, losers, and most volatile assets
- 🔄 **WebSocket Streaming** - Sub-100ms latency for price updates

### Technical Highlights
- ⚡ **Next.js 14** with App Router and React Server Components
- 🎨 **Tailwind CSS** with custom dark theme and animations
- 🏪 **Zustand** for lightweight state management
- 🔌 **Socket.io** for bidirectional real-time communication
- 🚄 **Fastify** high-performance backend
- 🗄️ **PostgreSQL + Prisma** for data persistence
- 📦 **Redis** for caching and pub/sub
- 🐳 **Docker Compose** for local development
- 📱 **Fully Responsive** mobile-first design

## 🏗️ Architecture

```
cryptopulse-mvp/
├── apps/
│   ├── backend/              # Fastify API Server
│   │   ├── src/
│   │   │   ├── config/       # Database & Redis config
│   │   │   ├── services/     # Business logic
│   │   │   │   ├── market-data.service.ts    # Binance WebSocket
│   │   │   │   ├── ai-insights.service.ts    # OpenAI integration
│   │   │   │   └── websocket.service.ts      # Socket.io server
│   │   │   ├── routes/       # API endpoints
│   │   │   ├── utils/        # Asset detector & formatters
│   │   │   └── index.ts      # Main server
│   │   └── prisma/           # Database schema
│   │
│   └── frontend/             # Next.js 14 Application
│       ├── app/              # App router pages
│       ├── components/       # React components
│       │   ├── dashboard/    # Dashboard components
│       │   ├── ui/           # Reusable UI components
│       │   └── providers/    # Context providers
│       ├── hooks/            # Custom React hooks
│       ├── stores/           # Zustand stores
│       └── lib/              # Utilities & API client
│
├── docker-compose.yml        # Container orchestration
└── pnpm-workspace.yaml       # Monorepo configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 8.0.0
- **Docker** >= 24.0.0 (optional, but recommended)
- **OpenAI API Key** (for AI insights)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cryptopulse-mvp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   **Backend** (`apps/backend/.env`):
   ```env
   DATABASE_URL=postgresql://admin:secure_password@localhost:5432/cryptopulse
   REDIS_URL=redis://:secure_redis_password@localhost:6379
   OPENAI_API_KEY=sk-your-openai-api-key-here
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend** (`apps/frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_WS_URL=ws://localhost:3001
   ```

4. **Start infrastructure (PostgreSQL + Redis)**
   ```bash
   docker-compose up -d postgres redis
   ```

5. **Run database migrations**
   ```bash
   cd apps/backend
   pnpm prisma:migrate
   pnpm prisma:generate
   cd ../..
   ```

6. **Start development servers**

   **Option A: All services at once**
   ```bash
   pnpm dev
   ```

   **Option B: Individual services**
   ```bash
   # Terminal 1 - Backend
   pnpm dev:backend

   # Terminal 2 - Frontend
   pnpm dev:frontend
   ```

7. **Access the application**
   - 🌐 **Frontend**: http://localhost:3000
   - 🔌 **Backend API**: http://localhost:3001
   - ❤️ **Health Check**: http://localhost:3001/health

## 🐳 Docker Deployment

### Full Stack with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Individual Service Commands

```bash
# Backend only
docker-compose up -d postgres redis backend

# Frontend only
docker-compose up -d frontend

# Rebuild specific service
docker-compose up -d --build backend
```

## 📖 API Documentation

### REST Endpoints

#### Insights
- `GET /api/insights` - Get recent insights
- `GET /api/insights/:id` - Get specific insight
- `GET /api/insights/category/:category` - Get insights by category
- `GET /api/insights/stats` - Get insight statistics
- `POST /api/insights/generate` - Manually trigger insight generation

#### Market Data
- `GET /api/market/price/:symbol` - Get current price for symbol
- `POST /api/market/prices` - Get prices for multiple symbols
- `GET /api/market/top-movers` - Get top moving assets
- `GET /api/market/top-gainers` - Get top gaining assets
- `GET /api/market/top-losers` - Get top losing assets
- `GET /api/market/overview` - Get complete market overview

### WebSocket Events

#### Client → Server
- `subscribe-price` - Subscribe to price updates for a symbol
- `unsubscribe-price` - Unsubscribe from price updates
- `subscribe-insights` - Subscribe to new insights
- `unsubscribe-insights` - Unsubscribe from insights
- `subscribe-market-overview` - Subscribe to market overview updates

#### Server → Client
- `connected` - Connection confirmation with stats
- `price-update` - Real-time price update
- `new-insight` - New AI insight generated
- `recent-insights` - Initial load of recent insights
- `market-overview` - Market overview data

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Backend tests
pnpm --filter backend test

# Frontend tests
pnpm --filter frontend test

# Type checking
pnpm --filter backend type-check
pnpm --filter frontend type-check
```

## 📦 Building for Production

```bash
# Build all packages
pnpm build

# Build individual packages
pnpm build:backend
pnpm build:frontend

# Start production servers
pnpm start
```

## 🔧 Configuration

### Backend Configuration

**Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `OPENAI_API_KEY` - OpenAI API key for GPT-4
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS

**Scheduled Tasks:**
- AI insights generated every **5 minutes**
- Market overview broadcast every **30 seconds**
- Initial insight generated **10 seconds** after startup

### Frontend Configuration

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket server URL

**Features:**
- Automatic reconnection with exponential backoff
- Real-time price updates with < 100ms latency
- Responsive design (mobile, tablet, desktop)
- Dark theme optimized for readability

## 🎨 Customization

### Adding New Cryptocurrencies

Edit `apps/backend/src/utils/asset-detector.ts`:

```typescript
['SYMBOL', {
  name: 'Full Name',
  patterns: ['Full Name', 'SYMBOL', 'alternative'],
  category: 'crypto'
}],
```

Also update `apps/backend/src/services/market-data.service.ts`:

```typescript
private readonly tradingPairs = [
  // ... existing pairs
  'symbolusdt',
];
```

### Customizing AI Prompts

Edit `apps/backend/src/services/ai-insights.service.ts`:

```typescript
{
  role: 'system',
  content: `Your custom system prompt here...`
}
```

### Styling

- **Theme colors**: `apps/frontend/tailwind.config.ts`
- **Global styles**: `apps/frontend/app/globals.css`
- **Component styles**: Use Tailwind utility classes

## 🚨 Troubleshooting

### WebSocket Connection Issues

```bash
# Check if backend is running
curl http://localhost:3001/health

# Verify WebSocket endpoint
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  http://localhost:3001/socket.io/
```

### Database Connection Issues

```bash
# Check PostgreSQL
docker-compose ps postgres

# View logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres
```

### Redis Connection Issues

```bash
# Test Redis connection
docker-compose exec redis redis-cli ping

# Should return: PONG
```

### OpenAI API Issues

- Verify your API key is correct
- Check your OpenAI account has credits
- Review rate limits (fallback insights will be used if rate limited)

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "services": {
    "database": "connected",
    "redis": "connected",
    "websocket": "connected",
    "marketData": "connected"
  },
  "websocket": {
    "connectedClients": 5,
    "rooms": ["insights", "price:BTC", "price:ETH"]
  }
}
```

## 🛣️ Roadmap

### Phase 2 Features (Not in MVP)
- [ ] User authentication and accounts
- [ ] Personalized watchlists
- [ ] Trading features integration
- [ ] Advanced charting with TradingView
- [ ] Push notifications
- [ ] Historical data analysis
- [ ] Portfolio tracking
- [ ] Mobile native apps

## 📝 License

This project is for demonstration purposes. Modify and use as needed.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 💡 Tips

- Use `pnpm` for faster installations
- Enable Docker BuildKit for faster builds: `export DOCKER_BUILDKIT=1`
- Monitor WebSocket connections in browser DevTools → Network → WS
- Check Redis cache: `docker-compose exec redis redis-cli KEYS '*'`
- View Prisma Studio: `cd apps/backend && pnpm prisma:studio`

## 📬 Support

For issues and questions:
- Check the [Troubleshooting](#-troubleshooting) section
- Review logs: `docker-compose logs -f`
- Open an issue on GitHub

---

**Built with ❤️ using Next.js, Fastify, OpenAI, and Binance**
