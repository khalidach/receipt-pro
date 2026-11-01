export type PaymentMethodType =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'cheque'
  | 'promissory_note'
  | 'bank_transfer'
  | 'cash_deposit';

export interface ChequeDetails {
  personName?: string; // اسم الشخص / الساحب
  chequeNumber: string; // رقم الشيك
  bankName: string; // اسم البنك
  chequeDate?: string; // تاريخ الشيك (اختياري)
}

export interface PromissoryNoteDetails {
  personName?: string; // اسم الشخص
  noteNumber: string; // رقم الكمبيالة
  bankName: string; // اسم البنك
  dueDate: string; // تاريخ الاستحقاق
}

export interface BankTransferDetails {
  personName?: string; // اسم الشخص
  bankName: string; // اسم البنك
  transferDate: string; // تاريخ التحويل
  transactionNumber?: string; // رقم العملية (اختياري)
}

export interface CashDepositDetails {
  personName?: string; // اسم الشخص
  depositNumber: string; // رقم الإيداع
  depositDate: string; // تاريخ الإيداع
  bankName?: string; // اسم البنك (اختياري)
}

export interface CardDetails {
  cardType?: string; // بطاقة ائتمان / بطاقة خصم مباشر
  transactionNumber?: string; // رقم الإيصال / التفويض
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  paymentMethod: PaymentMethodType;
  chequeDetails?: ChequeDetails;
  promissoryNoteDetails?: PromissoryNoteDetails;
  bankTransferDetails?: BankTransferDetails;
  cashDepositDetails?: CashDepositDetails;
  cardDetails?: CardDetails;
  notes?: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string; // e.g. R-712860
  date: string; // YYYY-MM-DD
  clientName: string; // وصلنا من السيد / السادة
  totalAmount?: number; // إجمالي العقد / المطلوب (اختياري)
  previousRemainingAmount?: number; // المبلغ المتبقي في الدفعة الأخيرة (اختياري في السند الجديد، إلزامي في القسط)
  paidAmount: number; // المبلغ الحالي / المدفوع
  remainingAmount?: number; // المبلغ المتبقي (يظهر فقط إذا كان إجمالي العقد موجوداً)
  amountInWords: string; // تفقيط المبلغ بالدرهم المغربي
  purpose: string; // وذلك مقابل / عن
  paymentMethod: PaymentMethodType;
  chequeDetails?: ChequeDetails;
  promissoryNoteDetails?: PromissoryNoteDetails;
  bankTransferDetails?: BankTransferDetails;
  cashDepositDetails?: CashDepositDetails;
  cardDetails?: CardDetails;
  signatureImage?: string; // Base64 data URL
  stampImage?: string; // Base64 data URL
  
  // Optional Travelers List (أسماء المسافرين)
  hasTravelers?: boolean;
  travelers?: string[];

  // Installment chain tracking
  parentReceiptId?: string; // If this is an installment of an earlier receipt
  installments?: PaymentRecord[]; // List of previous payments or installment history
  
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyProfile {
  name: string; // e.g. شركة النور للتجارة والخدمات
  nameEn?: string; // Official Payment Receipt
  subtitle?: string; // سند قبض مالي
  logoUrl?: string; // Base64 data URL or path
  stampUrl?: string; // Base64 data URL for official stamp
  address?: string;
  phone?: string;
  email?: string;
  taxNumber?: string; // ICE / RC / IF
  currencyName: string; // درهم مغربي
  currencySymbol: string; // dh / د.م
  currencySubUnit: string; // سنتيم
}
