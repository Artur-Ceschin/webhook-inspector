import { db } from "@/db/index";
import { webhooks } from "@/db/schema/webhooks";

const TOTAL = 60;
const METHODS = ["POST"];
const ENDPOINTS = ["/stripe", "/webhooks/stripe", "/billing/stripe"];
const STRIPE_IPS = ["52.15.183.7", "54.88.130.119", "54.187.174.169"];
const STATUSES = [200, 201, 400, 404, 500];

const EVENT_TYPES = [
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "charge.succeeded",
  "charge.failed",
  "customer.created",
  "customer.subscription.created",
  "invoice.created",
  "invoice.paid",
];

async function seed() {
  console.log("🧹 Clearing existing webhooks...");
  await db.delete(webhooks);

  const rows = Array.from({ length: TOTAL }, (_, i) => {
    const now = Date.now();
    const spread = (7 * 24 * 60 * 60 * 1000) / TOTAL;
    const createdAt = new Date(now - TOTAL * spread + i * spread);

    const eventType =
      EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const body = JSON.stringify({
      id: `evt_${Math.random().toString(36).slice(2, 9)}`,
      type: eventType,
      created: Math.floor(createdAt.getTime() / 1000),
      data: {
        object: {
          id: `obj_${Math.random().toString(36).slice(2, 9)}`,
          type: eventType.split(".")[0],
        },
      },
    });

    return {
      method: "POST",
      pathname: ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)],
      ip: STRIPE_IPS[Math.floor(Math.random() * STRIPE_IPS.length)],
      statusCode: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      contentType: "application/json",
      contentLength: Buffer.byteLength(body),
      queryParams: null,
      headers: {
        "content-type": "application/json",
        "user-agent": "Stripe/1.0",
        "stripe-signature": `t=${Math.floor(createdAt.getTime() / 1000)},v1=test`,
      },
      body,
      createdAt,
    };
  });

  console.log(`🌱 Inserting ${rows.length} webhooks...`);
  await db.insert(webhooks).values(rows);

  console.log(`✅ Seeded ${rows.length} webhooks.`);
}

seed()
  .then(() => db.$client.end())
  .catch(async (error) => {
    console.error("❌ Seed failed:", error);
    await db.$client.end();
    process.exit(1);
  });
