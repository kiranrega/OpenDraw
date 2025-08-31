import { z } from 'zod'

export const CreateSchema = z.object({ 
  username: z.string(),
  password: z.string().min(3).max(8),
  emial: z.email()
});

export const SignInSchema = z.object({ 
  password: z.string().min(3).max(8),
  emial: z.email()
});

export const CreateRoomSchema = z.object({
    name: z.string().min(3).max(20)
})