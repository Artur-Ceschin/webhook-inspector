import { db } from "@/db/index";
import { webhooks } from "@/db/schema/webhooks";
import { eq } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const getWebhook: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/webhooks/:id",
    {
      schema: {
        summary: "Get a specific webhook by id",
        tags: ["Webhooks"],
        params: z.object({
          id: z.uuidv7(),
        }),

        response: {
          200: createSelectSchema(webhooks).extend({
            body: z.any().nullable(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const result = await db
        .select()
        .from(webhooks)
        .where(eq(webhooks.id, id))
        .limit(1);

      if (result.length === 0) {
        return reply.status(404).send({ message: "Webhook not found" });
      }

      const webhook = result[0];
      return reply.send(webhook);
    },
  );
};
