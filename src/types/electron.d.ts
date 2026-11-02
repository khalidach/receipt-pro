import { Receipt, CompanyProfile } from './receipt';

export interface DatabaseInfo {
  path: string;
  sizeBytes: number;
  receiptCount: number;
}

export interface DatabaseAllData {
  receipts: Receipt[] | null;
  company: CompanyProfile | null;
  lastReceiptNum?: string | null;
  dbPath?: string;
  error?: string;
}

export interface ElectronAPI {
  isElectron: boolean;
  print: () => Promise<boolean>;
  printToPDF?: (filename?: string) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
  savePDFBuffer?: (base64Data: string, filename?: string) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
  db: {
    getAll: () => Promise<DatabaseAllData>;
    saveReceipts: (receipts: Receipt[]) => Promise<boolean>;
    saveCompanyProfile: (profile: CompanyProfile) => Promise<boolean>;
    backup: () => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
    restore: () => Promise<{ success: boolean; receiptsCount?: number; canceled?: boolean; error?: string }>;
    getInfo: () => Promise<DatabaseInfo>;
    openFolder: () => Promise<boolean>;
  };
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
