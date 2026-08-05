import { useSuspenseQuery } from "@tanstack/react-query";
import { webhookListSchema } from "../http/schemas/webhook";
import { WebhookListItems } from "./webhook-list-item";

export function WebhookList() {
  const { data } = useSuspenseQuery({
    queryKey: ["webhooks"],
    queryFn: async () => {
      const response = await fetch("http://localhost:3333/api/webhooks");
      const data = await response.json();

      return webhookListSchema.parse(data);
    },
  });

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide">
      <div className="space-y-1 p-2">
        {data.webhooks.map((webhook) => (
          <WebhookListItems key={webhook.id} webhook={webhook} />
        ))}
      </div>
    </div>
  );
}
