"use client";

import { useRef, useState } from "react";
import { EstimateData } from "@/types/estimate";
import EstimateDocument from "./EstimateDocument";

interface Props {
  data: EstimateData;
  onClose: () => void;
}

export default function PreviewModal({ data, onClose }: Props) {
  const docRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!docRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(docRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      } else {
        // Multi-page support
        let yOffset = 0;
        let remainingHeight = imgHeight;
        let isFirstPage = true;

        while (remainingHeight > 0) {
          if (!isFirstPage) pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, -yOffset, imgWidth, imgHeight);
          yOffset += pdfHeight;
          remainingHeight -= pdfHeight;
          isFirstPage = false;
        }
      }

      pdf.save(`estimate-${data.invoiceNo || "document"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70">
      {/* Modal toolbar */}
      <div className="flex items-center justify-between bg-white px-4 py-3 shadow-md flex-shrink-0">
        <h2 className="text-base font-bold text-gray-900">Estimate Preview</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-60 text-sm"
          >
            {downloading ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Generating…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* Scrollable preview area */}
      <div className="flex-1 overflow-y-auto overflow-x-auto bg-gray-700 p-4 md:p-8">
        <div className="min-w-[320px] max-w-2xl mx-auto shadow-2xl">
          <EstimateDocument ref={docRef} data={data} />
        </div>
      </div>

      {/* Bottom bar on mobile for easy access */}
      <div className="md:hidden flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-60 text-base"
        >
          {downloading ? "Generating PDF…" : "Download PDF"}
        </button>
      </div>
    </div>
  );
}
