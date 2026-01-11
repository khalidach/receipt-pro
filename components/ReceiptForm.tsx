
import React from 'react';
import { ReceiptData, PaymentMethod } from '../types';
import { Image as ImageIcon, Signature, Calendar, User, Hash, DollarSign, Wallet, FileText, Trash2, X } from 'lucide-react';
import { SignaturePad } from './SignaturePad';

interface Props {
  data: ReceiptData;
  onUpdate: (updates: Partial<ReceiptData>) => void;
}

export const ReceiptForm: React.FC<Props> = ({ data, onUpdate }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'companyLogo' | 'stamp') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ [field]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    // Reset input so the same file can be uploaded again if deleted
    e.target.value = '';
  };

  return (
    <div className="space-y-6 text-right">
      {/* Company Info */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">بيانات المؤسسة</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم الشركة</label>
          <div className="relative">
            <input 
              type="text" 
              value={data.companyName}
              onChange={(e) => onUpdate({ companyName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 pr-10 outline-none"
              placeholder="أدخل اسم الشركة..."
            />
            <User className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {/* Logo Section */}
          <div className="relative group h-24">
            {data.companyLogo ? (
              <div className="relative border-2 border-gray-200 rounded-lg p-2 h-full flex items-center justify-center bg-white overflow-hidden">
                <img src={data.companyLogo} alt="Logo" className="h-full w-full object-contain" />
                <button 
                  onClick={() => onUpdate({ companyLogo: null })}
                  className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10"
                  title="حذف الشعار"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors h-full">
                 <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                 <span className="text-xs text-gray-500 text-center">شعار الشركة</span>
                 <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'companyLogo')} />
              </label>
            )}
          </div>

          {/* Stamp Section */}
          <div className="relative group h-24">
            {data.stamp ? (
              <div className="relative border-2 border-gray-200 rounded-lg p-2 h-full flex items-center justify-center bg-white overflow-hidden">
                <img src={data.stamp} alt="Stamp" className="h-full w-full object-contain" />
                <button 
                  onClick={() => onUpdate({ stamp: null })}
                  className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10"
                  title="حذف الختم"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors h-full">
                 <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                 <span className="text-xs text-gray-500 text-center">ختم الشركة</span>
                 <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'stamp')} />
              </label>
            )}
          </div>
        </div>
      </section>

      {/* Receipt Details */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">تفاصيل السند</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم السند</label>
            <input 
              type="text" 
              value={data.receiptNumber}
              onChange={(e) => onUpdate({ receiptNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ السند</label>
            <input 
              type="date" 
              value={data.receiptDate}
              onChange={(e) => onUpdate({ receiptDate: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل / المستلم</label>
          <div className="relative">
            <input 
              type="text" 
              value={data.clientName}
              onChange={(e) => onUpdate({ clientName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="وصلنا من السيد..."
            />
            <User className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Financial Details */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">المبالغ المالية</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ الإجمالي</label>
            <div className="relative">
              <input 
                type="number" 
                value={data.totalPrice || ''}
                onChange={(e) => onUpdate({ totalPrice: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 text-left outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <DollarSign className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المدفوع</label>
            <div className="relative">
              <input 
                type="number" 
                value={data.paidAmount || ''}
                onChange={(e) => onUpdate({ paidAmount: e.target.value ? Number(e.target.value) : null })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 text-left outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <DollarSign className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">وذلك مقابل (الغرض)</label>
          <div className="relative">
            <textarea 
              value={data.purpose}
              onChange={(e) => onUpdate({ purpose: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg pr-10 outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              placeholder="وصف للخدمة أو السلعة المقدمة..."
            />
            <FileText className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </section>

      {/* Payment Method */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">طريقة الدفع</h3>
        <div className="grid grid-cols-3 gap-2">
          {(['cash', 'cheque', 'transfer'] as PaymentMethod[]).map((method) => (
            <button
              key={method}
              onClick={() => onUpdate({ paymentMethod: method })}
              className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${
                data.paymentMethod === method 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {method === 'cash' ? 'نقداً' : method === 'cheque' ? 'شيك' : 'تحويل'}
            </button>
          ))}
        </div>

        {data.paymentMethod === 'cheque' && (
          <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">رقم الشيك</label>
              <input 
                type="text" 
                value={data.chequeNumber || ''}
                onChange={(e) => onUpdate({ chequeNumber: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">اسم البنك</label>
              <input 
                type="text" 
                value={data.bankName || ''}
                onChange={(e) => onUpdate({ bankName: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">تاريخ الاستحقاق</label>
              <input 
                type="date" 
                value={data.chequeDate || ''}
                onChange={(e) => onUpdate({ chequeDate: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none text-left"
              />
            </div>
          </div>
        )}

        {data.paymentMethod === 'transfer' && (
          <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200 animate-in fade-in duration-300">
             <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">البنك المحول إليه</label>
              <input 
                type="text" 
                value={data.bankName || ''}
                onChange={(e) => onUpdate({ bankName: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">رقم المرجع (Ref)</label>
              <input 
                type="text" 
                value={data.transactionRef || ''}
                onChange={(e) => onUpdate({ transactionRef: e.target.value })}
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm outline-none"
              />
            </div>
          </div>
        )}
      </section>

      {/* Signature Section */}
      <section className="space-y-4 pb-8">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-2">التوقيع</h3>
        <SignaturePad onSave={(sig) => onUpdate({ signature: sig })} initialValue={data.signature} />
      </section>
    </div>
  );
};
