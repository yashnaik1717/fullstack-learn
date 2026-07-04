import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'backend', timestamp: new Date().toISOString() });
});

// Avoid port binding when imported in tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Backend server listening on port ${port}`);
  });
}

export default app;
