import React, { useState } from 'react';
import { Receipt, CompanyProfile } from '../types/receipt';
import { ReceiptDocument } from './ReceiptDocument';
import { printReceipt, exportReceiptToPDF } from '../utils/pdfExport';
import { deleteInstallmentFromParent } from '../utils/storage';
import {
  Printer,
  Download,
  Edit,
  X,
  CreditCard,
  CheckCircle2,
  FileCheck,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptPreviewModalProps {
  receipt: Receipt | null;
  company: CompanyProfile;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (receipt: Receipt) => void;
  onAddInstallment: (receipt: Receipt) => void;
  onReceiptUpdated?: (receipt: Receipt) => void;
}

export const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({
  receipt,
  company,
  isOpen,
  onClose,
  onEdit,
  onAddInstallment,
  onReceiptUpdated,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showInstallments, setShowInstallments] = useState(false);

  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    printReceipt();
  };

  const handleDeleteInstallment = (installmentId: string) => {
    if (
      confirm(
        'هل أنت متأكد من حذف هذا القسط؟\nسيتم خصم مبلغه تلقائياً من إجمالي المدفوع في هذا السند الأصلي.'
      )
    ) {
      const updated = deleteInstallmentFromParent(receipt.id, installmentId);
      if (updated) {
        toast.success('تم حذف القسط وخصم مبلغه من السند الأصلي بنجاح');
        onReceiptUpdated?.(updated);
      }
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const safeClient = receipt.clientName.replace(/[\\/:*?"<>|]/g, '_');
      const filename = `سند_قبض_${receipt.receiptNumber}_${safeClient}.pdf`;
      await exportReceiptToPDF('receipt-print-area', filename);
      toast.success('تم تصدير ملف PDF بنجاح!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('حدث خطأ أثناء تصدير PDF. يمكنك استخدام زر الطباعة والحفظ كـ PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div
        dir="rtl"
        className="bg-slate-100 rounded-3xl shadow-2xl border border-slate-300 w-full max-w-5xl my-4 sm:my-8 flex flex-col max-h-[95vh] overflow-hidden"
      >
        {/* Top Action Bar (hidden when printing) */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 no-print">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold font-amiri text-slate-900">
                  معاينة سند القبض
                </h3>
                <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 text-sm">
                  {receipt.receiptNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                المستلم: {receipt.clientName} | التاريخ: {receipt.date}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {receipt.installments && receipt.installments.length > 0 && (
              <button
                type="button"
                onClick={() => setShowInstallments(!showInstallments)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  showInstallments
                    ? 'bg-blue-50 border-blue-300 text-blue-800'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>سجل الأقساط ({receipt.installments.length})</span>
              </button>
            )}

            {(receipt.remainingAmount || 0) > 0 && !receipt.parentReceiptId && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddInstallment(receipt);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                <span>تحصيل قسط</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(receipt);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة (A4)</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'جاري التصدير...' : 'تحميل PDF'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/60 flex items-center justify-center">
          <div className="w-full max-w-[800px] bg-white rounded-xl shadow-xl overflow-hidden print:m-0 print:p-0 print:shadow-none print:w-full">
            <ReceiptDocument
              receipt={receipt}
              company={company}
              showInstallmentHistory={showInstallments}
              onDeleteInstallment={handleDeleteInstallment}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
