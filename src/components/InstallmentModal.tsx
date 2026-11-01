import React, { useState } from 'react';
import { Receipt, PaymentMethodType, ChequeDetails, BankTransferDetails } from '../types/receipt';
import { recordInstallment, generateNextReceiptNumber } from '../utils/storage';
import { tafqeetDirham, formatCurrency } from '../utils/tafqeet';
import { X, Check, DollarSign, Calendar, FileText, Building, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface InstallmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentReceipt: Receipt;
  onSuccess: (newReceipt: Receipt) => void;
}

export const InstallmentModal: React.FC<InstallmentModalProps> = ({
  isOpen,
  onClose,
  parentReceipt,
  onSuccess,
}) => {
  const [receiptNumber, setReceiptNumber] = useState<string>(
    generateNextReceiptNumber()
  );
  const [amount, setAmount] = useState<number>(
    parentReceipt.remainingAmount && parentReceipt.remainingAmount > 0
      ? parentReceipt.remainingAmount
      : 1000
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('cash');
  const [notes, setNotes] = useState<string>('');

  // Cheque
  const [chequeNumber, setChequeNumber] = useState<string>('');
  const [chequeBank, setChequeBank] = useState<string>('');
  const [chequeDate, setChequeDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Bank Transfer
  const [transferRef, setTransferRef] = useState<string>('');
  const [transferBank, setTransferBank] = useState<string>('');
  const [transferDate, setTransferDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      toast.error('يرجى تحديد مبلغ قسط صحيح أكبر من الصفر');
      return;
    }

    let chequeDetails: ChequeDetails | undefined;
    if (paymentMethod === 'cheque') {
      if (!chequeNumber.trim()) {
        toast.error('يرجى إدخال رقم الشيك');
        return;
      }
      chequeDetails = {
        chequeNumber: chequeNumber.trim(),
        bankName: chequeBank.trim(),
        chequeDate,
      };
    }

    let bankTransferDetails: BankTransferDetails | undefined;
    if (paymentMethod === 'bank_transfer') {
      if (!transferRef.trim()) {
        toast.error('يرجى إدخال رقم التحويل البنكي');
        return;
      }
      bankTransferDetails = {
        personName: parentReceipt.clientName,
        transactionNumber: transferRef.trim(),
        bankName: transferBank.trim(),
        transferDate,
      };
    }

    try {
      const { childReceipt } = recordInstallment(
        parentReceipt.id,
        amount,
        paymentMethod,
        notes.trim(),
        chequeDetails,
        bankTransferDetails,
        undefined,
        receiptNumber.trim()
      );

      toast.success(
        `تم تسجيل القسط وإصدار سند قبض جديد رقم (${childReceipt.receiptNumber}) بنجاح!`
      );
      onSuccess(childReceipt);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء تسجيل القسط');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        dir="rtl"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 my-8"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="text-xl font-bold font-amiri text-slate-900">
              تحصيل قسط جديد تابع لسند #{parentReceipt.receiptNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              العميل: <strong>{parentReceipt.clientName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Summary of the Parent Receipt */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6 text-center text-xs">
          <div>
            <span className="text-slate-500 block mb-1">إجمالي العقد</span>
            <span className="font-mono font-bold text-slate-800 text-sm">
              {formatCurrency(parentReceipt.totalAmount || parentReceipt.paidAmount)}
            </span>
          </div>
          <div className="border-x border-slate-200">
            <span className="text-slate-500 block mb-1">المسدد سابقاً</span>
            <span className="font-mono font-bold text-emerald-700 text-sm">
              {formatCurrency(parentReceipt.paidAmount)}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">المتبقي حالياً</span>
            <span className="font-mono font-bold text-amber-700 text-sm">
              {formatCurrency(parentReceipt.remainingAmount || 0)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row: Receipt Number & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            {/* Receipt Number (Receipt No.) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم سند القسط (Receipt No.) *
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  required
                  value={receiptNumber}
                  onChange={e => setReceiptNumber(e.target.value)}
                  className="w-full font-mono font-bold text-blue-700 px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  placeholder="R-712860"
                />
                <button
                  type="button"
                  onClick={() => setReceiptNumber(generateNextReceiptNumber())}
                  title="توليد رقم جديد"
                  className="p-2 text-slate-500 hover:text-blue-600 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Installment Amount */}
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1.5">
                مبلغ القسط المحصل (dh) *
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={amount || ''}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border-2 border-blue-600 focus:ring-2 focus:ring-blue-500 font-mono font-extrabold text-blue-700 text-sm bg-white"
              />
            </div>
          </div>

          {amount > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-700 font-semibold bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 leading-relaxed">
                {tafqeetDirham(amount)}
              </p>
              <div className="flex items-center justify-between text-xs bg-amber-50/60 p-2.5 rounded-xl border border-amber-200 text-amber-900 font-medium">
                <span>المبلغ المتبقي بعد هذا القسط:</span>
                <span className="font-mono font-bold text-sm" dir="ltr">
                  {formatCurrency(Math.max(0, (parentReceipt.remainingAmount || 0) - amount))}
                </span>
              </div>
            </div>
          )}

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              طريقة دفع القسط
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === 'cash'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>نقداً</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cheque')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === 'cheque'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>شيك</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>تحويل بنكي</span>
              </button>
            </div>
          </div>

          {paymentMethod === 'cheque' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  رقم الشيك *
                </label>
                <input
                  type="text"
                  required
                  value={chequeNumber}
                  onChange={e => setChequeNumber(e.target.value)}
                  placeholder="CHQ-..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  اسم البنك
                </label>
                <input
                  type="text"
                  value={chequeBank}
                  onChange={e => setChequeBank(e.target.value)}
                  placeholder="اسم البنك"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>
          )}

          {paymentMethod === 'bank_transfer' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  رقم التحويل *
                </label>
                <input
                  type="text"
                  required
                  value={transferRef}
                  onChange={e => setTransferRef(e.target.value)}
                  placeholder="VIR-..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  تاريخ التحويل
                </label>
                <input
                  type="date"
                  value={transferDate}
                  onChange={e => setTransferDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ملاحظات أو بيان القسط
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثال: القسط الثاني، تسديد جزء من الرصيد المتبقي..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              تأكيد تحصيل القسط وإصدار السند
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
