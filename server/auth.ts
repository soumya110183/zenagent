import express from 'express';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { storage } from './storage';
import { loginSchema, registerSchema } from '@shared/schema';
import type { User } from '@shared/schema';

// Session configuration
export function setupSession(app: express.Application) {
  const pgStore = connectPg(session);
  
  app.use(session({
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      tableName: 'sessions',
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to false for development
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax', // Allow cross-site requests in development
    },
    name: 'connect.sid', // Explicit session name
  }));
}

// Auth middleware
export function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Optional auth middleware (doesn't require auth but adds user if available)
export function optionalAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  // User info is available in req.session.user if logged in
  next();
}

// Extend session type
declare module 'express-session' {
  interface SessionData {
    user?: User;
  }
}