"use client";


// Header.tsx — top bar
import React from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Header() {
  const router = useRouter();
  function logout() {
    Cookies.remove("token");
    // simple redirect
    router.push("/auth/login");
  }
  return (
    <header className="bg-white border-b p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Shopify WhatsApp AI</h1>
        <span className="text-sm text-gray-500">Admin Panel</span>
      </div>
      <div>
        <button onClick={logout} className="px-3 py-1 rounded bg-red-500 text-white text-sm">
          Logout
        </button>
      </div>
    </header>
  );
}
