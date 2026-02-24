import { z } from "zod";

export const AutoScrobbleItemSchema = z.object({
  id: z.string(),
  artist: z.string(),
  title: z.string(),
  year: z.string(),
});

export type AutoScrobbleItem = z.infer<typeof AutoScrobbleItemSchema>;
