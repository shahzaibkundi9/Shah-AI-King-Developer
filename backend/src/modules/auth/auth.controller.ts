// auth.controller.ts
import { Request, Response } from "express";
import * as svc from "./auth.service";

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;
    const { user, token } = await svc.registerUser(email, password, name);
    res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const { user, token } = await svc.loginUser(email, password);
    res.json({ ok: true, user: { id: user.id, email: user.email, name: user.name }, token });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}
