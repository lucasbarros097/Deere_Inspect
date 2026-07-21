import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  token: string | null;
  role: string | null;
  username: string | null;
  mustChangePassword: boolean;
  login: (token: string, mustChangePassword?: boolean, username?: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  clearMustChangePassword: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("access_token"));
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem("access_token", token);
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role || "user");
        setUsername(payload.sub || null);
        if (payload.must_change_password) {
          setMustChangePassword(true);
        }
      } catch {
        setRole("user");
      }
    } else {
      localStorage.removeItem("access_token");
      setRole(null);
      setUsername(null);
      setMustChangePassword(false);
    }
  }, [token]);

  const login = (newToken: string, mustChange = false, user = "") => {
    setToken(newToken);
    setMustChangePassword(mustChange);
    if (user) setUsername(user);
    if (mustChange) {
      navigate("/trocar-senha");
    } else {
      navigate("/ferramentas");
    }
  };

  const logout = () => {
    setToken(null);
    navigate("/login");
  };

  const clearMustChangePassword = () => {
    setMustChangePassword(false);
  };

  return (
    <AuthContext.Provider value={{
      token,
      role,
      username,
      mustChangePassword,
      login,
      logout,
      isAuthenticated: !!token,
      clearMustChangePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}