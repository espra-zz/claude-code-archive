# CryptoPulse - Quick Setup Guide 🚀

## Prerequisites Checklist

- [ ] Node.js 20+ installed (`node --version`)
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Docker & Docker Compose installed (optional)
- [ ] OpenAI API key ready

## 5-Minute Quickstart

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment files
cp .env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local

# 3. Add your OpenAI API key to apps/backend/.env
# OPENAI_API_KEY=sk-your-key-here

# 4. Start infrastructure
docker-compose up -d postgres redis

# 5. Initialize database
cd apps/backend && pnpm prisma:generate && pnpm prisma:migrate && cd ../..

# 6. Start dev servers
pnpm dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## Verify Everything Works

```bash
# Test backend health
curl http://localhost:3001/health

# Check WebSocket connection
# Open browser console at http://localhost:3000
# You should see: "✅ Connected to WebSocket server"

# Trigger manual insight generation
curl -X POST http://localhost:3001/api/insights/generate
```

## Common Issues

### Port Already in Use
```bash
# Find and kill process using port 3000 or 3001
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart if needed
docker-compose restart postgres
```

### "Cannot find module 'xyz'"
```bash
# Reinstall dependencies
rm -rf node_modules apps/*/node_modules
pnpm install
```

### OpenAI Rate Limit
The system has fallback insights. Check your OpenAI account:
- https://platform.openai.com/account/usage
- Ensure you have available credits

## Development Tips

1. **Watch mode**: Both backend and frontend auto-reload on changes
2. **Logs**: Check terminal for backend logs, browser console for frontend
3. **Database**: Access Prisma Studio: `cd apps/backend && pnpm prisma:studio`
4. **Redis**: Check cache: `docker-compose exec redis redis-cli`

## Next Steps

After setup:
1. Wait 10 seconds for first AI insight to generate
2. Watch real-time price updates in asset badges
3. Explore the Top Movers sidebar with live data
4. Check WebSocket events in browser DevTools → Network → WS

Need help? Check the full README.md for detailed documentation.
