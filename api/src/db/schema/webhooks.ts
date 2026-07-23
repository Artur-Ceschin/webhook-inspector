import { integer, json, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const webhooks = pgTable("webhooks", {
  id: text()
    .primaryKey()
    .$defaultFn(() => uuidv7()),
  method: text().notNull(),
  pathname: text().notNull(),
  ip: text().notNull(),
  statusCode: integer().notNull().default(200),
  currentType: text(),
  contentLength: integer(),
  queryParams: json().$type<Record<string, string>>(),
  headers: json().$type<Record<string, string>>().notNull(),
  body: text(),
  createdAt: timestamp().notNull().defaultNow(),
});
