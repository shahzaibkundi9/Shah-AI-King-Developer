"use client";
import React from "react";
import useSWR from "swr";
import apiFetcher from "@/lib/fetcher";
import ConversationList from "@/components/conversations/ConversationList";

export default function ConversationsPage() {
  const { data } = useSWR("/conversations", apiFetcher);
  const convs = data?.data || [];
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        <ConversationList convs={convs} />
      </div>
      <div className="col-span-2">
        <div className="bg-white rounded shadow p-4">Select a conversation to open chat panel</div>
      </div>
    </div>
  );
}
