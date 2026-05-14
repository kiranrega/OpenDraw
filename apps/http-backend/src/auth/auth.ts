import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();

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
  const jwtSecret = process.env.JWT_SECRET as string;
  if (!jwtSecret) {
    res.status(500).json({ message: "Server configuration error" });
    return;
  }

  jwt.verify(token, jwtSecret, { algorithms: ['HS256'] }, (err, user) => {
    if (err) {
      res.status(403).json({ message: "Invalid Credentials" });
      return;
    }

    req.user = user;
    next();
  });
}
