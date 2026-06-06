export interface Product {
  id: string;
  name: string;
  pricePerItem: number;
  quantity: number;
  added_date: string;
  added_by: string;
}

export interface EstimateItem {
  id: string;
  productId: string;
  itemName: string;
  qty: string;
  price: string;
}

export interface EstimateData {
  companyName: string;
  documentType: string;
  cellNo: string;
  date: string;
  invoiceNo: string;
  vendorName: string;
  items: EstimateItem[];
  oldDue: string;
  received: string;
  footerText: string;
}
