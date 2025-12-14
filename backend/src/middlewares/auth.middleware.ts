// auth middleware
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import prisma from "../db";

export interface AuthRequest extends Request {
  user?: any;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: "No token" });
  const parts = header.split(" ");
  if (parts.length !== 2) return res.status(401).json({ error: "Invalid token format" });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
