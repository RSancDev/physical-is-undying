import { Archive, BarChart3, Film, Heart, Home, PlusCircle, Settings, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/collection", label: "Collection", icon: Film },
  { to: "/add", label: "Add", icon: PlusCircle },
  { to: "/recommendations", label: "Recs", icon: Sparkles },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
  { to: "/stats", label: "Stats", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-vault-line bg-vault-bg/88 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-vault-cyan bg-vault-panel2 text-vault-cyan">
              <Archive size={24} />
            </span>
            <span>
              <span className="block text-xl font-bold">4K Vault</span>
              <span className="text-xs text-vault-muted">Physical 4K Ultra HD Blu-ray tracker</span>
            </span>
          </NavLink>
          <nav className="flex gap-1 overflow-x-auto pb-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `btn whitespace-nowrap px-3 py-2 ${isActive ? "border-vault-cyan text-vault-cyan" : "text-vault-muted"}`
                  }
                >
                  <Icon size={16} aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
