import React, { useState, useMemo } from 'react';
import { Receipt, CompanyProfile, PaymentMethodType } from '../types/receipt';
import { formatCurrency } from '../utils/tafqeet';
import { deleteReceipt } from '../utils/storage';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Printer,
  Download,
  CreditCard,
  Plus,
  ArrowUpDown,
  FileText,
  DollarSign,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptListProps {
  receipts: Receipt[];
  company: CompanyProfile;
  onView: (receipt: Receipt) => void;
  onEdit: (receipt: Receipt) => void;
  onAddInstallment: (receipt: Receipt) => void;
  onNewReceipt: () => void;
  onReceiptsChange: () => void;
}

export const ReceiptList: React.FC<ReceiptListProps> = ({
  receipts,
  company,
  onView,
  onEdit,
  onAddInstallment,
  onNewReceipt,
  onReceiptsChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethodType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'partial'>('all');

  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      // Search
      const search = searchTerm.toLowerCase().trim();
      const matchSearch =
        !search ||
        receipt.receiptNumber.toLowerCase().includes(search) ||
        receipt.clientName.toLowerCase().includes(search) ||
        receipt.purpose.toLowerCase().includes(search) ||
        receipt.date.includes(search) ||
        (receipt.chequeDetails?.chequeNumber &&
          receipt.chequeDetails.chequeNumber.toLowerCase().includes(search)) ||
        (receipt.bankTransferDetails?.transactionNumber &&
          receipt.bankTransferDetails.transactionNumber.toLowerCase().includes(search));

      // Method
      const matchMethod =
        methodFilter === 'all' || receipt.paymentMethod === methodFilter;

      // Status
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && (receipt.remainingAmount || 0) <= 0) ||
        (statusFilter === 'partial' && (receipt.remainingAmount || 0) > 0);

      return matchSearch && matchMethod && matchStatus;
    });
  }, [receipts, searchTerm, methodFilter, statusFilter]);

  const handleDelete = (receipt: Receipt) => {
    const isInstallment = Boolean(receipt.parentReceiptId);
    const confirmMsg = isInstallment
      ? `هل أنت متأكد من حذف هذا القسط (${receipt.receiptNumber})؟\nسيتم خصم مبلغه (${receipt.paidAmount} dh) تلقائياً من السند الأصلي.`
      : `هل أنت متأكد من حذف السند رقم (${receipt.receiptNumber})؟`;

    if (confirm(confirmMsg)) {
      deleteReceipt(receipt.id);
      toast.success(
        isInstallment
          ? `تم حذف القسط رقم ${receipt.receiptNumber} وخصم مبلغه من السند الأصلي بنجاح`
          : `تم حذف السند رقم ${receipt.receiptNumber}`
      );
      onReceiptsChange();
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Bar: Search, Filters & Add New Button */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث برقم السند، اسم العميل، البيان، أو رقم الشيك..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm bg-slate-50/50"
            />
          </div>

          {/* New Receipt Button */}
          <button
            onClick={onNewReceipt}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>إصدار سند قبض جديد</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-bold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            تصفية بحسب:
          </span>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setMethodFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                methodFilter === 'all'
                  ? 'bg-white text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              كافة طرق الدفع
            </button>
            <button
              onClick={() => setMethodFilter('cash')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                methodFilter === 'cash'
                  ? 'bg-white text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              نقداً
            </button>
            <button
              onClick={() => setMethodFilter('cheque')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                methodFilter === 'cheque'
                  ? 'bg-white text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              شيكات
            </button>
            <button
              onClick={() => setMethodFilter('bank_transfer')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                methodFilter === 'bank_transfer'
                  ? 'bg-white text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تحويل بنكي
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-blue-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({receipts.length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-white text-emerald-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              مسدد بالكامل
            </button>
            <button
              onClick={() => setStatusFilter('partial')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                statusFilter === 'partial'
                  ? 'bg-white text-amber-700 font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              به رصيد متبقي
            </button>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredReceipts.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              لا توجد سندات قبض مطابقة
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              يمكنك تغيير معايير البحث أو إصدار سند قبض جديد الآن
            </p>
            <button
              onClick={onNewReceipt}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              إصدار سند جديد
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 text-slate-700 text-xs font-bold border-b border-slate-200">
                <tr>
                  <th className="py-4 px-5">رقم السند</th>
                  <th className="py-4 px-4">التاريخ</th>
                  <th className="py-4 px-4">وصلنا من السيد / السادة</th>
                  <th className="py-4 px-4">طريقة الدفع</th>
                  <th className="py-4 px-4">المبلغ المقبوض</th>
                  <th className="py-4 px-4">الرصيد المتبقي</th>
                  <th className="py-4 px-5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceipts.map(receipt => {
                  const hasRemaining = Boolean(
                    receipt.totalAmount &&
                    receipt.totalAmount > 0 &&
                    receipt.remainingAmount &&
                    receipt.remainingAmount > 0
                  );
                  return (
                    <tr
                      key={receipt.id}
                      className="hover:bg-blue-50/40 transition-colors group"
                    >
                      {/* Receipt Number */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-xs">
                            {receipt.receiptNumber}
                          </span>
                          {receipt.parentReceiptId && (
                            <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200 font-bold">
                              قسط
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {receipt.date}
                      </td>

                      {/* Client Name */}
                      <td className="py-4 px-4 font-bold text-slate-900 max-w-[200px] truncate">
                        {receipt.clientName}
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {receipt.paymentMethod === 'cash' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <DollarSign className="w-3 h-3" />
                            نقداً
                          </span>
                        )}
                        {receipt.paymentMethod === 'credit_card' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <CreditCard className="w-3 h-3" />
                            بطاقة ائتمان
                          </span>
                        )}
                        {receipt.paymentMethod === 'debit_card' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                            <CreditCard className="w-3 h-3" />
                            خصم مباشر
                          </span>
                        )}
                        {receipt.paymentMethod === 'cheque' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <FileText className="w-3 h-3" />
                            شيك
                          </span>
                        )}
                        {receipt.paymentMethod === 'promissory_note' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <FileText className="w-3 h-3" />
                            كمبيالة
                          </span>
                        )}
                        {receipt.paymentMethod === 'bank_transfer' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <Building className="w-3 h-3" />
                            تحويل بنكي
                          </span>
                        )}
                        {receipt.paymentMethod === 'cash_deposit' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                            <DollarSign className="w-3 h-3" />
                            إيداع نقدي
                          </span>
                        )}
                      </td>

                      {/* Amount Paid */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono font-extrabold text-slate-900 text-sm">
                          {formatCurrency(receipt.paidAmount, company.currencySymbol)}
                        </span>
                      </td>

                      {/* Remaining Amount */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {receipt.totalAmount && receipt.totalAmount > 0 ? (
                          hasRemaining ? (
                            <span className="font-mono font-bold text-amber-700 text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {formatCurrency(receipt.remainingAmount || 0, company.currencySymbol)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 text-xs font-bold">
                              مسدد كامل ✓
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 text-xs font-medium">
                            - (مقبوض مباشر)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* View Preview */}
                          <button
                            onClick={() => onView(receipt)}
                            title="معاينة وطباعة"
                            className="p-1.5 text-blue-600 hover:bg-blue-100/60 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Collect Installment if pending and it is an original receipt (not an installment child receipt) */}
                          {hasRemaining && !receipt.parentReceiptId && (
                            <button
                              onClick={() => onAddInstallment(receipt)}
                              title="تحصيل قسط جديد"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-100/60 rounded-lg transition-colors"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => onEdit(receipt)}
                            title="تعديل السند"
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(receipt)}
                            title="حذف"
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
