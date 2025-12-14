"use client";
import React, { useState } from "react";
import api from "@/services/api";

export default function CustomerForm({ onSaved }: { onSaved?: () => void }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/customers", { phone, name });
    setPhone("");
    setName("");
    onSaved?.();
  }

  return (
    <form onSubmit={save} className="bg-white p-4 rounded shadow space-y-2">
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full p-2 border rounded" />
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full p-2 border rounded" />
      <button className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
    </form>
  );
}
