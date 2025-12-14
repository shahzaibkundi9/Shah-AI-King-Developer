"use client";
import React from "react";
import useSWR from "swr";
import apiFetcher from "@/lib/fetcher";
import TemplateEditor from "@/components/forms/TemplateEditor";

export default function TemplatesPage() {
  const { data, mutate } = useSWR("/ai/templates", apiFetcher);
  const templates = data?.data || [];

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        <TemplateEditor onSaved={() => mutate()} />
      </div>
      <div className="col-span-2">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Templates</h3>
          <ul>
            {templates.map((t: any) => (
              <li key={t.id} className="py-2 border-b">
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-gray-500">{t.description}</div>
                <pre className="text-xs mt-1 bg-slate-50 p-2 rounded">{t.prompt}</pre>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
