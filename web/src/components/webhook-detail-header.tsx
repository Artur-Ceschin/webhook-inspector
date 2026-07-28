import { Badge } from "./ui/badge";

export function WebhookDetailHeader() {
  return (
    <div className="space-y-4 border-b border-zinc-700 p-6">
      <div className="flex items-center gap-3">
        <Badge>POST</Badge>
        <span className="text-lg font-medium text-zinc-300">
          /videos/status
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-sm text-zinc-400">
          <span>FROM IP</span>
          <span className="underline offset-4">123.292.183.23</span>
        </div>
        <span className="w-px h-4 bg-zinc-700" />
        <div className="flex items-center gap-1 text-sm text-zinc-400">
          <span>at</span>
          <span>April 18th, 15pm</span>
        </div>
      </div>
    </div>
  );
}
