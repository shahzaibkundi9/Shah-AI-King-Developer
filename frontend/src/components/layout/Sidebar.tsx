// Sidebar.tsx — main navigation
import Link from "next/link";
import React from "react";
export default function Sidebar() {
  const items = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/conversations", label: "Conversations" },
    { href: "/customers", label: "Customers" },
    { href: "/payments", label: "Payments" },
    { href: "/templates", label: "Templates" },
    { href: "/analytics", label: "Analytics" }
  ];
  return (
    <aside className="w-64 bg-slate-800 text-white min-h-screen">
      <div className="p-4 border-b">
        <div className="text-xl font-bold">Shah AI King</div>
        <div className="text-xs text-slate-300">Admin</div>
      </div>
      <nav className="p-4">
        {items.map((it) => (
          <div key={it.href} className="mb-2">
            <Link className="block p-2 rounded hover:bg-slate-700" href={it.href}>
              {it.label}
            </Link>
          </div>
        ))}
      </nav>
    </aside>
  );
}
