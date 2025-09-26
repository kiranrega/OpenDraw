import express, { json, Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  CreateRoomSchema,
  CreateSchema,
  SignInSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { auth } from "./auth/auth.js";
import cors from 'cors';
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(json());
app.use(cors())

interface AuthRequest extends Request {
  user?: any;
}

// Helper to transform Zod issues into { field: [messages] } shape
function zodIssuesToFieldErrors(issues: any[]) {
  const errors: Record<string, string[]> = {};
  issues.forEach((issue) => {
    const path = (issue.path && issue.path.length > 0) ? String(issue.path[0]) : "_";
    errors[path] = errors[path] || [];
    errors[path].push(issue.message);
  });
  return errors;
}

app.post("/signup", async (req, res) => {
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

app.post("/signin", async (req, res) => {
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

    // Support either env var name if typo exists
    const jwtSecret = process.env.JWT_SECRET ?? process.env.JWT_SCREAT;
    if (!jwtSecret) {
      console.error("JWT secret not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign({ foundUserId: foundUser.id }, jwtSecret);

    return res.status(200).json({ token });
  } catch (e) {
    console.error("Signin error:", e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.post("/room", auth, async (req: any, res) => {
  const pasredData = CreateRoomSchema.safeParse(req.body);

  if (!pasredData.success) {
    res.send({
      message: "invalid inputs",
    });
    return;
  }

  try {
    const userId = req?.user.foundUserId;
    const room = await prismaClient.room.create({
      data: {
        slug: pasredData.data.slug,
        adminId: userId,
      },
    });

    res.send({
      roomId: room.id,
    });
  } catch (e) {
    res.send({
      error: e,
    });
  }
});

app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId)

  const messages = await prismaClient.chat.findMany({
    where:{
      roomId
    },
    orderBy:{id:"desc"},
    take: 50
  })
  res.send({
    messages
  })
})

app.get("/room/:slug", auth, async (req, res) => {
    const slug = req.params.slug;
    const room = await prismaClient.room.findFirst({
        where: {
            slug
        }
    });
    res.json({
        room
    })
})

app.get('/getrooms', auth, async (req: AuthRequest, res) => {
  const userId = req?.user.foundUserId;
  const rooms = await prismaClient.room.findMany({
    where:{
      adminId: userId
    }
  })
  res.send({
    rooms
  })
})

app.listen(3001);
