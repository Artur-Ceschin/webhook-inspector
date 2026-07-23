import { fastify } from "fastify";

import {
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
  serializerCompiler,
} from "fastify-type-provider-zod";

import { fastifySwagger } from "@fastify/swagger";
import { fastifyCors } from "@fastify/cors";
import ScalarApiReference from "@scalar/fastify-api-reference";
import { listWebHooks } from "./routes/listWebHooks";
import { env } from "./env";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: true,
  methods: ["GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Webhook Inspector API",
      description: "API for capturing and inspecting webhook requests",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(ScalarApiReference, {
  routePrefix: "/docs",
});

app.register(listWebHooks);
// app.serializerCompiler;

app.listen({ port: env.PORT, host: "0.0.0.0" }).then(() => {
  console.log("🚀 HTTP is running http://localhost:3333");
  console.log("📚 Docs available in http://localhost:3333/docs");
});
