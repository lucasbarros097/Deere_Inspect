import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import { Home, Users, Settings, LogOut } from "lucide-react";

/**
 * Modern responsive navbar:
 * - Bottom tab bar on mobile (fixed at bottom)
 * - Side/Top bar on desktop
 */
export default function Navbar() {
  const { role, logout, username } = useAuth();
  const location = useLocation();

  const navItems = [
    { to: "/", icon: Home, label: "Home", exact: true },
    { to: "/sobre-nos", icon: Users, label: "Sobre Nós" },
    { to: "/ferramentas", icon: Settings, label: "Ferramentas" },
  ];

  if (role === "admin") {
    navItems.push({ to: "/admin", icon: Settings, label: "Admin" });
  }

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 ${
                isActive(item.to, item.exact)
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop Top Nav */}
      <nav className="hidden md:block sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo / Brand */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Settings className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground text-sm">Deere Inspect</span>
            </div>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive(item.to, item.exact)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                </NavLink>
              ))}
            </div>

            {/* User info & logout */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden lg:block">
                {username}
              </span>
              <button
                onClick={logout}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}