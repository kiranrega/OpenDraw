import express, { json, Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import {
  CreateRoomSchema,
  CreateSchema,
  SignInSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { auth } from "./auth/auth";
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(json());

// Configure CORS for production safety
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200
}));

interface AuthRequest extends Request {
  user?: any;
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts, please try again in 15 minutes" },
});

function zodIssuesToFieldErrors(issues: any[]) {
  const errors: Record<string, string[]> = {};
  issues.forEach((issue) => {
    const path = (issue.path && issue.path.length > 0) ? String(issue.path[0]) : "_";
    errors[path] = errors[path] || [];
    errors[path].push(issue.message);
  });
  return errors;
}

app.post("/signup", authLimiter, async (req, res) => {
  const { username, password, email } = req.body;
  const validations = CreateSchema.safeParse({ username, password, email });

  if (!validations.success) {
    // Return 400 with structured validation errors
    const fieldErrors = zodIssuesToFieldErrors(validations.error.issues);
    return res.status(400).json({
      message: "Invalid input",
      errors: fieldErrors,
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const User = await prismaClient.user.create({
      data: {
        name: validations.data.username,
        email: validations.data.email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      message: "Successfully signed up",
      userId: User.id,
    });
  } catch (e: any) {
    // Handle Prisma unique constraint error (duplicate email)
    if (e?.code === "P2002" && e?.meta?.target?.includes("email")) {
      return res.status(409).json({
        message: "Email already in use",
        errors: { email: ["Email already registered"] },
      });
    }

    console.error("Signup error:", e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/signin", authLimiter, async (req, res) => {
  const { email, password } = req.body;

  const validations = SignInSchema.safeParse({ email, password });

  if (!validations.success) {
    const fieldErrors = zodIssuesToFieldErrors(validations.error.issues);
    return res.status(400).json({
      message: "Invalid input",
      errors: fieldErrors,
    });
  }

  try {
    const foundUser = await prismaClient.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!foundUser) {
      // Do not leak which field failed — respond with generic invalid credentials
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const matchedPassword = await bcrypt.compare(password, foundUser.password);

    if (!matchedPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT secret not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign({ foundUserId: foundUser.id }, jwtSecret, { expiresIn: '7d', algorithm: 'HS256' });

    return res.status(200).json({ token });
  } catch (e) {
    console.error("Signin error:", e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/logout", (req, res) => {
  // Logout is handled client-side by clearing the token
  // This endpoint serves as a confirmation and can be used for server-side cleanup
  res.status(200).json({ message: "Logout successful" });
});

app.post("/createroom", auth, async (req: any, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);

  if (!parsedData.success) {
    // return structured validation errors
    return res.status(400).json({
      message: "invalid inputs",
      errors: parsedData.error.issues,
    });
  }

  try {
    const userId = req?.user.foundUserId;
    const room = await prismaClient.room.create({
      data: {
        slug: parsedData.data.slug,
        adminId: userId,
      },
    });

    // return the full room object so client can append it directly
    return res.status(201).json({
      message: "room created",
      room,
    });
  } catch (e) {
    console.error("Create room error:", e);
    return res.status(500).json({
      message: "Internal server error",
      error: String(e),
    });
  }
});

app.get("/chats/:roomId", auth, async (req, res) => {
  try {
    const roomId = Number(req.params.roomId)

    // Validate roomId is a valid number
    if (isNaN(roomId) || roomId <= 0) {
      return res.status(400).json({
        message: "Invalid room ID",
        errors: { roomId: ["Room ID must be a positive number"] }
      });
    }

    const messages = await prismaClient.chat.findMany({
      where: { roomId },
      orderBy: { id: "desc" },
      take: 50
    })

    res.status(200).json({ messages })
  } catch (error) {
    console.error("Fetch chats error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
})

app.get("/room/:slug", auth, async (req, res) => {
  try {
    const slug = req.params.slug;

    if (!slug || typeof slug !== 'string' || slug.length === 0) {
      return res.status(400).json({
        message: "Invalid room slug",
        errors: { slug: ["Room slug is required"] }
      });
    }

    const room = await prismaClient.room.findFirst({
      where: { slug }
    });

    if (!room) {
      return res.status(404).json({
        message: "Room not found",
        room: null
      });
    }

    res.status(200).json({ room });
  } catch (error) {
    console.error("Fetch room error:", error);
    res.status(500).json({ message: "Failed to fetch room" });
  }
});

app.get('/getrooms', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req?.user?.foundUserId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found" });
    }

    const rooms = await prismaClient.room.findMany({
      where: { adminId: userId }
    });

    res.status(200).json({ rooms });
  } catch (error) {
    console.error("Fetch rooms error:", error);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});
