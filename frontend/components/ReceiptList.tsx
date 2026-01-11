
import React, { useState } from 'react';
import { ReceiptData } from '../types';
import { 
  Search, 
  Edit3, 
  Trash2, 
  Download, 
  Wallet,
  CornerDownLeft,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface Props {
  history: ReceiptData[];
  onEdit: (receipt: ReceiptData) => void;
  onDelete: (id: string) => void;
  onDownload: (receipt: ReceiptData) => void;
  onCollect: (receipt: ReceiptData) => void;
}

export const ReceiptList: React.FC<Props> = ({ history, onEdit, onDelete, onDownload, onCollect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedChains, setExpandedChains] = useState<Record<string, boolean>>({});

  const toggleChain = (id: string) => {
    setExpandedChains(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Logic to group receipts
  const rootReceipts = history.filter(r => !r.parentId);
  const childrenReceipts = history.filter(r => !!r.parentId);

  const getChain = (rootId: string) => {
    return childrenReceipts
      .filter(r => r.parentId === rootId)
      .sort((a, b) => b.createdAt - a.createdAt);
  };

  const matchesFilter = (item: ReceiptData) => {
    const matchesSearch = 
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.receiptNumber.includes(searchTerm);
    const matchesType = filterType === 'all' || item.paymentMethod === filterType;
    return matchesSearch && matchesType;
  };

  // Filter logic: Show root if it or any of its children match
  const filteredRoots = rootReceipts.filter(root => {
    const chain = getChain(root.id);
    const rootMatches = matchesFilter(root);
    const anyChildMatches = chain.some(child => matchesFilter(child));
    return rootMatches || anyChildMatches;
  });

  const renderRow = (item: ReceiptData, isChild: boolean = false) => (
    <tr key={item.id} className={`${isChild ? 'bg-gray-50/50' : 'bg-white'} hover:bg-blue-50/30 transition-colors group border-b border-gray-100 last:border-0`}>
      <td className={`px-6 py-4 ${isChild ? 'pr-16' : ''}`}>
        <div className="flex items-center gap-3">
          {isChild && <CornerDownLeft className="w-4 h-4 text-gray-400" />}
          <span className={`${isChild ? 'bg-white border' : 'bg-gray-100'} text-gray-600 px-3 py-1 rounded-full text-xs font-bold font-sans`}>
            {item.receiptNumber}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className={`font-bold ${isChild ? 'text-gray-600 text-sm' : 'text-gray-800'}`}>{item.clientName}</p>
        {!isChild && getChain(item.id).length > 0 && (
          <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">
            {getChain(item.id).length} دفعات تابعة
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <p className={`${isChild ? 'text-blue-600' : 'text-blue-700'} font-black`}>
          {item.paidAmount?.toLocaleString()} 
          <span className="text-[10px] font-normal mr-1">dh</span>
        </p>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
          item.paymentMethod === 'cash' ? 'bg-green-100 text-green-700' :
          item.paymentMethod === 'cheque' ? 'bg-orange-100 text-orange-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {item.paymentMethod === 'cash' ? 'نقداً' : item.paymentMethod === 'cheque' ? 'شيك' : 'تحويل'}
        </span>
      </td>
      <td className="px-6 py-4 text-xs text-gray-500 font-sans">
        {item.receiptDate}
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-end items-center gap-1">
          {/* Only show "Add Installment" on Root Receipts */}
          {!isChild && (
            <button 
              onClick={() => onCollect(item)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-black"
              title="قبض دفعة جديدة من هذا السند"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">دفعة جديدة</span>
            </button>
          )}
          
          <button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="تعديل">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={() => onDownload(item)} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg" title="تحميل">
            <Download className="w-4 h-4" />
          </button>
          <button 
            onClick={() => confirm('حذف هذا السند؟ سيتم حذفه نهائياً من القائمة') && onDelete(item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">إدارة السندات</h2>
          <p className="text-gray-500 text-sm">يتم تنظيم الدفعات التابعة بشكل شجري تحت السند الأصلي</p>
        </div>

        <div className="flex flex-col sm:row gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="ابحث بالاسم أو الرقم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pr-10 pl-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl outline-none shadow-sm text-sm"
          >
            <option value="all">كل الطرق</option>
            <option value="cash">نقداً</option>
            <option value="cheque">شيك</option>
            <option value="transfer">تحويل</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">رقم السند</th>
                <th className="px-6 py-4">العميل / الحالة</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">الطريقة</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4 text-center">التحكم</th>
              </tr>
            </thead>
            <tbody>
              {filteredRoots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic">لا توجد سجلات حالياً</td>
                </tr>
              ) : (
                filteredRoots.map((root) => {
                  const chain = getChain(root.id);
                  const isExpanded = expandedChains[root.id] ?? true; // Default expanded

                  return (
                    <React.Fragment key={root.id}>
                      {/* Root Row */}
                      {renderRow(root)}
                      
                      {/* Sub-header if there are children to act as a separator */}
                      {chain.length > 0 && (
                        <tr className="bg-blue-50/20">
                          <td colSpan={6} className="px-6 py-1">
                             <button 
                               onClick={() => toggleChain(root.id)}
                               className="flex items-center gap-2 text-[10px] font-bold text-blue-400 hover:text-blue-600 transition-colors uppercase tracking-tighter"
                             >
                               {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                               {isExpanded ? 'إخفاء الدفعات التابعة' : `عرض ${chain.length} دفعات تابعة لهذا السند`}
                             </button>
                          </td>
                        </tr>
                      )}

                      {/* Children Rows */}
                      {isExpanded && chain.map(child => renderRow(child, true))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
