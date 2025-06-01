"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  {
    name: "Jan",
    sales: 4000,
    expenses: 2400,
  },
  {
    name: "Feb",
    sales: 3000,
    expenses: 1398,
  },
  {
    name: "Mar",
    sales: 2000,
    expenses: 9800,
  },
  {
    name: "Apr",
    sales: 2780,
    expenses: 3908,
  },
  {
    name: "May",
    sales: 1890,
    expenses: 4800,
  },
  {
    name: "Jun",
    sales: 2390,
    expenses: 3800,
  },
  {
    name: "Jul",
    sales: 3490,
    expenses: 4300,
  },
  {
    name: "Aug",
    sales: 4000,
    expenses: 2400,
  },
  {
    name: "Sep",
    sales: 3000,
    expenses: 1398,
  },
  {
    name: "Oct",
    sales: 2000,
    expenses: 9800,
  },
  {
    name: "Nov",
    sales: 2780,
    expenses: 3908,
  },
  {
    name: "Dec",
    sales: 1890,
    expenses: 4800,
  },
]

export function DashboardChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
        <Bar dataKey="sales" fill="#22c55e" name="Sales" />
        <Bar dataKey="expenses" fill="#94a3b8" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  )
}
