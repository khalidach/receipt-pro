import { Receipt, CompanyProfile, PaymentRecord } from "../types/receipt";
import { tafqeetDirham } from "./tafqeet";

const STORAGE_KEYS = {
  RECEIPTS: "ar_receipt_pro_receipts",
  COMPANY_PROFILE: "ar_receipt_pro_company",
  LAST_RECEIPT_NUM: "ar_receipt_pro_last_num",
};

// Default Company Profile matching standard Moroccan commerce
export const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  name: "اسم الشركة",
  nameEn: "OFFICIAL PAYMENT RECEIPT",
  subtitle: "سند قبض مالي",
  currencyName: "درهم مغربي",
  currencySymbol: "dh",
  currencySubUnit: "سنتيم",
  phone: "+212 5XX-XXXXXX",
  address: "شارع الحسن الثاني، الدار البيضاء، المغرب",
  taxNumber: "ICE: 002134567890001",
};

// Initial Seed Data matching the user's reference photo (R-712860, 2026-11-01)
export const SEED_RECEIPTS: Receipt[] = [
  {
    id: "receipt-712860",
    receiptNumber: "R-712860",
    date: "2026-11-01",
    clientName: "السيد / محمد العمراني",
    totalAmount: 15000,
    paidAmount: 5000,
    remainingAmount: 10000,
    amountInWords: tafqeetDirham(5000),
    purpose:
      "دفعة أولى لتوريد وتثبيت معدات مكتبية وأنظمة معلوماتية متطورة بمقر الشركة",
    paymentMethod: "cash",
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
  },
  {
    id: "receipt-712861",
    receiptNumber: "R-712861",
    date: "2026-11-01",
    clientName: "شركة الأطلس للاستثمار العقاري",
    totalAmount: 48000,
    paidAmount: 24000,
    remainingAmount: 24000,
    amountInWords: tafqeetDirham(24000),
    purpose: "قسط ربع سنوي عن إيجار المحل التجاري الكائن بالمركز التجاري البرج",
    paymentMethod: "cheque",
    chequeDetails: {
      chequeNumber: "CHQ-884920",
      bankName: "التجاري وفا بنك (Attijariwafa Bank)",
      chequeDate: "2026-11-05",
    },
    createdAt: "2026-11-01T11:15:00Z",
    updatedAt: "2026-11-01T11:15:00Z",
  },
  {
    id: "receipt-712862",
    receiptNumber: "R-712862",
    date: "2026-10-28",
    clientName: "سارة العلمي",
    totalAmount: 7500,
    paidAmount: 7500,
    remainingAmount: 0,
    amountInWords: tafqeetDirham(7500),
    purpose: "أتعاب استشارات وتصميم هوية بصرية كاملة مع دليل العلامة التجارية",
    paymentMethod: "bank_transfer",
    bankTransferDetails: {
      transactionNumber: "TRF-BMCE-99214",
      bankName: "بنك إفريقيا (Bank of Africa)",
      transferDate: "2026-10-28",
    },
    createdAt: "2026-10-28T09:30:00Z",
    updatedAt: "2026-10-28T09:30:00Z",
  },
  {
    id: "receipt-712863",
    receiptNumber: "R-712863",
    date: "2026-11-01",
    clientName: "السيد / خالد اشبوخ",
    totalAmount: 36000,
    paidAmount: 12000,
    remainingAmount: 24000,
    amountInWords: tafqeetDirham(12000),
    purpose:
      "حجز رحلة عمرة شاملة تذاكر الطيران والإقامة الفندقية بمكة والمدينة والنقل",
    paymentMethod: "bank_transfer",
    hasTravelers: true,
    travelers: ["خالد اشبوخ", "نوال اشبوخ", "سعيد اشبوخ"],
    bankTransferDetails: {
      transactionNumber: "VIR-ATTIJARI-55102",
      bankName: "التجاري وفا بنك",
      transferDate: "2026-11-01",
    },
    createdAt: "2026-11-01T11:45:00Z",
    updatedAt: "2026-11-01T11:45:00Z",
  },
];

/**
 * Storage helpers with LocalStorage & fallbacks
 */
export function getStoredReceipts(): Receipt[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    if (!data) {
      localStorage.setItem(
        STORAGE_KEYS.RECEIPTS,
        JSON.stringify(SEED_RECEIPTS),
      );
      return SEED_RECEIPTS;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read receipts from localStorage:", error);
    return SEED_RECEIPTS;
  }
}

export function saveReceipts(receipts: Receipt[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  } catch (error) {
    console.error("Failed to save receipts:", error);
  }
}

export function getCompanyProfile(): CompanyProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILE);
    if (!data) {
      localStorage.setItem(
        STORAGE_KEYS.COMPANY_PROFILE,
        JSON.stringify(DEFAULT_COMPANY_PROFILE),
      );
      return DEFAULT_COMPANY_PROFILE;
    }
    return { ...DEFAULT_COMPANY_PROFILE, ...JSON.parse(data) };
  } catch (error) {
    console.error("Failed to read company profile:", error);
    return DEFAULT_COMPANY_PROFILE;
  }
}

export function saveCompanyProfile(profile: CompanyProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.COMPANY_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save company profile:", error);
  }
}

/**
 * Generate sequential or unique receipt numbers (e.g. R-712860)
 */
export function generateNextReceiptNumber(): string {
  const receipts = getStoredReceipts();
  if (receipts.length === 0) {
    return "R-712860";
  }

  // Find max numeric suffix if R-XXXXXX pattern exists
  const numbers = receipts
    .map((r) => {
      const match = r.receiptNumber.match(/R-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n) && n > 0);

  if (numbers.length > 0) {
    const maxNum = Math.max(...numbers);
    return `R-${maxNum + 1}`;
  }

  // Fallback 6-digit random
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `R-${rand}`;
}

/**
 * Add a new receipt
 */
export function addReceipt(receipt: Receipt): Receipt {
  const receipts = getStoredReceipts();
  const updated = [receipt, ...receipts];
  saveReceipts(updated);
  return receipt;
}

/**
 * Update an existing receipt
 */
export function updateReceipt(receipt: Receipt): void {
  const receipts = getStoredReceipts();
  const index = receipts.findIndex((r) => r.id === receipt.id);
  if (index !== -1) {
    receipts[index] = { ...receipt, updatedAt: new Date().toISOString() };
    saveReceipts(receipts);
  }
}

/**
 * Delete a receipt
 * If this receipt is an installment (child receipt), deduct its amount from the parent receipt
 */
export function deleteReceipt(id: string): void {
  const receipts = getStoredReceipts();
  const toDelete = receipts.find((r) => r.id === id);
  if (!toDelete) return;

  let updatedList = receipts.filter((r) => r.id !== id);

  // If the deleted receipt is a child/installment of a parent receipt
  if (toDelete.parentReceiptId) {
    const parentIndex = updatedList.findIndex(
      (r) => r.id === toDelete.parentReceiptId,
    );
    if (parentIndex !== -1) {
      const parent = updatedList[parentIndex];
      const newPaid = Math.max(0, parent.paidAmount - toDelete.paidAmount);
      const newRemaining = Math.max(
        0,
        (parent.totalAmount || parent.paidAmount) - newPaid,
      );
      const updatedInstallments = (parent.installments || []).filter(
        (inst) =>
          inst.id !== toDelete.id &&
          !(inst.amount === toDelete.paidAmount && inst.date === toDelete.date),
      );

      updatedList[parentIndex] = {
        ...parent,
        paidAmount: newPaid,
        remainingAmount: newRemaining,
        amountInWords: tafqeetDirham(newPaid),
        installments: updatedInstallments,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  saveReceipts(updatedList);
}

/**
 * Delete an installment from a parent receipt's chain
 * Deducts the installment amount from the parent receipt and deletes the corresponding child receipt
 */
export function deleteInstallmentFromParent(
  parentReceiptId: string,
  installmentId: string,
): Receipt | null {
  const receipts = getStoredReceipts();
  const parentIndex = receipts.findIndex((r) => r.id === parentReceiptId);
  if (parentIndex === -1) return null;

  const parent = receipts[parentIndex];
  const targetRecord = (parent.installments || []).find(
    (inst) => inst.id === installmentId,
  );
  if (!targetRecord) return parent;

  const deductedAmount = targetRecord.amount;
  const newPaid = Math.max(0, parent.paidAmount - deductedAmount);
  const newRemaining = Math.max(
    0,
    (parent.totalAmount || parent.paidAmount) - newPaid,
  );
  const updatedInstallments = (parent.installments || []).filter(
    (inst) => inst.id !== installmentId,
  );

  const updatedParent: Receipt = {
    ...parent,
    paidAmount: newPaid,
    remainingAmount: newRemaining,
    amountInWords: tafqeetDirham(newPaid),
    installments: updatedInstallments,
    updatedAt: new Date().toISOString(),
  };

  // Also remove the corresponding child receipt if present
  const updatedList = receipts
    .filter((r) => r.id !== installmentId)
    .map((r) => (r.id === parent.id ? updatedParent : r));

  saveReceipts(updatedList);
  return updatedParent;
}

/**
 * Add an installment to a parent receipt and record a new child receipt for it
 */
export function recordInstallment(
  parentReceiptId: string,
  installmentAmount: number,
  paymentMethod: Receipt["paymentMethod"],
  notes?: string,
  chequeDetails?: Receipt["chequeDetails"],
  bankTransferDetails?: Receipt["bankTransferDetails"],
  signatureImage?: string,
  customReceiptNumber?: string,
): { childReceipt: Receipt; parentReceipt: Receipt } {
  const receipts = getStoredReceipts();
  const parent = receipts.find((r) => r.id === parentReceiptId);
  if (!parent) {
    throw new Error("Parent receipt not found");
  }

  const currentDate = new Date().toISOString().split("T")[0];
  const newReceiptNumber =
    (customReceiptNumber && customReceiptNumber.trim()) ||
    generateNextReceiptNumber();
  const childId = `receipt-${Date.now()}`;

  // Create payment record in parent's history linked to child receipt ID
  const paymentRecord: PaymentRecord = {
    id: childId,
    date: currentDate,
    amount: installmentAmount,
    paymentMethod,
    chequeDetails,
    bankTransferDetails,
    notes,
  };

  const existingHistory = parent.installments || [];
  const updatedHistory = [...existingHistory, paymentRecord];

  // Total paid so far = initial paid + sum of installments
  const newPaidTotal = parent.paidAmount + installmentAmount;
  const newRemaining = Math.max(
    0,
    (parent.totalAmount || parent.paidAmount) - newPaidTotal,
  );

  const updatedParent: Receipt = {
    ...parent,
    paidAmount: newPaidTotal,
    remainingAmount: newRemaining,
    amountInWords: tafqeetDirham(newPaidTotal),
    installments: updatedHistory,
    updatedAt: new Date().toISOString(),
  };

  // Create the new standalone receipt for this specific installment payment
  const childReceipt: Receipt = {
    id: childId,
    receiptNumber: newReceiptNumber,
    date: currentDate,
    clientName: parent.clientName,
    totalAmount: parent.totalAmount,
    previousRemainingAmount: parent.remainingAmount, // المبلغ المتبقي في الدفعة الأخيرة (إلزامي في القسط)
    paidAmount: installmentAmount, // المبلغ الحالي
    remainingAmount: newRemaining, // المبلغ المتبقي = المبلغ المتبقي في الدفعة الأخيرة - المبلغ الحالي
    amountInWords: tafqeetDirham(installmentAmount),
    purpose: `دفعة مالية تابعة للسند رقم (${parent.receiptNumber}) - ${parent.purpose}${notes ? ` - ${notes}` : ""}`,
    paymentMethod,
    chequeDetails,
    bankTransferDetails,
    parentReceiptId: parent.id,
    hasTravelers: parent.hasTravelers,
    travelers: parent.travelers,
    signatureImage,
    stampImage: parent.stampImage,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const newReceiptsList = [
    childReceipt,
    ...receipts.map((r) => (r.id === parent.id ? updatedParent : r)),
  ];

  saveReceipts(newReceiptsList);
  return { childReceipt, parentReceipt: updatedParent };
}
