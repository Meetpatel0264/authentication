# Backend

Node.js + Express authentication API with MongoDB, JWT, BullMQ, Redis, and Nodemailer.

## Run

```bash
cd backend
npm install
npm run dev
```

Start the email worker in a second terminal:

```bash
cd backend
npm run worker:dev
```

```bash
cd backend
docker run -d --name auth-redis -p 6379:6379 redis
```



Copy `.env.example` to `.env` before starting. See `../PROJECT_DOCUMENTATION.md` for complete setup and deployment instructions.
