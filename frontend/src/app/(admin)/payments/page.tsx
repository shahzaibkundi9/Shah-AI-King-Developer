"use client";
import React from "react";
import useSWR from "swr";
import api from "@/services/api";
import apiFetcher from "@/lib/fetcher";

export default function PaymentsPage() {
  const { data: accountsData, mutate } = useSWR("/payments/accounts", apiFetcher);
  const accounts = accountsData?.data || [];

  async function createPayment() {
    // demo: create manual payment using first account as method
    const method = accounts[0]?.type || "bank";
    const res = await api.post("/payments/create", { amount: 1000, method });
    alert("Payment instructions sent to user (for demo, response shown in console)");
    console.log(res.data);
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Payment Accounts (Admin)</h3>
          <ul>
            {accounts.map((a: any) => (
              <li key={a.id} className="py-2 border-b">
                <div className="font-medium">{a.type.toUpperCase()}</div>
                <div className="text-xs text-gray-500">{a.number || a.iban}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="col-span-2">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Create Manual Payment (Demo)</h3>
          <p className="text-sm text-gray-500 mb-4">This will generate instructions for the selected method and create a payment record.</p>
          <button onClick={createPayment} className="px-4 py-2 bg-green-600 text-white rounded">Create Payment</button>
        </div>
      </div>
    </div>
  );
}
