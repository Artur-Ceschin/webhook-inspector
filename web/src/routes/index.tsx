import { createFileRoute } from "@tanstack/react-router";
import { Panel, Group, Separator } from "react-resizable-panels";
import { SideBar } from "../components/sidebar";
import { WebhookDetailHeader } from "../components/webhook-detail-header";
import { SectionTitle } from "../components/section-title";
import { SectionDataTable } from "../components/section-data-table";
import { CodeBlock } from "../components/ui/code-block";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const code = `
    const a = 1;

    const b = 2

    return a + b
  
  `;
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
        <h3 className="text-lg font-semibold text-zinc-200">
          No webhook selected
        </h3>
        <p className="text-sm text-zinc-400 max-w-md">
          Select a webhook from the list to view its details
        </p>
      </div>
    </div>
  );
}
