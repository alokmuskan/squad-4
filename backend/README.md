# Personalized Learning Roadmap Backend

TypeScript + Node.js + Express + Prisma + PostgreSQL backend for GitHub OAuth.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and fill in:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/personalized_learning_roadmap?schema=public"
JWT_SECRET="use-a-long-random-secret-at-least-32-characters"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
FRONTEND_ORIGIN=http://localhost:5173
PORT=5000
```

3. Create/update database tables:

```bash
npm run prisma:migrate
```

4. Start development server:

```bash
npm run dev
```

## Endpoints

- `GET /health`
- `POST /api/auth/github`
- `GET /api/user/profile`
- `POST /api/github/analyze`
