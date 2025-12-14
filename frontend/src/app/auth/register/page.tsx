"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/services/api";
import Cookies from "js-cookie";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const router = useRouter();
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", { email, password, name });
      Cookies.set("token", res.data.token);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.response?.data?.error || "Register failed");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form onSubmit={submit} className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Register Admin</h2>
        {err && <div className="text-red-600 mb-2">{err}</div>}
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full p-2 border mb-3 rounded" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border mb-3 rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full p-2 border mb-3 rounded" />
        <button className="w-full py-2 bg-green-600 text-white rounded">Register</button>
      </form>
    </div>
  );
}
