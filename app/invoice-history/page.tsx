"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface InvoiceItem {
  itemName: string;
  qty: string;
  price: string;
}

interface Invoice {
  id: string;
  invoice_no: string;
  date: string;
  vendor_name: string;
  company_name: string;
  document_type: string;
  cell_no: string;
  items: InvoiceItem[];
  sub_total: number;
  old_due: number;
  received: number;
  grand_total: number;
  footer_text: string;
  created_at: string;
}

const inputCls =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-shadow";

export default function InvoiceHistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchInvoices = useCallback(async (from: string, to: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (from) params.append("from", from);
      if (to) params.append("to", to);
      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (res.ok) {
        const data: Invoice[] = await res.json();
        setInvoices(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices("", "");
  }, [fetchInvoices]);

  const handleFilter = () => fetchInvoices(fromDate, toDate);

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    fetchInvoices("", "");
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    // YYYY-MM-DD format: parse as local time to avoid UTC midnight timezone shift
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <main className="min-h-screen bg-slate-100 pb-10">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/"
            className="text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 leading-tight">Invoice History</h1>
            <p className="text-xs text-gray-400">All saved invoices</p>
          </div>
          {!loading && (
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
            </span>
          )}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Date filter */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Filter by Date
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                From
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={`${inputCls} w-full`}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                To
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={`${inputCls} w-full`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleFilter}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Apply Filter
            </button>
            {(fromDate || toDate) && (
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* Invoice list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">No invoices found</p>
            <p className="text-xs text-gray-400">
              {fromDate || toDate ? "Try a different date range" : "Download your first estimate to see it here"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                {/* Card header — always visible */}
                <button
                  className="w-full text-left px-4 py-3.5 flex items-center gap-3"
                  onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-purple-600">#{inv.invoice_no}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {inv.vendor_name || "—"}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(inv.date)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-blue-700">
                      ₹{(inv.grand_total ?? 0).toLocaleString()}
                    </p>
                    <svg
                      className={`w-4 h-4 text-gray-400 mt-0.5 ml-auto transition-transform ${expandedId === inv.id ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded detail */}
                {expandedId === inv.id && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <div>
                        <span className="text-gray-400 font-medium">Company</span>
                        <p className="text-gray-700 font-semibold">{inv.company_name || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">Document Type</span>
                        <p className="text-gray-700 font-semibold">{inv.document_type || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">Cell No</span>
                        <p className="text-gray-700 font-semibold">{inv.cell_no || "—"}</p>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">Invoice No</span>
                        <p className="text-gray-700 font-semibold">{inv.invoice_no}</p>
                      </div>
                    </div>

                    {/* Items table */}
                    {inv.items && inv.items.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                          Items
                        </p>
                        <div className="rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-gray-50 text-gray-400 font-semibold uppercase tracking-wide">
                                <th className="text-left px-3 py-2">Item</th>
                                <th className="text-center px-2 py-2">Qty</th>
                                <th className="text-right px-3 py-2">Price</th>
                                <th className="text-right px-3 py-2">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {inv.items.map((item, idx) => {
                                const amount =
                                  (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0);
                                return (
                                  <tr key={idx} className="border-t border-gray-50">
                                    <td className="px-3 py-2 text-gray-700">{item.itemName || "—"}</td>
                                    <td className="px-2 py-2 text-center text-gray-600">{item.qty}</td>
                                    <td className="px-3 py-2 text-right text-gray-600">₹{item.price}</td>
                                    <td className="px-3 py-2 text-right font-semibold text-gray-800">
                                      ₹{amount.toLocaleString()}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Totals summary */}
                    <div className="bg-gray-50 rounded-xl px-3 py-2.5 space-y-1 text-xs">
                      <div className="flex justify-between text-gray-500">
                        <span>Sub Total</span>
                        <span className="font-medium text-gray-700">₹{(inv.sub_total ?? 0).toLocaleString()}</span>
                      </div>
                      {(inv.old_due ?? 0) > 0 && (
                        <div className="flex justify-between text-gray-500">
                          <span>Old Due</span>
                          <span className="font-medium text-gray-700">₹{inv.old_due.toLocaleString()}</span>
                        </div>
                      )}
                      {(inv.received ?? 0) > 0 && (
                        <div className="flex justify-between text-gray-500">
                          <span>Received</span>
                          <span className="font-medium text-gray-700">₹{inv.received.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-900 font-bold border-t border-gray-200 pt-1 mt-1">
                        <span>Grand Total</span>
                        <span className="text-blue-700">₹{(inv.grand_total ?? 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
