"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import useSWR from "swr";
import apiFetcher from "@/lib/fetcher";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

// ✅ REQUIRED: manual registration
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const { data } = useSWR("/admin/stats", apiFetcher);

  const messages = data?.data?.messages || 0;

  const chartData = {
    labels: ["7d", "6d", "5d", "4d", "3d", "2d", "today"],
    datasets: [
      {
        label: "Messages",
        data: [10, 25, 15, 30, 20, 40, messages],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div>
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-3">Conversation Activity</h3>
        <Line data={chartData} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold">AI Performance</h4>
          <p className="text-sm text-gray-500">
            Latency & success rates available in admin logs.
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h4 className="font-semibold">Sales Performance</h4>
          <p className="text-sm text-gray-500">
            Export sales data for reports.
          </p>
        </div>
      </div>
    </div>
  );
}
