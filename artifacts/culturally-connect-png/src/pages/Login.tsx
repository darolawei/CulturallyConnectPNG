import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Flame, ShieldCheck, UserPlus, Users, type LucideIcon } from "lucide-react";
import { getRoleHome, useAuth, type UserRole } from "@/lib/auth";

const actors: Array<{
  role: UserRole;
  title: string;
  access: string;
  icon: LucideIcon;
  demo: string;
}> = [
  { role: "visitor", title: "Visitor", access: "Walk through provinces, stories, herbs, villages, songs, and festivals.", icon: Users, demo: "visitor@ccpng.test / visitor123" },
  { role: "contributor", title: "Contributor", access: "Share community knowledge so it can be reviewed and preserved.", icon: UserPlus, demo: "contributor@ccpng.test / contributor123" },
  { role: "reviewer", title: "Reviewer", access: "Check submitted records with care before they become public.", icon: CheckCircle2, demo: "reviewer@ccpng.test / reviewer123" },
  { role: "admin", title: "Admin", access: "Protect the archive, manage access, and maintain province media.", icon: ShieldCheck, demo: "admin@ccpng.test / admin123" },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [selectedRole, setSelectedRole] = useState<UserRole>("visitor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("visitor@ccpng.test");
  const [password, setPassword] = useState("visitor123");
  const [error, setError] = useState("");

  const selectedActor = actors.find((actor) => actor.role === selectedRole) || actors[0];
  const canSignup = selectedRole === "visitor" || selectedRole === "contributor";

  const selectRole = (role: UserRole) => {
    setSelectedRole(role);
    setError("");
    const actor = actors.find((item) => item.role === role);
    const [demoEmail, demoPassword] = actor?.demo.split(" / ") || ["", ""];
    setEmail(demoEmail);
    setPassword(demoPassword);
    if (role === "reviewer" || role === "admin") {
      setMode("login");
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    const result =
      mode === "signup"
        ? signup({ role: selectedRole as "visitor" | "contributor", name, email, password })
        : login(selectedRole, email, password);

    if (!result.ok) {
      setError(result.message || "Access denied.");
      return;
    }

    setLocation(getRoleHome(selectedRole));
  };

  return (
    <div className="min-h-[100dvh] w-full relative overflow-hidden bg-background">
      <img
        src="/images/highlands-dancers.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/90" />
      <div
        className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "url('/images/tapa-pattern.png')",
          backgroundSize: "400px",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="absolute bottom-0 right-0 h-[55vh] w-[55vw] bg-accent/10 blur-[120px] pointer-events-none" />

      <div className="container relative z-10 mx-auto grid min-h-[100dvh] grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div>
            <div className="mb-5 flex items-center gap-3 text-accent">
              <Flame className="h-8 w-8" />
              <span className="font-serif text-2xl font-bold tracking-wide text-primary">Culturally Connect PNG</span>
            </div>
            <h1 className="max-w-3xl font-serif text-4xl font-bold leading-tight text-foreground md:text-6xl">
              Enter the Cultural Vault.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-foreground/80 md:text-lg">
              Explore, preserve, review, and protect the stories, songs, places, and knowledge of our communities.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {actors.map((actor) => {
              const Icon = actor.icon;
              const isSelected = selectedRole === actor.role;
              return (
                <button
                  key={actor.role}
                  type="button"
                  onClick={() => selectRole(actor.role)}
                  className={`min-h-[154px] rounded-lg border p-4 text-left transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/15 text-foreground"
                      : "border-white/10 bg-card/35 text-muted-foreground hover:border-primary/50 hover:bg-card/55"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-black/30 text-accent">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="font-serif text-xl font-bold text-foreground">{actor.title}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                  <p className="text-sm leading-6">{actor.access}</p>
                </button>
              );
            })}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <div className="border border-white/10 bg-card/45 p-6 shadow-2xl backdrop-blur-xl sm:p-8 tapa-border">
            <div className="mb-7">
              <div className="mb-3 flex items-center gap-3 text-primary">
                <BookOpen className="h-5 w-5" />
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Choose your path</span>
              </div>
              <h2 className="font-serif text-3xl font-bold text-foreground">
                {mode === "signup" ? "Create Your Place in the Vault" : `${selectedActor.title} Access`}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{selectedActor.access}</p>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-black/25 p-1">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${mode === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/10"}`}
              >
                Enter
              </button>
              <button
                type="button"
                disabled={!canSignup}
                onClick={() => canSignup && setMode("signup")}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-white/10"}`}
              >
                Join
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Full Name</label>
                  <input
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-md border border-white/10 bg-black/40 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="yourname@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Your secret word"
                />
              </div>

              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
                  {error}
                </div>
              )}

              <button type="submit" className="w-full rounded-md bg-primary px-6 py-4 font-serif text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90">
                {mode === "signup" ? "Join the Archive" : `Enter as ${selectedActor.title}`}
              </button>
            </form>

            <div className="mt-5 rounded-md border border-white/10 bg-black/25 p-3 text-xs leading-5 text-muted-foreground">
              Demo credentials: <span className="text-foreground">{selectedActor.demo}</span>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
