import React from 'react';
import { CompanyProfile } from '../types/receipt';
import {
  FileText,
  LayoutDashboard,
  PlusCircle,
  Building2,
  FileCheck2,
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'receipts' | 'new';
  setCurrentTab: (tab: 'dashboard' | 'receipts' | 'new') => void;
  company: CompanyProfile;
  onOpenCompanySettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  company,
  onOpenCompanySettings,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm no-print" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-amiri font-bold text-2xl text-slate-900 tracking-wide">
                  سند برو
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-widest font-mono">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                سند قبض مالي احترافي • Ar-Receipt Pro
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>لوحة التحكم</span>
            </button>

            <button
              onClick={() => setCurrentTab('receipts')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'receipts'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>سجل السندات</span>
            </button>

            <button
              onClick={() => setCurrentTab('new')}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                currentTab === 'new'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>سند جديد</span>
            </button>
          </nav>

          {/* Company Settings Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCompanySettings}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold transition-colors shadow-sm"
              title="تعديل اسم الشركة، الشعار والختم الرسمي"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">هوية الشركة</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
