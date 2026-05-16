import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

export type UserRole = "visitor" | "contributor" | "reviewer" | "admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type SignupInput = {
  name: string;
  email: string;
  password: string;
  role: Extract<UserRole, "visitor" | "contributor">;
};

type AuthContextValue = {
  user: AuthUser | null;
  login: (role: UserRole, email: string, password: string) => { ok: boolean; message?: string };
  signup: (input: SignupInput) => { ok: boolean; message?: string };
  logout: () => void;
  canSubmit: boolean;
  canReview: boolean;
  canManage: boolean;
};

const SESSION_KEY = "ccpng.session";
const USERS_KEY = "ccpng.users";

const STAFF_ACCOUNTS: Array<AuthUser & { password: string }> = [
  { id: "reviewer-001", name: "Content Reviewer", email: "reviewer@ccpng.test", password: "reviewer123", role: "reviewer" },
  { id: "admin-001", name: "System Admin", email: "admin@ccpng.test", password: "admin123", role: "admin" },
];

const DEFAULT_PUBLIC_ACCOUNTS: Array<AuthUser & { password: string }> = [
  { id: "visitor-001", name: "Guest Visitor", email: "visitor@ccpng.test", password: "visitor123", role: "visitor" },
  { id: "contributor-001", name: "Community Contributor", email: "contributor@ccpng.test", password: "contributor123", role: "contributor" },
];

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUsers(): Array<AuthUser & { password: string }> {
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readSession(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function roleHome(role: UserRole) {
  if (role === "reviewer") return "/review";
  if (role === "admin") return "/admin";
  return "/map";
}

export function getRoleHome(role: UserRole) {
  return roleHome(role);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readSession());

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(() => {
    const login: AuthContextValue["login"] = (role, email, password) => {
      const account = [...STAFF_ACCOUNTS, ...DEFAULT_PUBLIC_ACCOUNTS, ...readStoredUsers()].find(
        (candidate) =>
          candidate.role === role &&
          candidate.email.toLowerCase() === email.trim().toLowerCase() &&
          candidate.password === password,
      );

      if (!account) {
        return { ok: false, message: "Those details do not match the selected actor." };
      }

      const { password: _password, ...safeUser } = account;
      setUser(safeUser);
      return { ok: true };
    };

    const signup: AuthContextValue["signup"] = (input) => {
      const email = input.email.trim().toLowerCase();
      if (!email || input.password.length < 6) {
        return { ok: false, message: "Use a valid email and a password with at least 6 characters." };
      }

      const existing = [...STAFF_ACCOUNTS, ...DEFAULT_PUBLIC_ACCOUNTS, ...readStoredUsers()].some(
        (candidate) => candidate.email.toLowerCase() === email,
      );
      if (existing) {
        return { ok: false, message: "An account with this email already exists." };
      }

      const nextUser = {
        id: `${input.role}-${Date.now()}`,
        name: input.name.trim() || email,
        email,
        password: input.password,
        role: input.role,
      };
      window.localStorage.setItem(USERS_KEY, JSON.stringify([...readStoredUsers(), nextUser]));
      const { password: _password, ...safeUser } = nextUser;
      setUser(safeUser);
      return { ok: true };
    };

    return {
      user,
      login,
      signup,
      logout: () => setUser(null),
      canSubmit: user?.role === "contributor",
      canReview: user?.role === "reviewer" || user?.role === "admin",
      canManage: user?.role === "admin",
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

export function RequireAuth({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user) {
      setLocation("/");
      return;
    }
    if (roles && !roles.includes(user.role)) {
      setLocation(roleHome(user.role));
    }
  }, [roles, setLocation, user]);

  if (!user || (roles && !roles.includes(user.role))) {
    return null;
  }

  return <>{children}</>;
}
