import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthState = {
  isAdmin: boolean;
};

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// Demo account: admin / admin123
const DEMO_USER = "admin";
const DEMO_PASS = "admin123";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("isAdmin");
    setIsAdmin(raw === "true");
  }, []);

  const login = (username: string, password: string) => {
    const ok = username === DEMO_USER && password === DEMO_PASS;
    if (ok) {
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true");
    }
    return ok;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.setItem("isAdmin", "false");
  };

  const value = useMemo(() => ({ isAdmin, login, logout }), [isAdmin]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
