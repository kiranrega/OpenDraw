import { z } from "zod";

export const CreateSchema = z.object({
  username: z.string(),
  password: z.string().min(8),
  email: z.string().email(),
});

export const SignInSchema = z.object({
  password: z.string().min(8),
  email: z.string().email(),
});

export const CreateRoomSchema = z.object({
  slug: z.string().min(3).max(20),
  description: z.string().min(3).max(100).optional(),
});

// Shape validation schema to prevent XSS attacks
export const ShapeSchema = z.union([
  z.object({
    id: z.string(),
    type: z.literal("rect"),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("circle"),
    centerX: z.number(),
    centerY: z.number(),
    radius: z.number(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("pencil"),
    startX: z.number(),
    startY: z.number(),
    endX: z.number(),
    endY: z.number(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("rhombus"),
    centerX: z.number(),
    centerY: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("text"),
    x: z.number(),
    y: z.number(),
    text: z.string().max(500), // Limit text length to prevent abuse
    fontSize: z.number().min(8).max(72),
  }),
]);

export const ChatMessageSchema = z.object({
  shape: ShapeSchema,
});
