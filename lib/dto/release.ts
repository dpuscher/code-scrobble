import { z } from "zod";

export const TrackSchema = z.object({
  title: z.string(),
  trackNumber: z.number(),
  duration: z.number(),
});

export const ReleaseSchema = z.object({
  id: z.union([z.string(), z.number()]),
  artist: z.string(),
  title: z.string(),
  image: z.string().optional(),
  url: z.string(),
  year: z.string(),
  tracks: z.array(TrackSchema),
  instantScrobble: z.boolean().optional(),
});

export type Track = z.infer<typeof TrackSchema>;
export type Release = z.infer<typeof ReleaseSchema>;
