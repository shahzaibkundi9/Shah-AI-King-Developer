"use client";
import React from "react";
import useSWR from "swr";
import apiFetcher from "@/lib/fetcher";
import Card from "@/components/ui/Card";
import { formatDate } from "@/utils/format";

export default function DashboardPage() {
  const { data } = useSWR("/admin/stats", apiFetcher);
  const stats = data?.data || { users: 0, convs: 0, messages: 0 };

  return (
    <div className="grid grid-cols-3 gap-6">
      <Card>
        <h3 className="text-sm text-gray-500">Users</h3>
        <div className="text-2xl font-bold">{stats.users}</div>
      </Card>
      <Card>
        <h3 className="text-sm text-gray-500">Conversations</h3>
        <div className="text-2xl font-bold">{stats.convs}</div>
      </Card>
      <Card>
        <h3 className="text-sm text-gray-500">Messages</h3>
        <div className="text-2xl font-bold">{stats.messages}</div>
      </Card>

      <div className="col-span-3">
        <Card>
          <h3 className="text-lg font-semibold mb-3">Recent AI Logs</h3>
          <div className="space-y-2">
            {data?.data?.aiLogs?.map((l: any) => (
              <div key={l.id} className="flex justify-between">
                <div>
                  <div className="text-sm font-medium">{l.provider} {l.model}</div>
                  <div className="text-xs text-gray-500">{l.promptHash}</div>
                </div>
                <div className="text-xs text-gray-500">{formatDate(l.createdAt)}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
