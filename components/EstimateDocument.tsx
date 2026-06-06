"use client";

import { forwardRef } from "react";
import { EstimateData } from "@/types/estimate";
import { numberToWords } from "@/lib/numberToWords";

interface Props {
  data: EstimateData;
}

const row: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "48px",
};

const EstimateDocument = forwardRef<HTMLDivElement, Props>(({ data }, ref) => {
  const items = data.items.map((item) => ({
    ...item,
    amount: (parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0),
  }));

  const subTotal = items.reduce((sum, i) => sum + i.amount, 0);
  const total = subTotal;
  const oldDue = parseFloat(data.oldDue) || 0;
  const received = parseFloat(data.received) || 0;
  const grandTotal = total + oldDue - received;

  const borderCell: React.CSSProperties = {
    border: "1px solid #000",
    padding: "5px 8px",
    fontWeight: "bold",
  };

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: "#fff",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#000",
        width: "100%",
        maxWidth: "700px",
        margin: "0 auto",
        border: "2px solid #000",
        fontSize: "13px",
        boxSizing: "border-box",
      }}
    >
      {/* Company Name & Document Type */}
      <div
        style={{
          borderBottom: "2px solid #000",
          textAlign: "center",
          padding: "8px 10px",
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "20px",
            textDecoration: "underline",
            letterSpacing: "2px",
          }}
        >
          {data.companyName || "SSAA"}
        </div>
        <div style={{ fontWeight: "bold", fontSize: "15px", marginTop: "2px" }}>
          {data.documentType || "ESTIMATION"}
        </div>
      </div>

      {/* Vendor & Contact Info */}
      <div
        style={{
          borderBottom: "1px solid #000",
          padding: "8px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "12px",
        }}
      >
        <div style={{ fontWeight: "bold", fontSize: "13px", paddingTop: "4px" }}>
          VENDOR NAME :{" "}
          {(data.vendorName || "").toUpperCase()}
        </div>
        <div
          style={{
            textAlign: "right",
            fontWeight: "bold",
            lineHeight: "1.7",
            fontSize: "12px",
            flexShrink: 0,
          }}
        >
          <div>CELL NO:{data.cellNo}</div>
          <div>DATE: {data.date}</div>
          <div>INVIOCE NO: {data.invoiceNo}</div>
        </div>
      </div>

      {/* Items Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          <col style={{ width: "9%" }} />
          <col style={{ width: "43%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "17%" }} />
          <col style={{ width: "19%" }} />
        </colgroup>
        <thead>
          <tr style={{ backgroundColor: "#fff" }}>
            <th style={{ ...borderCell, textAlign: "center" }}>S.NO</th>
            <th style={{ ...borderCell, textAlign: "center" }}>ITEM NAME</th>
            <th style={{ ...borderCell, textAlign: "center" }}>QTY</th>
            <th style={{ ...borderCell, textAlign: "center" }}>PRICE</th>
            <th style={{ ...borderCell, textAlign: "center" }}>AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id}>
              <td style={{ ...borderCell, textAlign: "center", fontWeight: "normal" }}>
                {idx + 1}
              </td>
              <td style={{ ...borderCell }}>{item.itemName.toUpperCase()}</td>
              <td style={{ ...borderCell, textAlign: "center", fontWeight: "normal" }}>
                {item.qty}
              </td>
              <td style={{ ...borderCell, textAlign: "center", fontWeight: "normal" }}>
                {item.price}
              </td>
              <td style={{ ...borderCell, textAlign: "center", fontWeight: "normal" }}>
                {item.amount > 0 ? item.amount : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Sub Total */}
      <div
        style={{
          borderTop: "1px solid #000",
          padding: "6px 10px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div style={{ ...row, minWidth: "180px" }}>
          <span style={{ fontWeight: "bold" }}>SUB TOTAL</span>
          <span style={{ fontWeight: "bold" }}>{subTotal}</span>
        </div>
      </div>

      {/* Total / Old Due / Received / Grand Total */}
      <div
        style={{
          borderTop: "1px solid #000",
          padding: "6px 10px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "2px",
        }}
      >
        <div style={{ ...row, minWidth: "180px" }}>
          <span style={{ fontWeight: "bold" }}>TOTAL</span>
          <span style={{ fontWeight: "bold" }}>{total}</span>
        </div>
        <div style={{ ...row, minWidth: "180px" }}>
          <span style={{ fontWeight: "bold" }}>OLD DUE</span>
          <span style={{ fontWeight: "bold" }}>{oldDue > 0 ? oldDue : ""}</span>
        </div>
        <div style={{ ...row, minWidth: "180px" }}>
          <span style={{ fontWeight: "bold" }}>RECEIVED</span>
          <span style={{ fontWeight: "bold" }}>
            {received > 0 ? received : ""}
          </span>
        </div>
        <div style={{ ...row, minWidth: "180px" }}>
          <span style={{ fontWeight: "bold" }}>GRAND TOTAL</span>
          <span style={{ fontWeight: "bold" }}>{grandTotal}</span>
        </div>
      </div>

      {/* Rupees in words */}
      <div
        style={{
          borderTop: "1px solid #000",
          padding: "6px 10px",
          fontWeight: "bold",
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
        }}
      >
        <span>RUPEES:</span>
        <span style={{ textTransform: "uppercase" }}>
          &nbsp;&nbsp;{numberToWords(grandTotal)}.
        </span>
      </div>

      {/* No Warranty Footer */}
      <div
        style={{
          borderTop: "2px solid #000",
          padding: "8px 10px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "13px",
        }}
      >
        {data.footerText || "NO WARRANTY/NO GUARANTY/NO RETURN"}
      </div>

      {/* Authorised Signatory */}
      <div
        style={{
          borderTop: "1px solid #000",
          padding: "40px 10px 10px",
          textAlign: "right",
          fontWeight: "bold",
          fontSize: "13px",
        }}
      >
        AUTHOURISED SIGNATORY
      </div>
    </div>
  );
});

EstimateDocument.displayName = "EstimateDocument";
export default EstimateDocument;
