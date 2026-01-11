
import React, { useState, useEffect, useRef } from 'react';
import { ReceiptForm } from './components/ReceiptForm';
import { ReceiptPreview } from './components/ReceiptPreview';
import { Dashboard } from './components/Dashboard';
import { ReceiptList } from './components/ReceiptList';
import { ReceiptData, ViewType, PaymentHistory } from './types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  FileText, 
  LayoutDashboard, 
  PlusCircle, 
  ListOrdered, 
  Download, 
  Printer, 
  ChevronLeft
} from 'lucide-react';

const INITIAL_STATE = (): ReceiptData => ({
  id: Date.now().toString(),
  companyName: '',
  companyLogo: null,
  receiptNumber: `R-${Math.floor(100000 + Math.random() * 900000)}`,
  receiptDate: new Date().toISOString().split('T')[0],
  clientName: '',
  totalPrice: null,
  paidAmount: null,
  purpose: '',
  paymentMethod: 'cash',
  signature: null,
  stamp: null,
  createdAt: Date.now(),
  previousPayments: [],
});

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [data, setData] = useState<ReceiptData>(INITIAL_STATE());
  const [history, setHistory] = useState<ReceiptData[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // States for the export process
  const [exportData, setExportData] = useState<ReceiptData | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  const receiptRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('receipt_history');
    const savedConfig = localStorage.getItem('company_config');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setData(prev => ({ 
        ...prev, 
        companyName: config.companyName || prev.companyName, 
        companyLogo: config.companyLogo || prev.companyLogo, 
        stamp: config.stamp || prev.stamp 
      }));
    }
  }, []);

  useEffect(() => {
    const config = { companyName: data.companyName, companyLogo: data.companyLogo, stamp: data.stamp };
    localStorage.setItem('company_config', JSON.stringify(config));
  }, [data.companyName, data.companyLogo, data.stamp]);

  const handleUpdate = (updates: Partial<ReceiptData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const navigateToEditor = (receipt?: ReceiptData) => {
    if (receipt) {
      setData(receipt);
      setEditingId(receipt.id);
    } else {
      setData(INITIAL_STATE());
      setEditingId(null);
    }
    setCurrentView('editor');
  };

  const handleCollectInstallment = (parent: ReceiptData) => {
    const rootId = parent.parentId || parent.id;
    const rootReceipt = history.find(r => r.id === rootId) || parent;
    const existingChildren = history.filter(r => r.parentId === rootId);
    
    const allPreviousInChain = [rootReceipt, ...existingChildren]
      .sort((a, b) => a.createdAt - b.createdAt);

    const fullChainHistory: PaymentHistory[] = allPreviousInChain.map(r => ({
      receiptNumber: r.receiptNumber,
      date: r.receiptDate,
      amount: r.paidAmount || 0,
      method: r.paymentMethod === 'cash' ? 'نقداً' : r.paymentMethod === 'cheque' ? 'شيك' : 'تحويل'
    }));

    const newState: ReceiptData = {
      ...INITIAL_STATE(),
      companyName: data.companyName,
      companyLogo: data.companyLogo,
      stamp: data.stamp,
      clientName: rootReceipt.clientName,
      totalPrice: rootReceipt.totalPrice,
      purpose: rootReceipt.purpose,
      parentId: rootId,
      previousPayments: fullChainHistory,
    };

    setData(newState);
    setEditingId(null);
    setCurrentView('editor');
  };

  const handleSave = () => {
    let newHistory;
    if (editingId) {
      newHistory = history.map(item => item.id === editingId ? data : item);
    } else {
      newHistory = [data, ...history];
    }
    setHistory(newHistory);
    localStorage.setItem('receipt_history', JSON.stringify(newHistory));
    setCurrentView('list');
  };

  const handleDelete = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('receipt_history', JSON.stringify(newHistory));
  };

  const handleExportPDF = async (receiptToExport?: ReceiptData) => {
    // Set the data to be exported
    const targetData = receiptToExport || data;
    setExportData(targetData);
    setIsExporting(true);

    // Give react a tiny bit of time to render the export hidden div
    setTimeout(async () => {
      try {
        if (!exportRef.current) {
          console.error("Export element not found");
          setIsExporting(false);
          return;
        }

        await document.fonts.ready;
        
        const canvas = await html2canvas(exportRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        pdf.save(`receipt_${targetData.receiptNumber}.pdf`);
      } catch (error) {
        console.error("PDF Export failed:", error);
      } finally {
        setIsExporting(false);
        setExportData(null);
      }
    }, 300);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row rtl" dir="rtl">
      {/* Hidden Export Area - Always present but outside screen view */}
      <div className="fixed -left-[4000px] top-0 pointer-events-none" aria-hidden="true">
        <div ref={exportRef}>
          {exportData && <ReceiptPreview data={exportData} />}
        </div>
      </div>

      <aside className="no-print w-full md:w-64 bg-white border-l border-gray-200 flex flex-col shadow-sm z-20">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 text-blue-700">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">سند برو</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setCurrentView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${currentView === 'dashboard' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
            <LayoutDashboard className="w-5 h-5" />
            لوحة التحكم
          </button>
          <button onClick={() => setCurrentView('list')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${currentView === 'list' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
            <ListOrdered className="w-5 h-5" />
            قائمة السندات
          </button>
          <button onClick={() => navigateToEditor()} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${currentView === 'editor' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
            <PlusCircle className="w-5 h-5" />
            إنشاء سند جديد
          </button>
        </nav>
        
        {isExporting && (
          <div className="p-4 bg-blue-50 border-t border-blue-100 animate-pulse">
            <p className="text-xs text-blue-600 font-bold text-center">جاري تحضير الملف...</p>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8">
          {currentView === 'dashboard' && <Dashboard history={history} onNavigateToList={() => setCurrentView('list')} onEditReceipt={navigateToEditor} />}
          {currentView === 'list' && <ReceiptList history={history} onEdit={navigateToEditor} onDelete={handleDelete} onDownload={handleExportPDF} onCollect={handleCollectInstallment} />}
          {currentView === 'editor' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
              <div className="no-print space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{editingId ? 'تعديل سند' : 'إنشاء سند جديد'}</h2>
                  <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium">إلغاء<ChevronLeft className="w-4 h-4" /></button>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <ReceiptForm data={data} onUpdate={handleUpdate} />
                  <div className="mt-8 flex gap-4 pt-6 border-t border-gray-100">
                    <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                      {editingId ? 'حفظ التعديلات' : 'حفظ السند'}
                    </button>
                    <button onClick={handlePrint} className="bg-gray-800 text-white p-3 rounded-xl hover:bg-gray-900 transition-colors"><Printer className="w-6 h-6" /></button>
                    <button 
                      onClick={() => handleExportPDF()} 
                      disabled={isExporting}
                      className={`p-3 rounded-xl transition-colors ${isExporting ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      <Download className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="no-print mb-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">معاينة مباشرة</div>
                <div className="receipt-container scale-[0.45] sm:scale-[0.6] xl:scale-[0.8] 2xl:scale-100 origin-top bg-white shadow-2xl rounded-sm">
                  <div ref={receiptRef}><ReceiptPreview data={data} /></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
