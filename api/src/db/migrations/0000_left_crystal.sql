CREATE TABLE "webhooks" (
	"id" text PRIMARY KEY NOT NULL,
	"method" text NOT NULL,
	"pathname" text NOT NULL,
	"ip" text NOT NULL,
	"status_code" integer DEFAULT 200 NOT NULL,
	"current_type" text,
	"content_length" integer,
	"query_params" json,
	"headers" json NOT NULL,
	"body" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
