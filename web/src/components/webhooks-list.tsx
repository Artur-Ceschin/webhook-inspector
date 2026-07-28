import { WebhooksListItems } from "./webhooks-list-item";

export function WebhookList() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-1 p-2">
        <WebhooksListItems />
        <WebhooksListItems />
        <WebhooksListItems />
        <WebhooksListItems />
        <WebhooksListItems />
        <WebhooksListItems />
        <WebhooksListItems />
      </div>
    </div>
  );
}
