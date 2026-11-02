import React, { useState, useEffect } from 'react';
import { CompanyProfile } from '../types/receipt';
import {
  saveCompanyProfile,
  backupDatabase,
  restoreDatabase,
  getDatabaseInfo,
  openDatabaseFolder,
} from '../utils/storage';
import {
  X,
  Building2,
  Upload,
  Trash2,
  Check,
  Stamp,
  Database,
  Download,
  FolderOpen,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
  onUpdate: (updated: CompanyProfile) => void;
  onReceiptsReload?: () => void;
}

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  isOpen,
  onClose,
  company,
  onUpdate,
  onReceiptsReload,
}) => {
  const [formData, setFormData] = useState<CompanyProfile>(company);
  const [dbInfo, setDbInfo] = useState<{ path: string; sizeBytes: number; receiptCount: number } | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(company);
      getDatabaseInfo().then((info) => {
        if (info) setDbInfo(info);
      });
    }
  }, [isOpen, company]);

  if (!isOpen) return null;

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      const res = await backupDatabase();
      if (res.success && !res.canceled) {
        toast.success(res.filePath ? `تم إنشاء النسخة الاحتياطية بنجاح: ${res.filePath}` : 'تم تنزيل النسخة الاحتياطية بنجاح');
      } else if (res.error) {
        toast.error(`فشل النسخ الاحتياطي: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(`حدث خطأ أثناء النسخ الاحتياطي: ${err.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!window.confirm('هل أنت متأكد من استعادة قاعدة البيانات؟ سيتم استبدال البيانات الحالية بالبيانات المستوردة.')) {
      return;
    }
    try {
      setIsRestoring(true);
      const res = await restoreDatabase();
      if (res.success) {
        toast.success(`تمت استعادة البيانات بنجاح (${res.receiptsCount || 0} سند)`);
        if (onReceiptsReload) onReceiptsReload();
        getDatabaseInfo().then(info => { if (info) setDbInfo(info); });
      } else if (res.error) {
        toast.error(`فشل الاستيراد: ${res.error}`);
      }
    } catch (err: any) {
      toast.error(`حدث خطأ أثناء الاستعادة: ${err.message}`);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleOpenFolder = async () => {
    const success = await openDatabaseFolder();
    if (!success) {
      toast.info('ميزة فتح المجلد متاحة فقط داخل تطبيق الديسكتوب');
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logoUrl' | 'stampUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً. يرجى اختيار صورة أقل من 2 ميغابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result as string;
      setFormData(prev => ({ ...prev, [field]: dataUrl }));
      toast.success(
        field === 'logoUrl' ? 'تم تحميل الشعار بنجاح' : 'تم تحميل الختم بنجاح'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanyProfile(formData);
    onUpdate(formData);
    toast.success('تم حفظ بيانات وهوية الشركة بنجاح');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        dir="rtl"
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 my-8"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-amiri text-slate-900">
                إعدادات وهوية الشركة الرسمية
              </h3>
              <p className="text-xs text-slate-500">
                تظهر هذه البيانات تلقائياً في رأس وتذييل كافة سندات القبض المطبوعة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Company Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اسم الشركة / المؤسسة (بالعربية) *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="اسم الشركة"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-amiri font-bold text-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نوع الوثيقة (العنوان الفرعي)
              </label>
              <input
                type="text"
                value={formData.subtitle || ''}
                onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="سند قبض مالي"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-amiri"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                العنوان بالإنجليزية (English Title)
              </label>
              <input
                type="text"
                value={formData.nameEn || ''}
                onChange={e => setFormData({ ...formData, nameEn: e.target.value })}
                placeholder="OFFICIAL PAYMENT RECEIPT"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm tracking-wider"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                المعرف المالي والضريبي (ICE / RC)
              </label>
              <input
                type="text"
                value={formData.taxNumber || ''}
                onChange={e => setFormData({ ...formData, taxNumber: e.target.value })}
                placeholder="ICE: 002134567890001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          </div>

          {/* Logo & Official Stamp Uploads */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            {/* Logo */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                شعار الشركة (Company Logo)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-slate-300 text-xs">لا يوجد شعار</span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 shadow-sm transition-colors">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>تحميل شعار</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileChange(e, 'logoUrl')}
                      className="hidden"
                    />
                  </label>
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: undefined })}
                      className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:underline"
                    >
                      <Trash2 className="w-3 h-3" />
                      إزالة
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stamp */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                الختم الرسمي للشركة (Official Stamp)
              </label>
              <div className="flex items-center gap-3">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden">
                  {formData.stampUrl ? (
                    <img
                      src={formData.stampUrl}
                      alt="Stamp"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Stamp className="w-6 h-6 text-slate-300" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 shadow-sm transition-colors">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>تحميل الختم</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileChange(e, 'stampUrl')}
                      className="hidden"
                    />
                  </label>
                  {formData.stampUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, stampUrl: undefined })}
                      className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:underline"
                    >
                      <Trash2 className="w-3 h-3" />
                      إزالة
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                الهاتف
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+212 5XX-XXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                العنوان
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="الدار البيضاء، المغرب"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* SQLite Database & Backup Center */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Database className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold">قاعدة البيانات المحلية (SQLite) والنسخ الاحتياطي</h4>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {dbInfo ? `${dbInfo.receiptCount} سند محفوظ` : 'نشط'}
              </span>
            </div>

            {dbInfo?.path && (
              <div className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 rounded-lg p-2 overflow-x-auto select-all">
                مسار القاعدة: {dbInfo.path}
              </div>
            )}

            <p className="text-xs text-slate-500 leading-relaxed">
              تُحفظ كافة سندات القبض وبيانات الشركة محلياً في قاعدة بيانات SQLite آمنة فائقة السرعة على جهازك. يمكنك أخذ نسخة احتياطية لحفظها في فلاشة USB أو استعادتها في أي وقت.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleBackup}
                disabled={isBackingUp}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isBackingUp ? 'جاري التصدير...' : 'تصدير نسخة احتياطية (.db)'}</span>
              </button>

              <button
                type="button"
                onClick={handleRestore}
                disabled={isRestoring}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span>{isRestoring ? 'جاري الاستيراد...' : 'استيراد واستعادة'}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenFolder}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <FolderOpen className="w-4 h-4 text-amber-600" />
                <span>فتح مجلد البيانات</span>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all"
            >
              <Check className="w-4 h-4" />
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
