
import React from 'react';
import { ReceiptData } from '../types';
import { numberToArabicWords } from '../tafqeet';

interface Props {
  data: ReceiptData;
}

export const ReceiptPreview: React.FC<Props> = ({ data }) => {
  const previousTotalPaid = data.previousPayments.reduce((sum, p) => sum + p.amount, 0);
  const currentTotalPaid = previousTotalPaid + (data.paidAmount || 0);
  const remaining = (data.totalPrice || 0) - currentTotalPaid;
  
  const showRemaining = data.totalPrice !== null && data.totalPrice !== undefined;

  const amountInWords = data.paidAmount 
    ? numberToArabicWords(Math.floor(data.paidAmount)) 
    : "";

  return (
    <div className="receipt-paper font-amiri text-right border-4 border-double border-gray-800 bg-white shadow-none" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b-2 border-gray-800 pb-6">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-1 text-gray-900 leading-tight">{data.companyName || 'اسم الشركة'}</h1>
          <p className="text-xl text-gray-600 leading-none">سند قبض مالي</p>
          <p className="text-lg font-tajawal leading-none mt-1 uppercase tracking-wider opacity-70">Official Payment Receipt</p>
        </div>
        
        <div className="flex flex-col items-center mx-4">
           {data.companyLogo ? (
             <img src={data.companyLogo} alt="Logo" className="h-24 object-contain" />
           ) : (
             <div className="h-24 w-24 bg-gray-50 border flex items-center justify-center text-gray-300 text-xs rounded-lg">
               شعار الشركة
             </div>
           )}
        </div>

        <div className="flex-1 text-left flex flex-col items-end">
           <div className="bg-gray-50 border-2 border-gray-800 p-4 rounded-lg w-48 space-y-2 shadow-sm">
             <div className="flex justify-between w-full border-b border-gray-200 pb-1">
                <span className="font-bold text-sm">الرقم:</span>
                <span className="text-blue-800 font-sans font-bold">{data.receiptNumber}</span>
             </div>
             <div className="flex justify-between w-full pt-1">
                <span className="font-bold text-sm">التاريخ:</span>
                <span className="font-sans font-bold">{data.receiptDate}</span>
             </div>
           </div>
        </div>
      </div>

      {/* Client Section */}
      <div className="border-2 border-gray-800 p-8 rounded-lg mb-6 relative">
        <div className="absolute -top-4 right-6 bg-white px-2 font-bold text-xl z-10">بيانات المستلم</div>
        
        <div className="flex items-center gap-4 mb-6 h-12 relative">
           <span className="text-xl whitespace-nowrap leading-none z-10 bg-white pl-2">وصلنا من السيد / السادة :</span>
           <div className="flex-1 border-b-2 border-dotted border-gray-400 text-2xl font-bold px-2 h-full flex items-center pt-2">
             {data.clientName}
           </div>
        </div>

        <div className="flex items-center gap-4 h-12 relative">
           <span className="text-xl whitespace-nowrap leading-none z-10 bg-white pl-2">مبلغ وقدره :</span>
           <div className="flex-1 border-b-2 border-dotted border-gray-400 text-2xl font-bold px-2 h-full flex items-center pt-2">
             {amountInWords ? `${amountInWords} درهم مغربي فقط لا غير` : ''}
           </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div className="border-2 border-gray-800 p-6 rounded-lg relative">
          <div className="absolute -top-4 right-6 bg-white px-2 font-bold text-xl z-10">طريقة الدفع</div>
          <div className="space-y-4 pt-2">
             <div className="flex items-center gap-4">
                <div className={`w-6 h-6 border-2 border-gray-800 rounded flex items-center justify-center ${data.paymentMethod === 'cash' ? 'bg-gray-800' : ''}`}>
                  {data.paymentMethod === 'cash' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <span className="text-xl">نقداً</span>
             </div>
             <div className="flex items-center gap-4 h-10">
                <div className={`w-6 h-6 border-2 border-gray-800 rounded flex items-center justify-center ${data.paymentMethod === 'cheque' ? 'bg-gray-800' : ''}`}>
                   {data.paymentMethod === 'cheque' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <span className="text-xl whitespace-nowrap">شيك رقم:</span>
                <span className="border-b-2 border-dotted border-gray-400 flex-1 h-full text-2xl font-bold px-2 flex items-center font-sans pt-2">{data.chequeNumber}</span>
             </div>
             <div className="flex items-center gap-4">
                <div className={`w-6 h-6 border-2 border-gray-800 rounded flex items-center justify-center ${data.paymentMethod === 'transfer' ? 'bg-gray-800' : ''}`}>
                   {data.paymentMethod === 'transfer' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <span className="text-xl">تحويل بنكي</span>
             </div>
          </div>
        </div>

        <div className="border-2 border-gray-800 p-6 rounded-lg relative bg-gray-50/30">
          <div className="absolute -top-4 right-6 bg-white px-2 font-bold text-xl z-10">الحساب المالي</div>
          <div className="space-y-4 pt-4 font-bold text-xl">
             {showRemaining && (
               <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span>المبلغ الإجمالي:</span>
                  <span className="text-2xl font-sans">{data.totalPrice?.toLocaleString()} dh</span>
               </div>
             )}
             <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span>المبلغ الحالي:</span>
                <span className="text-2xl text-blue-900 font-sans">{data.paidAmount?.toLocaleString()} dh</span>
             </div>
             {showRemaining && (
               <div className="flex justify-between items-center bg-white p-3 rounded-lg mt-2 border border-gray-200">
                  <span>المبلغ المتبقي:</span>
                  <span className="text-2xl text-red-700 font-sans">{remaining.toLocaleString()} dh</span>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      {data.previousPayments.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 border-b-2 border-gray-800 inline-block">سجل الدفعات السابقة</h3>
          <table className="w-full border-collapse border-2 border-gray-800 text-sm text-center">
            <thead>
              <tr className="bg-gray-100 font-bold">
                <th className="border-2 border-gray-800 p-2">رقم السند</th>
                <th className="border-2 border-gray-800 p-2">التاريخ</th>
                <th className="border-2 border-gray-800 p-2">المبلغ</th>
                <th className="border-2 border-gray-800 p-2">طريقة الدفع</th>
              </tr>
            </thead>
            <tbody>
              {data.previousPayments.map((payment, idx) => (
                <tr key={idx} className="font-bold">
                  <td className="border-2 border-gray-800 p-2 font-sans">{payment.receiptNumber}</td>
                  <td className="border-2 border-gray-800 p-2 font-sans">{payment.date}</td>
                  <td className="border-2 border-gray-800 p-2 text-gray-900 font-sans">{payment.amount.toLocaleString()} dh</td>
                  <td className="border-2 border-gray-800 p-2">{payment.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Purpose Section - FIXED Label Visibility and Formatting */}
      <div className="border-2 border-gray-800 p-8 rounded-lg mb-8 min-h-[160px] relative">
         <div className="absolute -top-4 right-6 bg-white px-2 font-bold text-xl z-10">وذلك مقابل</div>
         
         <div className="relative w-full h-full min-h-[100px] overflow-hidden">
           {/* Line grid background */}
           <div 
             className="absolute inset-0 pointer-events-none opacity-20"
             style={{
               backgroundImage: 'linear-gradient(transparent 39px, #000 39px, #000 40px)',
               backgroundSize: '100% 40px',
               backgroundPosition: '0 0'
             }}
           ></div>
           
           {/* Text Content */}
           <div className="text-2xl text-gray-800 leading-[40px] whitespace-pre-wrap break-words relative z-20 font-bold min-h-[40px] w-full pt-1">
             {data.purpose}
           </div>

           {/* Empty state lines */}
           {!data.purpose && (
             <div className="space-y-[38px] pt-8 opacity-20 pointer-events-none">
               <div className="border-b border-gray-800 w-full"></div>
               <div className="border-b border-gray-800 w-full"></div>
               <div className="border-b border-gray-800 w-full"></div>
             </div>
           )}
         </div>
      </div>

      {/* Footer / Signatures */}
      <div className="flex justify-between items-end gap-10 mt-6 pb-4">
        <div className="flex-1 flex flex-col items-center">
           <div className="text-2xl font-bold border-b-2 border-gray-800 w-full text-center pb-3 mb-6">المحاسب / المستلم</div>
           <div className="h-32 flex items-center justify-center relative w-full">
             {data.signature && <img src={data.signature} alt="Signature" className="h-full object-contain" />}
             {data.stamp && (
               <img src={data.stamp} alt="Stamp" className="absolute top-0 right-0 h-24 w-24 object-contain opacity-40 mix-blend-multiply rotate-12" />
             )}
           </div>
        </div>
        <div className="flex-1 flex flex-col items-center">
           <div className="text-2xl font-bold border-b-2 border-gray-800 w-full text-center pb-3 mb-6">الختم الرسمي</div>
           <div className="h-32 w-full flex items-center justify-center">
             {data.stamp && <img src={data.stamp} alt="Stamp" className="h-full object-contain" />}
           </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center text-gray-400 text-xs font-tajawal">
        تم إنشاء هذا السند بواسطة تطبيق Ar-Receipt Pro المحترف | {new Date().getFullYear()}
      </div>
    </div>
  );
};
