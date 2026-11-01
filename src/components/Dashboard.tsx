import React, { useMemo } from 'react';
import { Receipt, CompanyProfile } from '../types/receipt';
import { formatCurrency } from '../utils/tafqeet';
import {
  FileText,
  DollarSign,
  Clock,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Eye,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
} from 'lucide-react';

interface DashboardProps {
  receipts: Receipt[];
  company: CompanyProfile;
  onNewReceipt: () => void;
  onViewReceipt: (receipt: Receipt) => void;
  onOpenSettings: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  receipts,
  company,
  onNewReceipt,
  onViewReceipt,
  onOpenSettings,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalPending = 0;
    let todayRevenue = 0;
    let todayCount = 0;
    let cashCount = 0;
    let chequeCount = 0;
    let transferCount = 0;
    let cashAmount = 0;
    let chequeAmount = 0;
    let transferAmount = 0;

    receipts.forEach(r => {
      totalRevenue += r.paidAmount;
      if (r.remainingAmount) {
        totalPending += r.remainingAmount;
      }

      if (r.date === todayStr) {
        todayRevenue += r.paidAmount;
        todayCount += 1;
      }

      if (r.paymentMethod === 'cash') {
        cashCount += 1;
        cashAmount += r.paidAmount;
      } else if (r.paymentMethod === 'cheque') {
        chequeCount += 1;
        chequeAmount += r.paidAmount;
      } else {
        transferCount += 1;
        transferAmount += r.paidAmount;
      }
    });

    return {
      totalCount: receipts.length,
      totalRevenue,
      totalPending,
      todayRevenue,
      todayCount,
      cashCount,
      chequeCount,
      transferCount,
      cashAmount,
      chequeAmount,
      transferAmount,
    };
  }, [receipts, todayStr]);

  const recentReceipts = receipts.slice(0, 5);

  return (
    <div className="space-y-8" dir="rtl">
      {/* Welcome & Quick Action Hero */}
      <div className="bg-gradient-to-l from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
            <span>نظام سند برو لإدارة سندات القبض المالية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-amiri tracking-wide">
            مرحباً بك في لوحة تحكم {company.name || 'سند برو'}
          </h2>
          <p className="text-blue-100/80 text-sm max-w-xl leading-relaxed">
            يمكنك إصدار سندات قبض رسمية بالدرهم المغربي مع التفقيط التلقائي، تتبع الأقساط والدفعات، والطباعة بجودة A4 عالية الدقة.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onNewReceipt}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm shadow-lg transition-all"
          >
            <Plus className="w-5 h-5 text-blue-700" />
            <span>إصدار سند جديد</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="flex-1 md:flex-none px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all text-center"
          >
            هوية الشركة
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">إجمالي المداخيل المحصلة</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 tracking-tight" dir="ltr">
            {formatCurrency(stats.totalRevenue, company.currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            مجموع كافة السندات والأقساط المقبوضة
          </p>
        </div>

        {/* Total Receipts */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">عدد السندات الصادرة</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 tracking-tight">
            {stats.totalCount} <span className="text-sm font-normal text-slate-500 font-tajawal">سند قبض</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            موثقة ومحفوظة محلياً بالنظام
          </p>
        </div>

        {/* Total Pending Balances */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">الأرصدة المتبقية في الذمة</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-700 tracking-tight" dir="ltr">
            {formatCurrency(stats.totalPending, company.currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            أقساط وعقود قيد التحصيل
          </p>
        </div>

        {/* Today's Collection */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">تحصيلات اليوم</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-700 tracking-tight" dir="ltr">
            {formatCurrency(stats.todayRevenue, company.currencySymbol)}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            {stats.todayCount} سندات بتاريخ {todayStr}
          </p>
        </div>
      </div>

      {/* Middle Row: Payment Methods Breakdown & Recent Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Payment Methods Breakdown (col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold font-amiri text-slate-900 mb-1">
              توزيع طرق الدفع
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              المبالغ المحصلة موزعة بحسب وسيلة الأداء
            </p>

            <div className="space-y-4">
              {/* Cash */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <DollarSign className="w-4 h-4" />
                    نقداً ({stats.cashCount})
                  </span>
                  <span className="font-mono text-emerald-800" dir="ltr">
                    {formatCurrency(stats.cashAmount, company.currencySymbol)}
                  </span>
                </div>
                <div className="w-full bg-emerald-200/50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{
                      width: `${stats.totalRevenue > 0 ? (stats.cashAmount / stats.totalRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Cheque */}
              <div className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-blue-800">
                    <FileText className="w-4 h-4" />
                    شيكات ({stats.chequeCount})
                  </span>
                  <span className="font-mono text-blue-800" dir="ltr">
                    {formatCurrency(stats.chequeAmount, company.currencySymbol)}
                  </span>
                </div>
                <div className="w-full bg-blue-200/50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{
                      width: `${stats.totalRevenue > 0 ? (stats.chequeAmount / stats.totalRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Bank Transfer */}
              <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-purple-800">
                    <Building className="w-4 h-4" />
                    تحويل بنكي ({stats.transferCount})
                  </span>
                  <span className="font-mono text-purple-800" dir="ltr">
                    {formatCurrency(stats.transferAmount, company.currencySymbol)}
                  </span>
                </div>
                <div className="w-full bg-purple-200/50 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 h-full rounded-full transition-all"
                    style={{
                      width: `${stats.totalRevenue > 0 ? (stats.transferAmount / stats.totalRevenue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 mt-6 text-xs text-slate-500 text-center">
            تحديث البيانات المالية يتم آنياً عند كل عملية
          </div>
        </div>

        {/* Recent Receipts (col-span-8) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold font-amiri text-slate-900">
                  أحدث سندات القبض المسجلة
                </h3>
                <p className="text-xs text-slate-500">
                  آخر المعاملات الصادرة مؤخراً
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {recentReceipts.map(receipt => (
                <div
                  key={receipt.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 text-xs">
                      {receipt.receiptNumber}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        {receipt.clientName}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono">
                        {receipt.date} • {receipt.paymentMethod === 'cash' ? 'نقداً' : receipt.paymentMethod === 'cheque' ? 'شيك' : 'تحويل بنكي'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left" dir="ltr">
                      <div className="font-mono font-bold text-sm text-slate-900">
                        {formatCurrency(receipt.paidAmount, company.currencySymbol)}
                      </div>
                      {(receipt.remainingAmount || 0) > 0 && (
                        <div className="text-[11px] font-mono text-amber-700">
                          باقي: {formatCurrency(receipt.remainingAmount || 0, company.currencySymbol)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onViewReceipt(receipt)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      title="معاينة وطباعة"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
