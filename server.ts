import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/db.ts';
import authRouter from './server/routes/auth.ts';
import imagesRouter from './server/routes/images.ts';
import usersRouter from './server/routes/users.ts';
import paymentsRouter from './server/routes/payments.ts';


// console.log("DEBUG MONGODB_URI IS:", process.env.MONGODB_URI);
// import fs from 'fs';
// console.log("CURRENT WORKING DIRECTORY:", process.cwd());
// console.log("FILES IN THIS DIRECTORY:", fs.readdirSync(process.cwd()));

async function startServer() {
  // Attempt database connection
  await connectDB();

  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static directory for locally saved generated images
  app.use('/generations', express.static(path.join(process.cwd(), 'generations')));

  // Mount API endpoints
  app.use('/api/auth', authRouter);
  app.use('/api/images', imagesRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/payments', paymentsRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Integrate Vite dev middleware or serve compiled dist files
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in Development mode. Mounting Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running in Production mode. Serving built static folder...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start listener on host 0.0.0.0 and port 3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Express-Vite backend server:', err);
});
