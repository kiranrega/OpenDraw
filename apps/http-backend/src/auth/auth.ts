import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
require("dotenv").config();

interface AuthRequest extends Request {
  user?: any;
}

export async function auth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  const jwtSecret = process.env.JWT_SCREAT as string
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      res.status(403).json({ message: "Invalid Credentials" });
      return;
    }

    req.user = user;
    next();
  });
}
