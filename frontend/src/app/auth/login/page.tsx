"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Link from "next/link";
import Cookies from "js-cookie";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });

      // ✅ TOKEN KO COOKIES MEIN SAVE KARO
      Cookies.set("token", res.data.token, { expires: 7 });

      router.push("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold text-center">Sign in</h1>
      <p className="text-sm text-gray-500 text-center mt-1">
        Access Admin Panel
      </p>

      {error && (
        <p className="text-red-500 text-sm text-center mt-4">{error}</p>
      )}

      <form onSubmit={handleLogin} className="mt-6 space-y-4">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border"
        />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border"
        />

        <button className="w-full py-3 rounded-lg bg-black text-white">
          {loading ? "Signing in..." : "Get Started"}
        </button>
      </form>

      <p className="text-sm text-center mt-4">
        Don’t have an account?{" "}
        <Link href="/auth/register" className="text-black font-medium">
          Register
        </Link>
      </p>
    </>
  );
}
