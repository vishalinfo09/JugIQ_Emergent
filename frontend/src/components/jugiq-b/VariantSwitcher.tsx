import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

// Prototype-only affordance to compare the two UX directions. Mounted globally
// in App so neither variant's page component has to be modified.
export function VariantSwitcher() {
  const { pathname } = useLocation();
  const on = pathname.startsWith("/c") ? "c" : pathname.startsWith("/b") ? "b" : "a";
  const item = (active: boolean) =>
    cn(
      "rounded-full px-2.5 py-1 text-[0.78rem] font-medium transition-colors",
      active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
    );
  return (
    <div
      className="fixed bottom-4 left-4 z-50 flex items-center gap-1 rounded-full border border-hairline bg-card/95 p-1 shadow-lg backdrop-blur"
      data-testid="variant-switcher"
    >
      <span className="pl-2 pr-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        Variant
      </span>
      <Link to="/" className={item(on === "a")} data-testid="variant-link-a">
        A · Conversation
      </Link>
      <Link to="/b" className={item(on === "b")} data-testid="variant-link-b">
        B · Workspace
      </Link>
      <Link to="/c" className={item(on === "c")} data-testid="variant-link-c">
        C · Hybrid
      </Link>
    </div>
  );
}
