import * as RadixCheckbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface CheckboxProps extends RadixCheckbox.CheckboxProps {}

export function Checkbox(props: CheckboxProps) {
  return (
    <RadixCheckbox.Root
      className={twMerge(
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2",
        "flex size-4 shrink-0 items-center justify-center rounded border border0zinc-600 border-zinc-600 bg-zinc-800 transition-colors hover:border-zinc-500",
        "data-[state=checked]:border-indigo-400 data-[state=checked]:bg-indigo-400",
      )}
      {...props}
    >
      <RadixCheckbox.Indicator>
        <CheckIcon className="size-3" strokeWidth={3} />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}
