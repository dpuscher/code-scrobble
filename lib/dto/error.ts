import { z } from "zod";

export const ErrorEnvelopeSchema = z.object({
  error: z.string(),
});

export type ErrorEnvelope = z.infer<typeof ErrorEnvelopeSchema>;
