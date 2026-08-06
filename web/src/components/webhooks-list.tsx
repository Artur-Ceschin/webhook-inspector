import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { webhookListSchema } from "../http/schemas/webhook";
import { WebhookListItems } from "./webhook-list-item";
import { Loader2, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CodeBlock } from "./ui/code-block";

export function WebhookList() {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver>(null);

  const [checkedWebhooksIds, setCheckedWebhooksIds] = useState<string[]>([]);
  const [generatedHandlerCode, setGeneratedHandlerCode] = useState<
    string | null
  >(null);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ["webhooks"],
      queryFn: async ({ pageParam }) => {
        const url = new URL("http://localhost:3333/api/webhooks");

        if (pageParam) {
          url.searchParams.set("cursor", pageParam);
        }

        const response = await fetch(url);

        const data = await response.json();

        return webhookListSchema.parse(data);
      },

      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor ?? null;
      },
      initialPageParam: undefined as string | undefined,
    });

  const webhooks = data.pages.flatMap((page) => page.webhooks);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function handleCheckWebhook(checkedWebhookId: string) {
    if (checkedWebhooksIds.includes(checkedWebhookId)) {
      setCheckedWebhooksIds((state) => {
        return state.filter((webhookId) => webhookId !== checkedWebhookId);
      });
    } else {
      setCheckedWebhooksIds((state) => [...state, checkedWebhookId]);
    }
  }

  async function handleGenerateHandler() {
    const response = await fetch("http://localhost:3333/api/generate", {
      method: "POST",
      body: JSON.stringify({ webhookIds: checkedWebhooksIds }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    type GeneratedResponse = { code: string };
    const data: GeneratedResponse = await response.json();

    setGeneratedHandlerCode(data.code);
  }

  const hasAnyWebhookSelected = checkedWebhooksIds.length > 0;

  return (
    <>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-1 p-2">
          <button
            onClick={() => handleGenerateHandler()}
            disabled={!hasAnyWebhookSelected}
            className="w-full cursor-pointer active:opacity-70 hover:opacity-80 bg-indigo-400 mb-3 font-medium text-sm text-white size-8 flex items-center justify-center rounded-lg gap-3 disabled:opacity-50"
          >
            <Wand2 className="size-4" />
            Generate handler
          </button>

          {webhooks.map((webhook) => (
            <WebhookListItems
              onWebhookCheck={handleCheckWebhook}
              isWebhookChecked={checkedWebhooksIds.includes(webhook.id)}
              key={webhook.id}
              webhook={webhook}
            />
          ))}
        </div>

        {hasNextPage && (
          <div className="p-2" ref={loadMoreRef}>
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-5 animate-spin text-zinc-500" />
              </div>
            )}
          </div>
        )}
      </div>

      {generatedHandlerCode && (
        <Dialog.Root defaultOpen>
          <Dialog.Overlay className="bg-black/60 inset-0 fixed" />

          <Dialog.Content className="flex items-center justify-center fixed left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 z-40 max-h-[85vh] w-[90vw]">
            <div className="bg-zinc-900 w-[60ppx] p-4 rounded-lg border-zinc-800 max-h-100 overflow-y-auto ">
              <CodeBlock language="typescript" code={generatedHandlerCode} />
            </div>
          </Dialog.Content>
        </Dialog.Root>
      )}
    </>
  );
}
