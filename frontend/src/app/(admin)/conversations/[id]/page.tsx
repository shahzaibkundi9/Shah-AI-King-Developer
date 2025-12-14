"use client";
import React from "react";
import ChatPanel from "@/components/conversations/ChatPanel";


export default function ConvPage({ params }: { params: { id: string } }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        {/* left: recent convs */}
      </div>
      <div className="col-span-2">
        <ChatPanel conversationId={params.id} />
      </div>
    </div>
  );
}
