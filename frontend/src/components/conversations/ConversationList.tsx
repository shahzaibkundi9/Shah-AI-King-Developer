"use client";
import React from "react";
import Link from "next/link";

export default function ConversationList({ convs }: { convs: any[] }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-semibold mb-2">Conversations</h3>
      <ul>
        {convs.map((c) => (
          <li key={c.id} className="border-b py-2">
            <Link href={`/conversations/${c.id}`} className="flex justify-between">
              <div>
                <div className="font-medium">{c.customer?.name || c.customer?.phone}</div>
                <div className="text-xs text-gray-500">{c.lastMessage || "No messages yet"}</div>
              </div>
              <div className="text-xs text-gray-400">{new Date(c.updatedAt).toLocaleString()}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
