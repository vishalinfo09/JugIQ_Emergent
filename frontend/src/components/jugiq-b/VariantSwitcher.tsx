import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

// Prototype-only affordance to compare the two UX directions. Mounted globally
// in App so neither variant's page component has to be modified.
export function VariantSwitcher() {
  const { pathname } = useLocation();
  const onB = pathname.startsWith("/b");
  return (
    <div
      className="fixed bottom-4 left-4 z-50 flex items-center gap-1 rounded-full border border-hairline bg-card/95 p-1 shadow-lg backdrop-blur"
      data-testid="variant-switcher"
    >
      <span className="pl-2 pr-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Variant
      </span>
      <Link
        to="/"
        className={cn(
          "rounded-full px-2.5 py-1 text-[0.78rem] font-medium transition-colors",
          !onB ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
        )}
        data-testid="variant-link-a"
      >
        A · Conversation
      </Link>
      <Link
        to="/b"
        className={cn(
          "rounded-full px-2.5 py-1 text-[0.78rem] font-medium transition-colors",
          onB ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
        )}
        data-testid="variant-link-b"
      >
        B · Workspace
      </Link>
    </div>
  );
}
