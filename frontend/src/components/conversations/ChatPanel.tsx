"use client";
import React, { useEffect, useState, useRef } from "react";
import api from "@/services/api";
import useSWR from "swr";
import apiFetcher from "@/lib/fetcher";
import socket from "@/lib/socket";

export default function ChatPanel({ conversationId }: { conversationId: string }) {
  const { data, mutate } = useSWR(`/conversations/${conversationId}/messages`, apiFetcher);
  const messages = data?.data || [];
  const [text, setText] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.emit("join_user", "admin"); // join admin room
    socket.on("message:new", (payload: any) => {
      if (payload.conversationId === conversationId) mutate();
    });
    return () => {
      socket.off("message:new");
    };
  }, [conversationId, mutate]);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send() {
    if (!text) return;
    await api.post(`/conversations/${conversationId}/send`, { text });
    setText("");
    mutate();
  }

  return (
    <div className="bg-white rounded shadow p-4 flex flex-col h-[60vh]">
      <div className="flex-1 overflow-auto space-y-3">
        {messages.map((m: any) => (
          <div key={m.id} className={`p-2 rounded ${m.direction === "IN" ? "bg-slate-100" : "bg-blue-50 self-end"}`}>
            <div className="text-sm">{m.body}</div>
            <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</div>
          </div>
        ))}
        <div ref={ref} />
      </div>
      <div className="mt-3 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Type a reply..." />
        <button onClick={send} className="px-4 py-2 bg-blue-600 text-white rounded">Send</button>
      </div>
    </div>
  );
}
