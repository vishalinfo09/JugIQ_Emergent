import type { ChatMsg } from "@/lib/jugiq-data";
import { cn } from "@/lib/utils";
import { Sparkle } from "lucide-react";

function JugiqMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full bg-clay/12 text-clay ring-1 ring-clay/25",
        className,
      )}
      aria-hidden
    >
      <Sparkle className="size-3.5" />
    </span>
  );
}

export function ChatMessage({ msg, children }: { msg: ChatMsg; children?: React.ReactNode }) {
  if (msg.kind === "user") {
    return (
      <div className="flex animate-rise justify-end" data-testid={`message-${msg.id}`}>
        <div className="max-w-[min(34rem,85%)] rounded-2xl rounded-br-sm bg-foreground px-4 py-3 text-[0.95rem] leading-relaxed text-background">
          {msg.text}
          <div className="mt-1 text-[0.7rem] text-background/55">{msg.time}</div>
        </div>
      </div>
    );
  }

  if (msg.kind === "person") {
    return (
      <div className="flex animate-rise gap-3" data-testid={`message-${msg.id}`}>
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[0.65rem] font-semibold tracking-wide text-secondary-foreground">
          {msg.initials}
        </span>
        <div className="min-w-0 max-w-[min(38rem,90%)]">
          <div className="mb-1 flex items-baseline gap-2">
            <span className="text-sm font-semibold">{msg.author}</span>
            <span className="text-[0.7rem] text-muted-foreground">{msg.time}</span>
          </div>
          <p className="text-[0.95rem] leading-relaxed text-foreground/90">{msg.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-rise gap-3" data-testid={`message-${msg.id}`}>
      <JugiqMark className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="font-heading text-sm font-semibold">JugIQ</span>
          <span className="text-[0.7rem] text-muted-foreground">{msg.time}</span>
        </div>
        <p className="max-w-[42rem] text-[0.98rem] leading-relaxed text-foreground/90">
          {msg.text}
        </p>
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-3" data-testid="jugiq-typing-indicator">
      <JugiqMark />
      <span className="flex items-center gap-1 rounded-full bg-linen px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </span>
    </div>
  );
}
