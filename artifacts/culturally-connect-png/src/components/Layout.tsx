import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Wifi, WifiOff, Flame, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function Layout({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { user, logout, canReview, canManage } = useAuth();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col relative selection:bg-accent selection:text-accent-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/map" className="flex items-center gap-3 text-primary hover:text-accent transition-colors">
            <Flame className="w-6 h-6 text-accent animate-pulse" />
            <span className="font-serif font-bold text-xl hidden sm:inline-block tracking-wider">
              Culturally Connect PNG
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {canReview && (
              <Link href="/review" className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-white/10 hover:text-foreground sm:inline-flex">
                Review
              </Link>
            )}
            {canManage && (
              <Link href="/admin" className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-white/10 hover:text-foreground sm:inline-flex">
                Admin
              </Link>
            )}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium backdrop-blur-sm transition-colors ${
                isOnline
                  ? "bg-secondary/10 border-secondary/20 text-secondary-foreground"
                  : "bg-destructive/10 border-destructive/20 text-destructive-foreground"
              }`}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline-block">{isOnline ? "Online" : "Offline Vault Mode"}</span>
            </div>
            {user && (
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground md:flex">
                <span className="capitalize text-foreground">{user.role}</span>
                <span>{user.name}</span>
              </div>
            )}
            <button
              type="button"
              onClick={logout}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative">{children}</main>

      <footer className="border-t border-white/5 bg-black/40 py-12 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <h3 className="font-serif text-xl font-medium text-primary mb-6">
            Culturally Connect PNG — Preserving the Voices of Our Ancestors
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-muted-foreground max-w-3xl mx-auto">
            <div>
              <p className="font-semibold text-foreground mb-2 font-serif">Technical Lead</p>
              <p>Darol Awei (Architecture)</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2 font-serif">Data & Design</p>
              <p>Rallyanne SALO (Analysis)</p>
              <p>Abbigail PKIENGOU (UI/UX)</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2 font-serif">Business & Sustainability</p>
              <p>Kalama Mago</p>
              <p>Maggie GIRORO</p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 text-xs text-muted-foreground/50">
            <p>Sacred knowledge kept safe for future generations.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
