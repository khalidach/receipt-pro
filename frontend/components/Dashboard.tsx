
import React from 'react';
import { ReceiptData } from '../types';
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Clock, 
  ArrowLeft,
  DollarSign,
  Plus
} from 'lucide-react';

interface Props {
  history: ReceiptData[];
  onNavigateToList: () => void;
  onEditReceipt: (receipt: ReceiptData) => void;
}

export const Dashboard: React.FC<Props> = ({ history, onNavigateToList, onEditReceipt }) => {
  const totalRevenue = history.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
  const totalReceipts = history.length;
  const recentReceipts = history.slice(0, 5);
  
  const cashTotal = history.filter(r => r.paymentMethod === 'cash').reduce((a, b) => a + (b.paidAmount || 0), 0);
  const bankTotal = history.filter(r => r.paymentMethod !== 'cash').reduce((a, b) => a + (b.paidAmount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900">مرحباً بك مجدداً</h2>
          <p className="text-gray-500 mt-1">إليك نظرة سريعة على نشاطك المالي الأخير</p>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-2xl">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">إجمالي المحصل</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{totalRevenue.toLocaleString()} <span className="text-sm font-normal text-gray-400">dh</span></h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="bg-green-100 text-green-600 p-4 rounded-2xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">عدد السندات</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{totalReceipts}</h4>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
          <div className="bg-purple-100 text-purple-600 p-4 rounded-2xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">العملاء المميزون</p>
            <h4 className="text-2xl font-bold text-gray-900 mt-1">{new Set(history.map(r => r.clientName)).size}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-800">آخر السندات الصادرة</h3>
            </div>
            <button 
              onClick={onNavigateToList}
              className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:underline"
            >
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 font-bold">
                  <th className="px-6 py-4">العميل</th>
                  <th className="px-6 py-4">المبلغ</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">لا توجد بيانات حالياً</td>
                  </tr>
                ) : (
                  recentReceipts.map((r) => (
                    <tr key={r.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-800">{r.clientName}</td>
                      <td className="px-6 py-4 text-blue-700 font-bold">{r.paidAmount?.toLocaleString()} dh</td>
                      <td className="px-6 py-4 text-gray-500">{r.receiptDate}</td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => onEditReceipt(r)}
                          className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg"
                        >
                          تعديل
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            توزيع الدفعات
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">نقدي</span>
                <span className="font-bold">{((cashTotal / (totalRevenue || 1)) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${(cashTotal / (totalRevenue || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">بنكي / شيكات</span>
                <span className="font-bold">{((bankTotal / (totalRevenue || 1)) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-500 h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${(bankTotal / (totalRevenue || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-xs text-blue-700 mb-2 font-bold">إحصائية سريعة</p>
            <p className="text-sm text-blue-900 leading-relaxed">
              متوسط مبالغ السندات الصادرة هو <span className="font-bold">{(totalRevenue / (totalReceipts || 1)).toFixed(0)} dh</span> لكل سند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
