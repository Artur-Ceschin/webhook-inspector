import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Group, Panel, Separator } from "react-resizable-panels";
import { SideBar } from "../components/sidebar";

const queryClient = new QueryClient();

const RootLayout = () => (
  <QueryClientProvider client={queryClient}>
    <div className="h-screen bg-zinc-900 ">
      <Group orientation="horizontal" className="h-full">
        <Panel
          defaultSize="20"
          minSize="15"
          maxSize="40"
          className="bg-zinc-950 p-4 text-zinc-100"
        >
          <SideBar />
        </Panel>

        <Separator className="w-1 cursor-col-resize bg-zinc-700 hover:bg-zinc-600 transition-colors duration-150" />

        <Panel defaultSize="80" minSize="60" className="p-4 text-zinc-100">
          <Outlet />
        </Panel>
      </Group>
    </div>
  </QueryClientProvider>
);

export const Route = createRootRoute({ component: RootLayout });
