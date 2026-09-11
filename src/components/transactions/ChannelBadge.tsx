// components/domain/ChannelBadge.tsx
import { cn } from "@/utils/cn";

export function ChannelBadge({
  channel,
  className,
}: {
  channel: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "w-3/4 inline-flex justify-center items-center rounded-xs bg-sidebar-badge-background/10 border border-badge-neutral-text/20 px-2 py-0.5 text-xs font-medium text-badge-neutral-text",
        className,
      )}
    >
      {channel}
    </span>
  );
}
