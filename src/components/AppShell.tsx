import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  Star,
  Gauge,
  Swords,
  Menu,
  Waves,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { to: "/marketing", label: "Marketing IA", icon: Sparkles },
  { to: "/calendrier", label: "Calendrier éditorial", icon: CalendarDays },
  { to: "/avis", label: "Avis Google", icon: Star },
  { to: "/valorisation", label: "Valorisation", icon: Gauge },
  { to: "/concurrence", label: "Concurrence", icon: Swords },
] as const;

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = pathname === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_0_var(--sidebar-primary)]"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl gradient-hero">
        <Waves className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-lg leading-tight text-sidebar-accent-foreground">AirBleu AI</p>
        <p className="truncate text-xs text-sidebar-foreground/60">Restaurant L'Air Bleu</p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col gap-8 bg-sidebar p-5 lg:flex">
        <Brand />
        <NavList />
        <div className="mt-auto rounded-2xl border border-sidebar-border/60 bg-sidebar-accent/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-primary">Copilote IA</p>
          <p className="mt-2 text-sm text-sidebar-foreground/80">
            6 recommandations en attente pour améliorer votre visibilité locale.
          </p>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ouvrir le menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-none bg-sidebar p-5">
              <div className="flex flex-col gap-8">
                <Brand />
                <NavList onNavigate={() => setOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
          <span className="truncate font-display text-lg">AirBleu AI</span>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  titre,
  sousTitre,
  action,
}: {
  titre: string;
  sousTitre: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold sm:text-3xl">{titre}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{sousTitre}</p>
      </div>
      {action}
    </header>
  );
}
