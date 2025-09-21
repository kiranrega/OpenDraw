import express, { json } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  CreateRoomSchema,
  CreateSchema,
  SignInSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import { auth } from "./auth/auth.js";
import dotenv from "dotenv";
dotenv.config();
import cors from 'cors';
const app = express();
app.use(json());
app.use(cors())
app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  const validations = CreateSchema.safeParse({ username, password, email });

  if (!validations.success) {
    res.send({
      message: "Incorrect format",
      error:
        validations.error.issues &&
        validations.error.issues[0] &&
        validations.error.issues[0].message,
    });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const User = await prismaClient.user.create({
      data: {
        name: validations.data.username,
        email: validations.data.email,
        password: hashedPassword,
      },
    });
    if (!User) {
      res.status(403).send({
        message: "Db Error",
      });
    } else {
      res.status(200).send({
        message: "Succesfully signed in",
        userId: User.id,
      });
    }
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const validations = SignInSchema.safeParse({ email, password });

  if (!validations.success) {
    res.send({
      message: "Incorrect format",
      error:
        validations.error.issues &&
        validations.error.issues[0] &&
        validations.error.issues[0].message,
    });
  } else {
    const foundUser = await prismaClient.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!foundUser) {
      res.status(403).send({
        message: "Invalid Credentials",
      });
    } else {
      const matchedPassword = await bcrypt.compare(
        password,
        foundUser.password
      );

      if (matchedPassword) {
        const jwtSecret = process.env.JWT_SCREAT;

        if (!jwtSecret) {
          return res.status(500).json({ error: "JWT secret not configured" });
        }
        let foundUserId = foundUser && foundUser.id;
        const token = jwt.sign(
          {
            foundUserId,
          },
          jwtSecret
        );

        res.json({ token });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    }
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

app.get("/room/:slug", async (req, res) => {
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

app.listen(3001);
