import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/business", label: "Business setup" },
  { href: "/admin", label: "Admin" },
  { href: "/demo", label: "Demo page" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="app-shell">
      <nav className="top-nav" aria-label="Main navigation">
        <Link className="brand" href="/dashboard">
          <span className="brand-mark">A</span>
          <span>AlwaysBooked AI</span>
        </Link>
        <div className="nav-links">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </main>
  );
}
