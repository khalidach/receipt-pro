import { Receipt, CompanyProfile, PaymentRecord } from "../types/receipt";
import { tafqeetDirham } from "./tafqeet";
import "../types/electron.d.ts";

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
export const SEED_RECEIPTS: Receipt[] = [];

/**
 * Storage helpers with LocalStorage & fallbacks
 */
/**
 * Storage helpers with LocalStorage & fallbacks
 */
export function getInitialPaidAmount(receipt: Receipt): number {
  if (
    receipt.initialPaidAmount !== undefined &&
    receipt.initialPaidAmount !== null
  ) {
    return receipt.initialPaidAmount;
  }
  const childInstallments = (receipt.installments || []).reduce(
    (sum, inst) => sum + (inst.amount || 0),
    0,
  );
  if (receipt.paidAmount > childInstallments) {
    return receipt.paidAmount - childInstallments;
  }
  if (receipt.totalAmount && receipt.remainingAmount !== undefined) {
    const calculated =
      receipt.totalAmount - receipt.remainingAmount - childInstallments;
    if (calculated >= 0) return calculated;
  }
  return receipt.paidAmount;
}

/**
 * Synchronize all parent receipts and their installment chains.
 * Ensures:
 * 1. Sequential order of installments: updates previousRemainingAmount & stepRemainingAmount.
 * 2. Parent's paidAmount equals initial down-payment + sum of existing installments.
 * 3. Parent's remainingAmount equals totalAmount - paidAmount.
 * 4. When a contract is fully paid (remainingAmount === 0), ALL installments in the chain are marked as paid (remainingAmount: 0).
 * 5. When an installment is deleted, all remaining installments automatically recalculate their remaining amount and previous balance.
 * 6. Sibling installments stay 100% consistent across the app.
 */
export function syncReceipts(receipts: Receipt[]): Receipt[] {
  const parents = receipts.filter((r) => !r.parentReceiptId);
  const children = receipts.filter((r) => Boolean(r.parentReceiptId));

  const updatedReceipts: Receipt[] = [];

  for (const parent of parents) {
    const parentCopy: Receipt = { ...parent };
    const parentChildren = children
      .filter((c) => c.parentReceiptId === parentCopy.id)
      .sort((a, b) => {
        const dateA = a.date || "";
        const dateB = b.date || "";
        if (dateA !== dateB) return dateA.localeCompare(dateB);
        const timeA = a.createdAt || "";
        const timeB = b.createdAt || "";
        return timeA.localeCompare(timeB);
      });

    // If no contract total amount, keep as standalone receipt
    if (!parentCopy.totalAmount || parentCopy.totalAmount <= 0) {
      updatedReceipts.push(parentCopy);
      parentChildren.forEach((c) => updatedReceipts.push({ ...c }));
      continue;
    }

    const totalContract = parentCopy.totalAmount;
    const initialPaid = getInitialPaidAmount(parentCopy);
    parentCopy.initialPaidAmount = initialPaid;

    let runningRemaining = Math.max(0, totalContract - initialPaid);
    let totalInstallmentsPaid = 0;
    const updatedPaymentRecords: PaymentRecord[] = [];
    const updatedChildren: Receipt[] = [];

    for (const child of parentChildren) {
      const childCopy: Receipt = { ...child };
      const prevRemaining = runningRemaining;
      const childAmt = childCopy.paidAmount || 0;
      totalInstallmentsPaid += childAmt;
      runningRemaining = Math.max(0, runningRemaining - childAmt);

      childCopy.totalAmount = totalContract;
      childCopy.clientName = parentCopy.clientName;
      childCopy.previousRemainingAmount = prevRemaining;
      childCopy.stepRemainingAmount = runningRemaining;
      childCopy.remainingAmount = runningRemaining;

      updatedPaymentRecords.push({
        id: childCopy.id,
        date: childCopy.date,
        amount: childAmt,
        paymentMethod: childCopy.paymentMethod,
        chequeDetails: childCopy.chequeDetails,
        promissoryNoteDetails: childCopy.promissoryNoteDetails,
        bankTransferDetails: childCopy.bankTransferDetails,
        cashDepositDetails: childCopy.cashDepositDetails,
        cardDetails: childCopy.cardDetails,
        notes: childCopy.notes,
      });

      updatedChildren.push(childCopy);
    }

    const totalPaidContract = initialPaid + totalInstallmentsPaid;
    const contractRemaining = Math.max(0, totalContract - totalPaidContract);

    parentCopy.paidAmount = totalPaidContract;
    parentCopy.remainingAmount = contractRemaining;
    parentCopy.amountInWords = tafqeetDirham(totalPaidContract);
    parentCopy.installments = updatedPaymentRecords;

    // Synchronize remaining balance across all installments of this contract
    for (const child of updatedChildren) {
      if (contractRemaining === 0) {
        child.remainingAmount = 0;
      } else {
        child.remainingAmount = contractRemaining;
      }
    }

    updatedReceipts.push(parentCopy);
    updatedReceipts.push(...updatedChildren);
  }

  // Any orphaned child receipts whose parent doesn't exist
  const orphanChildren = children.filter(
    (c) => !parents.some((p) => p.id === c.parentReceiptId),
  );
  updatedReceipts.push(...orphanChildren);

  const idToUpdated = new Map(updatedReceipts.map((r) => [r.id, r]));
  return receipts
    .map((r) => idToUpdated.get(r.id) || r)
    .filter((r, idx, self) => self.findIndex((s) => s.id === r.id) === idx);
}

export function getStoredReceipts(): Receipt[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    if (!data) {
      const syncedSeed = syncReceipts(SEED_RECEIPTS);
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(syncedSeed));
      return syncedSeed;
    }
    const parsed = JSON.parse(data);
    const synced = syncReceipts(parsed);
    return synced;
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

  // Persist directly to SQLite
  if (typeof window !== "undefined" && window.electronAPI?.db?.saveReceipts) {
    window.electronAPI.db.saveReceipts(receipts).catch((err: any) => {
      console.error("[SQLite] Failed to persist receipts to SQLite:", err);
    });
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

  // Persist directly to SQLite
  if (typeof window !== "undefined" && window.electronAPI?.db?.saveCompanyProfile) {
    window.electronAPI.db.saveCompanyProfile(profile).catch((err: any) => {
      console.error("[SQLite] Failed to persist company profile to SQLite:", err);
    });
  }
}

/**
 * Initialize storage from SQLite database on app start
 * Automatically migrates existing localStorage receipts to SQLite if SQLite is fresh.
 */
export async function initStorageFromSQLite(): Promise<{
  receipts: Receipt[];
  company: CompanyProfile;
}> {
  if (typeof window !== "undefined" && window.electronAPI?.db) {
    try {
      const data = await window.electronAPI.db.getAll();

      // If SQLite already has receipts, load and cache them
      if (data && data.receipts && data.receipts.length > 0) {
        const synced = syncReceipts(data.receipts);
        localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(synced));
        if (data.company) {
          localStorage.setItem(
            STORAGE_KEYS.COMPANY_PROFILE,
            JSON.stringify(data.company),
          );
        }
        return {
          receipts: synced,
          company: data.company || getCompanyProfile(),
        };
      }

      // If SQLite has no receipts yet, check if there are existing localStorage records to migrate!
      const localReceiptsRaw = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
      if (localReceiptsRaw) {
        try {
          const localReceipts = JSON.parse(localReceiptsRaw);
          if (Array.isArray(localReceipts) && localReceipts.length > 0) {
            console.log("[SQLite] Migrating existing receipts to SQLite...");
            await window.electronAPI.db.saveReceipts(localReceipts);
          }
        } catch (e) {
          console.error("[SQLite] Migration error:", e);
        }
      }

      const localCompanyRaw = localStorage.getItem(STORAGE_KEYS.COMPANY_PROFILE);
      if (localCompanyRaw) {
        try {
          const localCompany = JSON.parse(localCompanyRaw);
          if (localCompany && localCompany.name) {
            console.log("[SQLite] Migrating company profile to SQLite...");
            await window.electronAPI.db.saveCompanyProfile(localCompany);
          }
        } catch (e) {
          console.error("[SQLite] Migration error:", e);
        }
      }
    } catch (err) {
      console.error("[SQLite] Failed to initialize from SQLite:", err);
    }
  }

  return {
    receipts: getStoredReceipts(),
    company: getCompanyProfile(),
  };
}

/**
 * Backup the active SQLite database
 */
export async function backupDatabase(): Promise<{
  success: boolean;
  filePath?: string;
  canceled?: boolean;
  error?: string;
}> {
  if (typeof window !== "undefined" && window.electronAPI?.db?.backup) {
    return window.electronAPI.db.backup();
  }

  // Web fallback: download JSON
  try {
    const receipts = getStoredReceipts();
    const company = getCompanyProfile();
    const blob = new Blob([JSON.stringify({ receipts, company }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `سند_برو_نسخة_احتياطية_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Restore SQLite database from a selected backup file
 */
export async function restoreDatabase(): Promise<{
  success: boolean;
  receiptsCount?: number;
  canceled?: boolean;
  error?: string;
}> {
  if (typeof window !== "undefined" && window.electronAPI?.db?.restore) {
    const res = await window.electronAPI.db.restore();
    if (res.success) {
      await initStorageFromSQLite();
    }
    return res;
  }
  return { success: false, error: "Only available in Electron desktop app" };
}

/**
 * Get SQLite database statistics
 */
export async function getDatabaseInfo() {
  if (typeof window !== "undefined" && window.electronAPI?.db?.getInfo) {
    return window.electronAPI.db.getInfo();
  }
  return null;
}

/**
 * Reveal database file in File Explorer
 */
export async function openDatabaseFolder() {
  if (typeof window !== "undefined" && window.electronAPI?.db?.openFolder) {
    return window.electronAPI.db.openFolder();
  }
  return false;
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
  const toAdd: Receipt = {
    ...receipt,
    initialPaidAmount: receipt.initialPaidAmount ?? receipt.paidAmount,
  };
  const updated = [toAdd, ...receipts];
  const synced = syncReceipts(updated);
  saveReceipts(synced);
  return synced.find((r) => r.id === receipt.id) || toAdd;
}

/**
 * Update an existing receipt
 */
export function updateReceipt(receipt: Receipt): void {
  const receipts = getStoredReceipts();
  const index = receipts.findIndex((r) => r.id === receipt.id);
  if (index !== -1) {
    receipts[index] = { ...receipt, updatedAt: new Date().toISOString() };
    const synced = syncReceipts(receipts);
    saveReceipts(synced);
  }
}

/**
 * Delete a receipt
 * If this receipt is an installment (child receipt), deduct its amount and resync all remaining installments
 * If this receipt is a parent receipt, cascade-delete all its child installments
 */
export function deleteReceipt(id: string): void {
  const receipts = getStoredReceipts();
  const toDelete = receipts.find((r) => r.id === id);
  if (!toDelete) return;

  let remainingList: Receipt[];
  if (toDelete.parentReceiptId) {
    remainingList = receipts.filter((r) => r.id !== id);
  } else {
    // Delete parent and all its child installments
    remainingList = receipts.filter(
      (r) => r.id !== id && r.parentReceiptId !== id,
    );
  }

  const synced = syncReceipts(remainingList);
  saveReceipts(synced);
}

/**
 * Delete an installment from a parent receipt's chain
 * Deducts the installment amount and re-synchronizes all remaining installments and parent
 */
export function deleteInstallmentFromParent(
  parentReceiptId: string,
  installmentId: string,
): Receipt | null {
  const receipts = getStoredReceipts();
  const remainingList = receipts.filter((r) => r.id !== installmentId);
  const synced = syncReceipts(remainingList);
  saveReceipts(synced);
  return synced.find((r) => r.id === parentReceiptId) || null;
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

  // Create the new child receipt
  const childReceipt: Receipt = {
    id: childId,
    receiptNumber: newReceiptNumber,
    date: currentDate,
    clientName: parent.clientName,
    totalAmount: parent.totalAmount,
    previousRemainingAmount: parent.remainingAmount,
    paidAmount: installmentAmount,
    remainingAmount: Math.max(
      0,
      (parent.remainingAmount || 0) - installmentAmount,
    ),
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

  const newReceiptsList = [childReceipt, ...receipts];
  const synced = syncReceipts(newReceiptsList);
  saveReceipts(synced);

  const syncedParent = synced.find((r) => r.id === parentReceiptId)!;
  const syncedChild = synced.find((r) => r.id === childId)!;

  return { childReceipt: syncedChild, parentReceipt: syncedParent };
}
