
export type PaymentMethod = 'cash' | 'cheque' | 'transfer';

export interface PaymentHistory {
  receiptNumber: string;
  date: string;
  amount: number;
  method: string;
}

export interface ReceiptData {
  id: string;
  companyName: string;
  companyLogo: string | null;
  receiptNumber: string;
  receiptDate: string;
  clientName: string;
  totalPrice: number | null;
  paidAmount: number | null;
  purpose: string;
  paymentMethod: PaymentMethod;
  chequeNumber?: string;
  bankName?: string;
  chequeDate?: string;
  transactionRef?: string;
  transferDate?: string;
  signature: string | null;
  stamp: string | null;
  createdAt: number;
  previousPayments: PaymentHistory[];
  parentId?: string; // Links to the first receipt in the chain
}

export type ViewType = 'dashboard' | 'editor' | 'list';

export interface AppState {
  currentView: ViewType;
  editingId: string | null;
}
