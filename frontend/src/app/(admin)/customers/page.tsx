"use client";
import React from "react";
import useSWR from "swr";
import apiFetcher from "@/lib/fetcher";
import CustomerForm from "@/components/forms/CustomerForm";

export default function CustomersPage() {
  const { data, mutate } = useSWR("/customers", apiFetcher);
  const customers = data?.data || [];

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        <CustomerForm onSaved={() => mutate()} />
      </div>
      <div className="col-span-2">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Customers</h3>
          <ul>
            {customers.map((c: any) => (
              <li key={c.id} className="py-2 border-b">
                <div className="font-medium">{c.name || c.phone}</div>
                <div className="text-xs text-gray-500">{c.phone}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
