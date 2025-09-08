// src/middleware/loggingMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const logFile = path.join(__dirname, '../logs/server.log');

export function loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, url, body } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logEntry = `[${new Date().toISOString()}] ${method} ${url} - ${res.statusCode} - ${duration}ms\nRequest Body: ${JSON.stringify(body)}\n\n`;
    fs.appendFile(logFile, logEntry, err => {
      if (err) console.error('Logging failed:', err);
    });
  });

  next();
}
