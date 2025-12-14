"use client";
import React, { useState } from "react";
import api from "@/services/api";

export default function TemplateEditor({ onSaved }: { onSaved?: () => void }) {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api.post("/ai/templates", { name, prompt, description: "" });
    setName("");
    setPrompt("");
    onSaved?.();
  }

  return (
    <form onSubmit={save} className="bg-white p-4 rounded shadow space-y-2">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Template name" className="w-full p-2 border rounded" />
      <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Prompt body" className="w-full p-2 border rounded" />
      <button className="px-4 py-2 bg-blue-600 text-white rounded">Save Template</button>
    </form>
  );
}
