import { z } from "zod";

export const SessionUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  image: z.string(),
  imageLarge: z.string(),
  imageXLarge: z.string(),
});

export type SessionUser = z.infer<typeof SessionUserSchema>;
