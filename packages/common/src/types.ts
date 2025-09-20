import { z } from "zod";

export const CreateSchema = z.object({
  username: z.string(),
  password: z.string().min(3).max(8),
  email: z.string().email(),
});

export const SignInSchema = z.object({
  password: z.string().min(3).max(8),
  email: z.string().email(),
});

export const CreateRoomSchema = z.object({
  slug: z.string().min(3).max(20),
});
