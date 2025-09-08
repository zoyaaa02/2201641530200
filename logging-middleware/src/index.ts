// src/index.ts
import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { loggingMiddleware } from './middleware/loggingMiddleware';

// src/index.ts
// import express from 'express';
// import bodyParser from 'body-parser';
// import { loggingMiddleware } from './middleware/loggingMiddleware';


const app = express();
const PORT = 4000;

app.use(bodyParser.json());
app.use(loggingMiddleware);

app.post('/api/v1/logs/visualization-service/logs', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Log received', data: req.body });
});

app.listen(PORT, () => {
  console.log(`Logging server running at http://localhost:${PORT}`);
});
