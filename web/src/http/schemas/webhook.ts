import { z } from "zod";

export const webhookListItemsSchema = z.object({
  id: z.uuidv7(),
  method: z.string(),
  pathname: z.string(),
  createdAt: z.coerce.date(),
});

export const webhookListSchema = z.object({
  webhooks: z.array(webhookListItemsSchema),
  nextCursor: z.string().nullable(),
});
