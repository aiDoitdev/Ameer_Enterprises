"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EstimateData, EstimateItem, Product } from "@/types/estimate";
import { numberToWords } from "@/lib/numberToWords";
import PreviewModal from "@/components/PreviewModal";

const generateId = () =>
  `item_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const defaultData: EstimateData = {
  companyName: "Ameer Motor Seat Covers",
  documentType: "ESTIMATION",
  cellNo: "9030623730",
  date: new Date().toISOString().split("T")[0],
  invoiceNo: "",
  vendorName: "",
  items: [],
  oldDue: "",
  received: "",
  footerText: "NO WARRANTY/NO GUARANTY/NO RETURN",
};

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-shadow";

const labelCls =
  "block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide";

export default function HomePage() {
  const [data, setData] = useState<EstimateData>(defaultData);
  const [showPreview, setShowPreview] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      if (res.ok) {
        const rows: Product[] = await res.json();
        setProducts(rows.sort((a, b) => a.name.localeCompare(b.name)));
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchNextInvoiceNo = async () => {
    try {
      const res = await fetch("/api/invoices/next-number");
      if (res.ok) {
        const { nextNumber } = await res.json();
        setData((prev) => ({ ...prev, invoiceNo: nextNumber }));
      }
    } catch {
      // silently fail — user can type manually
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchNextInvoiceNo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = <K extends keyof EstimateData>(key: K, value: EstimateData[K]) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const setItem = (id: string, key: keyof EstimateItem, value: string) =>
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, [key]: value } : item
      ),
    }));

  const selectProduct = (itemId: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              productId,
              itemName: product?.name ?? "",
              price: product ? String(product.pricePerItem) : "",
            }
          : item
      ),
    }));
  };

  const addItem = () =>
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: generateId(), productId: "", itemName: "", qty: "", price: "" },
      ],
    }));

  const removeItem = (id: string) =>
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));

  const items = data.items.map((item) => ({
    ...item,
    amount: (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0),
  }));
  const subTotal = items.reduce((s, i) => s + i.amount, 0);

  const qtyErrors = new Map<string, string>();
  data.items.forEach((item) => {
    if (!item.productId || !item.qty) return;
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      const entered = parseFloat(item.qty);
      if (!isNaN(entered) && entered > product.quantity) {
        qtyErrors.set(item.id, `Only ${product.quantity} available`);
      }
    }
  });
  const hasQtyErrors = qtyErrors.size > 0;
  const oldDue = parseFloat(data.oldDue) || 0;
  const received = parseFloat(data.received) || 0;
  const grandTotal = subTotal + oldDue - received;
  const isNegativeTotal = grandTotal < 0;

  return (
    <main className="min-h-screen bg-slate-100 pb-28">
      {/* App header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
            E
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              Estimate Generator
            </h1>
            <p className="text-xs text-gray-400">
              Fill in the details · click Preview to download
            </p>
          </div>

          <Link
            href="/invoice-history"
            className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 active:scale-95 transition-transform shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            History
          </Link>
          <Link
            href="/stock"
            className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 active:scale-95 transition-transform shrink-0"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
              />
            </svg>
            Stock
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Company Info */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Company Info
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Company Name</label>
                <input
                  type="text"
                  value={data.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  className={inputCls}
                  placeholder="e.g. SSAA"
                />
              </div>
              <div>
                <label className={labelCls}>Document Type</label>
                <input
                  type="text"
                  value={data.documentType}
                  onChange={(e) => set("documentType", e.target.value)}
                  className={inputCls}
                  placeholder="e.g. ESTIMATION"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Cell No</label>
                <input
                  type="tel"
                  value={data.cellNo}
                  onChange={(e) => set("cellNo", e.target.value)}
                  className={inputCls}
                  placeholder="Phone"
                />
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input
                  type="date"
                  value={data.date}
                  onChange={(e) => set("date", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Invoice No</label>
                <input
                  type="text"
                  value={data.invoiceNo}
                  onChange={(e) => set("invoiceNo", e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 001"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Vendor & Contact */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Vendor &amp; Contact
          </h2>
          <div>
            <label className={labelCls}>Vendor Name</label>
            <input
              type="text"
              value={data.vendorName}
              onChange={(e) => set("vendorName", e.target.value)}
              className={inputCls}
              placeholder="e.g. Vendor name"
            />
          </div>
        </section>

        {/* Items */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Items
            </h2>
            <button
              onClick={addItem}
              disabled={loadingProducts}
              className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 active:scale-95 transition-transform disabled:opacity-40"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Item
            </button>
          </div>

          {/* Empty state */}
          {data.items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                <svg
                  className="w-7 h-7 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                No items added yet
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Tap the button below to add your first item
              </p>
              <button
                onClick={addItem}
                disabled={loadingProducts}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-40"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {loadingProducts ? "Loading products…" : "Add Item"}
              </button>
            </div>
          )}

          {/* Column headers — only when items exist */}
          {data.items.length > 0 && (
            <div className="hidden sm:grid sm:grid-cols-[1fr_80px_80px_72px_36px] gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 px-1">
              <span>Item</span>
              <span className="text-center">Qty</span>
              <span className="text-center">Price (₹)</span>
              <span className="text-center">Amount</span>
              <span />
            </div>
          )}

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="border border-gray-100 rounded-xl p-3 sm:p-0 sm:border-0 sm:rounded-none"
              >
                {/* Mobile serial + delete */}
                <div className="flex items-center justify-between mb-2 sm:hidden">
                  <span className="text-xs font-bold text-gray-400">
                    Item {idx + 1}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                    aria-label="Remove item"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>

                {/* Mobile stacked layout */}
                <div className="sm:hidden space-y-2">
                  <div>
                    <label className={labelCls}>Item</label>
                    <select
                      value={item.productId}
                      onChange={(e) => selectProduct(item.id, e.target.value)}
                      className={inputCls}
                      disabled={loadingProducts}
                    >
                      <option value="">
                        {loadingProducts ? "Loading…" : "Select an item"}
                      </option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                          {p.name} {p.quantity === 0 ? "(Out of stock)" : `(Qty: ${p.quantity})`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={labelCls}>Qty</label>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          setItem(item.id, "qty", e.target.value)
                        }
                        className={`${inputCls} text-center ${qtyErrors.has(item.id) ? "border-red-400 focus:ring-red-400" : ""}`}
                        placeholder="0"
                        min="1"
                        step="1"
                      />
                      {qtyErrors.has(item.id) && (
                        <p className="text-xs text-red-500 mt-1 font-medium">
                          {qtyErrors.get(item.id)}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>Price</label>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          setItem(item.id, "price", e.target.value)
                        }
                        className={`${inputCls} text-center`}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Amount</label>
                      <div className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm text-center font-semibold bg-gray-50 text-gray-700">
                        {item.amount > 0
                          ? item.amount.toLocaleString()
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop row layout */}
                <div className="hidden sm:grid sm:grid-cols-[1fr_80px_80px_72px_36px] gap-2 items-start">
                  <select
                    value={item.productId}
                    onChange={(e) => selectProduct(item.id, e.target.value)}
                    className={inputCls}
                    disabled={loadingProducts}
                  >
                    <option value="">
                      {loadingProducts ? "Loading…" : "Select an item"}
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                        {p.name} {p.quantity === 0 ? "(Out of stock)" : `(Qty: ${p.quantity})`}
                      </option>
                    ))}
                  </select>
                  <div>
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) => setItem(item.id, "qty", e.target.value)}
                      className={`${inputCls} text-center ${qtyErrors.has(item.id) ? "border-red-400 focus:ring-red-400" : ""}`}
                      placeholder="0"
                      min="1"
                      step="1"
                    />
                    {qtyErrors.has(item.id) && (
                      <p className="text-xs text-red-500 mt-1 text-center font-medium">
                        {qtyErrors.get(item.id)}
                      </p>
                    )}
                  </div>
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      setItem(item.id, "price", e.target.value)
                    }
                    className={`${inputCls} text-center`}
                    placeholder="0"
                    min="0"
                  />
                  <div className="text-center text-sm font-semibold text-gray-700 py-2">
                    {item.amount > 0 ? item.amount.toLocaleString() : "—"}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex justify-center text-red-400 hover:text-red-600 transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sub-total row — only when items exist */}
          {data.items.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-500">
                Sub Total
              </span>
              <span className="text-base font-bold text-gray-900">
                ₹{subTotal.toLocaleString()}
              </span>
            </div>
          )}
        </section>

        {/* Totals */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Totals
          </h2>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center py-1 border-b border-gray-50">
              <span className="text-sm text-gray-500">Sub Total</span>
              <span className="text-sm font-medium text-gray-800">
                ₹{subTotal.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 whitespace-nowrap flex-1">
                Old Due (₹)
              </label>
              <input
                type="number"
                value={data.oldDue}
                onChange={(e) => set("oldDue", e.target.value)}
                className={`${inputCls} w-32 text-right`}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 whitespace-nowrap flex-1">
                Received (₹)
              </label>
              <input
                type="number"
                value={data.received}
                onChange={(e) => set("received", e.target.value)}
                className={`${inputCls} w-32 text-right`}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t-2 border-gray-200">
              <span className="text-sm font-bold text-gray-900">
                Grand Total
              </span>
              <span className={`text-lg font-bold ${isNegativeTotal ? "text-orange-500" : "text-blue-700"}`}>
                ₹{Math.max(0, grandTotal).toLocaleString()}
              </span>
            </div>

            {isNegativeTotal && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-orange-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                <p className="text-xs text-orange-700 font-medium">
                  Received exceeds total — grand total shown as ₹0.
                </p>
              </div>
            )}

            {grandTotal > 0 && (
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-xs text-blue-400 font-medium mb-0.5">
                  Amount in words
                </p>
                <p className="text-sm font-semibold text-blue-900 leading-snug">
                  {numberToWords(grandTotal)} ONLY
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Footer text */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Footer / Disclaimer
          </h2>
          <input
            type="text"
            value={data.footerText}
            onChange={(e) => set("footerText", e.target.value)}
            className={inputCls}
            placeholder="NO WARRANTY/NO GUARANTY/NO RETURN"
          />
        </section>
      </div>

      {/* Sticky Preview button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 px-4 py-3 shadow-xl z-10">
        <div className="max-w-2xl mx-auto">
          {hasQtyErrors && (
            <p className="text-xs text-red-500 font-medium text-center mb-2">
              Fix quantity errors before previewing
            </p>
          )}
          {!hasQtyErrors && data.items.length === 0 && (
            <p className="text-xs text-amber-500 font-medium text-center mb-2">
              No items added — the estimate will be empty
            </p>
          )}
          <button
            onClick={() => setShowPreview(true)}
            disabled={hasQtyErrors}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold text-base tracking-wide transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Preview Estimate
          </button>
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <PreviewModal
          data={data}
          onClose={() => setShowPreview(false)}
          onStockReduced={() => {
            setLoadingProducts(true);
            fetchProducts();
          }}
        />
      )}
    </main>
  );
}
