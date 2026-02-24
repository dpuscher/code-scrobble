import { z } from "zod";

export const HistoryItemSchema = z.object({
  id: z.string(),
  time: z.string(),
  artist: z.string(),
  title: z.string(),
  year: z.string(),
  barcode: z.string().optional(),
  discogsId: z.number().optional(),
});

export type HistoryItem = z.infer<typeof HistoryItemSchema>;
