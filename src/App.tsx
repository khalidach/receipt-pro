import React, { useState, useEffect } from 'react';
import { Receipt, CompanyProfile } from './types/receipt';
import { getStoredReceipts, getCompanyProfile } from './utils/storage';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ReceiptList } from './components/ReceiptList';
import { ReceiptForm } from './components/ReceiptForm';
import { ReceiptPreviewModal } from './components/ReceiptPreviewModal';
import { InstallmentModal } from './components/InstallmentModal';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { Toaster, toast } from 'sonner';

export const App: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [company, setCompany] = useState<CompanyProfile>(getCompanyProfile());
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'receipts' | 'new'>('dashboard');

  // Modals & Active Selections
  const [previewReceipt, setPreviewReceipt] = useState<Receipt | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [installmentParentReceipt, setInstallmentParentReceipt] = useState<Receipt | null>(null);
  const [isCompanySettingsOpen, setIsCompanySettingsOpen] = useState<boolean>(false);

  const loadData = () => {
    setReceipts(getStoredReceipts());
    setCompany(getCompanyProfile());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReceiptSaved = (saved: Receipt) => {
    loadData();
    setEditingReceipt(null);
    setPreviewReceipt(saved);
    setCurrentTab('receipts');
  };

  const handleInstallmentSuccess = (newChildReceipt: Receipt) => {
    loadData();
    setPreviewReceipt(newChildReceipt);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-tajawal antialiased text-slate-800 flex flex-col">
      <Toaster richColors position="top-center" dir="rtl" />

      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={tab => {
          if (tab === 'new') {
            setEditingReceipt(null);
          }
          setCurrentTab(tab);
        }}
        company={company}
        onOpenCompanySettings={() => setIsCompanySettingsOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 no-print">
        {currentTab === 'dashboard' && (
          <Dashboard
            receipts={receipts}
            company={company}
            onNewReceipt={() => {
              setEditingReceipt(null);
              setCurrentTab('new');
            }}
            onViewReceipt={receipt => setPreviewReceipt(receipt)}
            onOpenSettings={() => setIsCompanySettingsOpen(true)}
          />
        )}

        {currentTab === 'receipts' && (
          <ReceiptList
            receipts={receipts}
            company={company}
            onView={receipt => setPreviewReceipt(receipt)}
            onEdit={receipt => {
              setEditingReceipt(receipt);
              setCurrentTab('new');
            }}
            onAddInstallment={receipt => setInstallmentParentReceipt(receipt)}
            onNewReceipt={() => {
              setEditingReceipt(null);
              setCurrentTab('new');
            }}
            onReceiptsChange={loadData}
          />
        )}

        {currentTab === 'new' && (
          <ReceiptForm
            initialReceipt={editingReceipt}
            company={company}
            onSaveSuccess={handleReceiptSaved}
            onCancel={() => {
              setEditingReceipt(null);
              setCurrentTab('receipts');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 no-print" dir="rtl">
        <p className="font-medium">
          نظام سند برو (Ar-Receipt Pro) • سند قبض مالي احترافي بكامل المواصفات المغربية
        </p>
      </footer>

      {/* Preview Modal (Exact photo layout with A4 printing & PDF download) */}
      <ReceiptPreviewModal
        receipt={previewReceipt}
        company={company}
        isOpen={Boolean(previewReceipt)}
        onClose={() => setPreviewReceipt(null)}
        onEdit={receipt => {
          setEditingReceipt(receipt);
          setCurrentTab('new');
        }}
        onAddInstallment={receipt => setInstallmentParentReceipt(receipt)}
        onReceiptUpdated={updated => {
          loadData();
          setPreviewReceipt(updated);
        }}
      />

      {/* Installment Manager Modal */}
      {installmentParentReceipt && (
        <InstallmentModal
          isOpen={Boolean(installmentParentReceipt)}
          parentReceipt={installmentParentReceipt}
          onClose={() => setInstallmentParentReceipt(null)}
          onSuccess={handleInstallmentSuccess}
        />
      )}

      {/* Company Settings Modal (Logo & Stamp Upload) */}
      <CompanySettingsModal
        isOpen={isCompanySettingsOpen}
        onClose={() => setIsCompanySettingsOpen(false)}
        company={company}
        onUpdate={updated => setCompany(updated)}
      />
    </div>
  );
};
export default App;
