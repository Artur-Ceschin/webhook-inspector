import { db } from "@/db/index";
import { webhooks } from "@/db/schema/webhooks";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { inArray } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/generate",
    {
      schema: {
        summary: "Generate a Typescript handler",
        tags: ["Webhooks"],
        body: z.object({
          webhookIds: z.array(z.string()),
        }),

        response: {
          201: z.object({
            code: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { webhookIds } = request.body;

      const result = await db
        .select({
          body: webhooks.body,
        })
        .from(webhooks)
        .where(inArray(webhooks.id, webhookIds));

      const webhooksBodies = result.map((webhook) => webhook.body).join("\n\n");

      const { text } = await generateText({
        model: google("gemini-2.5-pro"),
        prompt: `
          ${webhooksBodies}

          Create:
          1. BaseWebhookSchema for shared fields
          2. Schemas for each inferred event type
          3. Discriminated union using the event field as discriminator
          4. Exported z.infer types
          5. Handler: export async function handleWebhook(body: unknown): Promise<void>

          return only the code within \'\'\'\, do not include any instruction or code
        `,
      });

      return reply.status(201).send({ code: text });
    },
  );
};
