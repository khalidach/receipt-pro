import React, { useState, useEffect } from 'react';
import {
  Receipt,
  CompanyProfile,
  PaymentMethodType,
  ChequeDetails,
  BankTransferDetails,
  PromissoryNoteDetails,
  CashDepositDetails,
  CardDetails,
} from '../types/receipt';
import {
  generateNextReceiptNumber,
  addReceipt,
  updateReceipt,
} from '../utils/storage';
import { tafqeetDirham, formatCurrency } from '../utils/tafqeet';
import { SignaturePadModal } from './SignaturePadModal';
import {
  Save,
  RotateCcw,
  PenTool,
  Check,
  Building,
  CreditCard,
  FileText,
  DollarSign,
  User,
  Users,
  Calendar,
  Sparkles,
  Banknote,
  Landmark,
  ScrollText,
} from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptFormProps {
  initialReceipt?: Receipt | null;
  company: CompanyProfile;
  onSaveSuccess: (receipt: Receipt) => void;
  onCancel: () => void;
}

const COMMON_PURPOSES = [
  'دفعة أولى لتوريد وتثبيت معدات مكتبية وأنظمة معلوماتية بمقر الشركة',
  'تسديد فاتورة خدمات استشارية وتقنية عن شهر نوفمبر',
  'قسط شهري عن عقد إيجار المحل التجاري',
  'أتعاب تصميم وتطوير تطبيق إلكتروني وهوية بصرية كاملة',
  'تسديد رسوم اشتراك سنوي في المنصة الرقمية',
];

export const ReceiptForm: React.FC<ReceiptFormProps> = ({
  initialReceipt,
  company,
  onSaveSuccess,
  onCancel,
}) => {
  const isEditing = Boolean(initialReceipt);

  const [receiptNumber, setReceiptNumber] = useState<string>(
    initialReceipt?.receiptNumber || generateNextReceiptNumber()
  );
  const [date, setDate] = useState<string>(
    initialReceipt?.date || new Date().toISOString().split('T')[0]
  );
  const [clientName, setClientName] = useState<string>(
    initialReceipt?.clientName || ''
  );
  const [totalAmount, setTotalAmount] = useState<string>(
    initialReceipt?.totalAmount && initialReceipt.totalAmount > 0
      ? String(initialReceipt.totalAmount)
      : ''
  );
  const [previousRemainingAmount, setPreviousRemainingAmount] = useState<string>(
    initialReceipt?.previousRemainingAmount !== undefined && initialReceipt.previousRemainingAmount !== null
      ? String(initialReceipt.previousRemainingAmount)
      : ''
  );
  const [paidAmount, setPaidAmount] = useState<number>(
    initialReceipt?.paidAmount || 0
  );
  const [amountInWords, setAmountInWords] = useState<string>(
    initialReceipt?.amountInWords || ''
  );
  const [purpose, setPurpose] = useState<string>(
    initialReceipt?.purpose || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>(
    initialReceipt?.paymentMethod || 'cash'
  );

  // 1. Cheque details (شيك)
  const [chequePerson, setChequePerson] = useState<string>(
    initialReceipt?.chequeDetails?.personName || ''
  );
  const [chequeNumber, setChequeNumber] = useState<string>(
    initialReceipt?.chequeDetails?.chequeNumber || ''
  );
  const [chequeBank, setChequeBank] = useState<string>(
    initialReceipt?.chequeDetails?.bankName || ''
  );
  const [chequeDate, setChequeDate] = useState<string>(
    initialReceipt?.chequeDetails?.chequeDate ||
      new Date().toISOString().split('T')[0]
  );

  // 2. Promissory Note details (كمبيالة)
  const [notePerson, setNotePerson] = useState<string>(
    initialReceipt?.promissoryNoteDetails?.personName || ''
  );
  const [noteNumber, setNoteNumber] = useState<string>(
    initialReceipt?.promissoryNoteDetails?.noteNumber || ''
  );
  const [noteBank, setNoteBank] = useState<string>(
    initialReceipt?.promissoryNoteDetails?.bankName || ''
  );
  const [noteDueDate, setNoteDueDate] = useState<string>(
    initialReceipt?.promissoryNoteDetails?.dueDate ||
      new Date().toISOString().split('T')[0]
  );

  // 3. Bank Transfer details (تحويل بنكي)
  const [transferPerson, setTransferPerson] = useState<string>(
    initialReceipt?.bankTransferDetails?.personName || ''
  );
  const [transferBank, setTransferBank] = useState<string>(
    initialReceipt?.bankTransferDetails?.bankName || ''
  );
  const [transferDate, setTransferDate] = useState<string>(
    initialReceipt?.bankTransferDetails?.transferDate ||
      new Date().toISOString().split('T')[0]
  );
  const [transferRef, setTransferRef] = useState<string>(
    initialReceipt?.bankTransferDetails?.transactionNumber || ''
  );

  // 4. Cash Deposit details (إيداع نقدي)
  const [depositPerson, setDepositPerson] = useState<string>(
    initialReceipt?.cashDepositDetails?.personName || ''
  );
  const [depositNumber, setDepositNumber] = useState<string>(
    initialReceipt?.cashDepositDetails?.depositNumber || ''
  );
  const [depositDate, setDepositDate] = useState<string>(
    initialReceipt?.cashDepositDetails?.depositDate ||
      new Date().toISOString().split('T')[0]
  );
  const [depositBank, setDepositBank] = useState<string>(
    initialReceipt?.cashDepositDetails?.bankName || ''
  );

  // 5. Card details (بطاقة ائتمان / بطاقة خصم مباشر)
  const [cardRef, setCardRef] = useState<string>(
    initialReceipt?.cardDetails?.transactionNumber || ''
  );

  // Signature & Stamp
  const [signatureImage, setSignatureImage] = useState<string | undefined>(
    initialReceipt?.signatureImage
  );
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

  // Optional Travelers List (أسماء المسافرين)
  const [hasTravelers, setHasTravelers] = useState<boolean>(
    initialReceipt?.hasTravelers || Boolean(initialReceipt?.travelers && initialReceipt.travelers.length > 0)
  );
  const [travelers, setTravelers] = useState<string[]>(
    initialReceipt?.travelers || []
  );
  const [newTravelerName, setNewTravelerName] = useState<string>('');

  const handleAddTraveler = (inputStr?: string) => {
    const raw = inputStr !== undefined ? inputStr : newTravelerName;
    if (!raw.trim()) return;

    const parts = raw
      .split(/[,،\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (parts.length > 0) {
      setTravelers(prev => [...prev, ...parts]);
      setNewTravelerName('');
    }
  };

  const handleRemoveTraveler = (index: number) => {
    setTravelers(prev => prev.filter((_, idx) => idx !== index));
  };

  // Automatically update Tafqeet whenever paidAmount changes
  useEffect(() => {
    if (paidAmount > 0) {
      setAmountInWords(tafqeetDirham(paidAmount));
    } else {
      setAmountInWords('');
    }
  }, [paidAmount]);

  // Compute remaining balance according to user specification:
  // 1. If previousRemainingAmount is filled: remainingAmount = previousRemainingAmount - paidAmount
  // 2. Else if totalAmount is filled (>0): remainingAmount = totalAmount - paidAmount
  // 3. Else: not applicable (0)
  const parsedTotal = totalAmount.trim() !== '' ? parseFloat(totalAmount) : 0;
  const hasContract = !isNaN(parsedTotal) && parsedTotal > 0;

  const parsedPrevRemaining =
    previousRemainingAmount.trim() !== ''
      ? parseFloat(previousRemainingAmount)
      : null;

  const remainingAmount =
    parsedPrevRemaining !== null && !isNaN(parsedPrevRemaining)
      ? Math.max(0, parsedPrevRemaining - paidAmount)
      : hasContract
      ? Math.max(0, parsedTotal - paidAmount)
      : 0;

  const handlePaidAmountChange = (val: number) => {
    setPaidAmount(val);
  };

  const handleRegenerateNumber = () => {
    setReceiptNumber(generateNextReceiptNumber());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      toast.error('يرجى إدخال اسم العميل أو الجهة المستلم منها');
      return;
    }

    if (paidAmount <= 0) {
      toast.error('يرجى تحديد المبلغ المدفوع بشكل صحيح');
      return;
    }

    // Validation and construction according to paymentMethod
    let chequeDetails: ChequeDetails | undefined;
    if (paymentMethod === 'cheque') {
      if (!chequeNumber.trim()) {
        toast.error('يرجى إدخال رقم الشيك');
        return;
      }
      chequeDetails = {
        personName: chequePerson.trim() || undefined,
        chequeNumber: chequeNumber.trim(),
        bankName: chequeBank.trim(),
        chequeDate: chequeDate || undefined,
      };
    }

    let promissoryNoteDetails: PromissoryNoteDetails | undefined;
    if (paymentMethod === 'promissory_note') {
      if (!noteNumber.trim()) {
        toast.error('يرجى إدخال رقم الكمبيالة');
        return;
      }
      promissoryNoteDetails = {
        personName: notePerson.trim() || clientName.trim(),
        noteNumber: noteNumber.trim(),
        bankName: noteBank.trim(),
        dueDate: noteDueDate,
      };
    }

    let bankTransferDetails: BankTransferDetails | undefined;
    if (paymentMethod === 'bank_transfer') {
      bankTransferDetails = {
        personName: transferPerson.trim() || clientName.trim(),
        bankName: transferBank.trim(),
        transferDate,
        transactionNumber: transferRef.trim() || undefined,
      };
    }

    let cashDepositDetails: CashDepositDetails | undefined;
    if (paymentMethod === 'cash_deposit') {
      if (!depositNumber.trim()) {
        toast.error('يرجى إدخال رقم الإيداع');
        return;
      }
      cashDepositDetails = {
        personName: depositPerson.trim() || clientName.trim(),
        depositNumber: depositNumber.trim(),
        depositDate,
        bankName: depositBank.trim() || undefined,
      };
    }

    let cardDetails: CardDetails | undefined;
    if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      cardDetails = {
        cardType: paymentMethod === 'credit_card' ? 'بطاقة ائتمان' : 'بطاقة الخصم المباشر',
        transactionNumber: cardRef.trim() || undefined,
      };
    }

    const receiptData: Receipt = {
      id: initialReceipt?.id || `receipt-${Date.now()}`,
      receiptNumber,
      date,
      clientName: clientName.trim(),
      totalAmount: hasContract ? parsedTotal : undefined,
      initialPaidAmount:
        initialReceipt?.initialPaidAmount ??
        (initialReceipt?.parentReceiptId ? undefined : paidAmount),
      previousRemainingAmount:
        parsedPrevRemaining !== null && !isNaN(parsedPrevRemaining)
          ? parsedPrevRemaining
          : undefined,
      paidAmount,
      remainingAmount: hasContract || (parsedPrevRemaining !== null && !isNaN(parsedPrevRemaining)) ? remainingAmount : undefined,
      amountInWords: amountInWords || tafqeetDirham(paidAmount),
      purpose: purpose.trim() || 'تسديد دفعة مالية',
      paymentMethod,
      chequeDetails,
      promissoryNoteDetails,
      bankTransferDetails,
      cashDepositDetails,
      cardDetails,
      hasTravelers,
      travelers: hasTravelers ? travelers : [],
      signatureImage,
      stampImage: initialReceipt?.stampImage || company.stampUrl,
      parentReceiptId: initialReceipt?.parentReceiptId,
      installments: initialReceipt?.installments || [],
      createdAt: initialReceipt?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEditing) {
      updateReceipt(receiptData);
      toast.success('تم تحديث بيانات سند القبض بنجاح');
    } else {
      addReceipt(receiptData);
      toast.success('تم إصدار سند القبض بنجاح!');
    }

    onSaveSuccess(receiptData);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 max-w-4xl mx-auto" dir="rtl">
      {/* Form Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-bold font-amiri text-slate-900">
            {isEditing ? 'تعديل سند القبض المالي' : 'إصدار سند قبض مالي جديد'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            املأ بيانات السند أدناه، وسيتم توليد التفقيط بالدرهم المغربي وحساب الرصيد تلقائياً.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {isEditing ? 'وضع التعديل' : 'سند جديد'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Receipt Number & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              رقم السند (Receipt No.)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                required
                value={receiptNumber}
                onChange={e => setReceiptNumber(e.target.value)}
                className="w-full font-mono font-bold text-blue-700 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white"
                placeholder="R-712860"
              />
              <button
                type="button"
                onClick={handleRegenerateNumber}
                title="توليد رقم جديد"
                className="p-2.5 text-slate-500 hover:text-blue-600 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">
              تاريخ السند (Date)
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Client Name (وصلنا من السيد / السادة) */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-600" />
            وصلنا من السيد / السادة (اسم العميل أو المؤسسة)
          </label>
          <input
            type="text"
            required
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="مثال: السيد / محمد العمراني، شركة الأطلس للاستثمار..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900 font-semibold"
          />
        </div>

        {/* Optional Travelers Box Toggle & Inputs (أسماء المسافرين) */}
        <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={hasTravelers}
                onChange={e => setHasTravelers(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" />
                إضافة خانة أسماء المسافرين (اختياري - تظهر أسفل بيانات المستلم)
              </span>
            </label>
            <span className="text-xs text-slate-500 font-medium">
              {hasTravelers ? `${travelers.length} مسافرين مسجلين` : 'غير مفعل'}
            </span>
          </div>

          {hasTravelers && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 animate-in fade-in">
              <p className="text-xs text-slate-500 leading-relaxed">
                أدخل أسماء المسافرين لتظهر في صندوق خاص ومستقل في السند والـ PDF أسفل بيانات المستلم:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTravelerName}
                  onChange={e => setNewTravelerName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTraveler();
                    }
                  }}
                  placeholder="اكتب اسم المسافر ثم اضغط إضافة أو مفتاح Enter (مثال: خالد اشبوخ)..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddTraveler()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm whitespace-nowrap"
                >
                  + إضافة مسافر
                </button>
              </div>

              <div className="text-[11px] text-slate-500">
                💡 <span className="font-semibold text-slate-700">ملاحظة:</span> يمكنك لصق قائمة كاملة من الأسماء مفصولة بفواصل، مثل:
                <span className="font-semibold text-blue-700"> خالد اشبوخ، نوال اشبوخ، سعيد اشبوخ</span>
              </div>

              {/* Display added travelers as numbered chips */}
              {travelers.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  {travelers.map((traveler, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 shadow-xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-mono text-[10px]">
                        {index + 1}
                      </span>
                      <span>{traveler}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTraveler(index)}
                        className="w-4 h-4 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center font-bold text-sm transition-colors mr-1"
                        title="إزالة هذا المسافر"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTravelers([])}
                    className="text-xs text-red-600 hover:underline px-2 py-1 font-semibold"
                  >
                    حذف كافة الأسماء
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  لم تقم بإضافة أي مسافر بعد. أدخل الأسماء في الحقل أعلاه لتظهر في السند المطبوع.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row 3: Financials in the exact required order:
            1. إجمالي العقد / المطلوب
            2. المبلغ المتبقي في الدفعة الأخيرة (اختياري)
            3. المبلغ الحالي
            4. المبلغ المتبقي
        */}
        <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. إجمالي العقد / المطلوب */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ١. إجمالي العقد / المطلوب (dh)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white font-mono font-bold text-slate-800"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                القيمة الكلية للاتفاق أو العقد
              </span>
            </div>

            {/* 2. المبلغ المتبقي في الدفعة الأخيرة (اختياري للسند الجديد) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>٢. المبلغ المتبقي في الدفعة الأخيرة (dh)</span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  اختياري
                </span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={previousRemainingAmount}
                onChange={e => setPreviousRemainingAmount(e.target.value)}
                placeholder="اتركه فارغاً إذا كان السند لأول مرة"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-white font-mono font-bold text-slate-800"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                في حال ملئه: المتبقي = هذا المبلغ - المبلغ الحالي
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* 3. المبلغ الحالي */}
            <div>
              <label className="block text-xs font-bold text-blue-900 mb-1">
                ٣. المبلغ الحالي المقبوض في هذا السند (dh) *
              </label>
              <input
                type="number"
                min="0.01"
                step="any"
                required
                value={paidAmount || ''}
                onChange={e => handlePaidAmountChange(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-blue-600 focus:ring-2 focus:ring-blue-500 bg-white font-mono font-extrabold text-blue-700 text-lg shadow-sm"
              />
              <span className="text-[11px] text-blue-600 mt-1 block font-medium">
                المبلغ المقبوض حالياً والذي سيتم تفقيطه
              </span>
            </div>

            {/* 4. المبلغ المتبقي */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>٤. المبلغ المتبقي (dh)</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {parsedPrevRemaining !== null && !isNaN(parsedPrevRemaining)
                    ? 'المتبقي = متبقي السابقة - الحالي'
                    : 'المتبقي = الإجمالي - الحالي'}
                </span>
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono font-extrabold text-amber-700 text-lg flex items-center justify-between">
                <span>{remainingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                <span className="text-xs text-slate-500 font-bold">{company.currencySymbol}</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                الرصيد المتبقي بعد قبض هذا السند
              </span>
            </div>
          </div>
        </div>

        {/* Row 4: Tafqeet (تفقيط المبلغ بالكلمات) */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              مبلغ وقدره (التفقيط باللغة العربية)
            </span>
            <span className="text-xs text-slate-500 font-normal">
              بالدرهم المغربي مع السنتيمات
            </span>
          </label>
          <div className="relative">
            <textarea
              rows={2}
              value={amountInWords}
              onChange={e => setAmountInWords(e.target.value)}
              placeholder="خمسة آلاف درهم مغربي فقط لا غير..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-800 font-bold text-base leading-relaxed bg-amber-50/20"
            />
          </div>
        </div>

        {/* Row 5: Payment Method Selector */}
        <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50">
          <label className="block text-sm font-bold text-slate-800 mb-3">
            طريقة الدفع (Payment Method)
          </label>

          {/* Grid of All 7 Payment Methods */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
            {/* 1. Cash */}
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 font-bold transition-all text-xs ${
                paymentMethod === 'cash'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>نقداً</span>
            </button>

            {/* 2. Credit Card */}
            <button
              type="button"
              onClick={() => setPaymentMethod('credit_card')}
              className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 font-bold transition-all text-xs ${
                paymentMethod === 'credit_card'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>بطاقة ائتمان</span>
            </button>

            {/* 3. Debit Card */}
            <button
              type="button"
              onClick={() => setPaymentMethod('debit_card')}
              className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 font-bold transition-all text-xs ${
                paymentMethod === 'debit_card'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>خصم مباشر</span>
            </button>

            {/* 4. Cheque */}
            <button
              type="button"
              onClick={() => setPaymentMethod('cheque')}
              className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 font-bold transition-all text-xs ${
                paymentMethod === 'cheque'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>الشيك</span>
            </button>

            {/* 5. Promissory Note */}
            <button
              type="button"
              onClick={() => setPaymentMethod('promissory_note')}
              className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 font-bold transition-all text-xs ${
                paymentMethod === 'promissory_note'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <ScrollText className="w-4 h-4" />
              <span>الكمبيالة</span>
            </button>

            {/* 6. Bank Transfer */}
            <button
              type="button"
              onClick={() => setPaymentMethod('bank_transfer')}
              className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 font-bold transition-all text-xs ${
                paymentMethod === 'bank_transfer'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>تحويل بنكي</span>
            </button>

            {/* 7. Cash Deposit */}
            <button
              type="button"
              onClick={() => setPaymentMethod('cash_deposit')}
              className={`p-2.5 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 font-bold transition-all text-xs ${
                paymentMethod === 'cash_deposit'
                  ? 'border-blue-600 bg-blue-50/80 text-blue-900 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>إيداع نقدي</span>
            </button>
          </div>

          {/* Conditional Sub-fields for Cheque (الشيك) */}
          {paymentMethod === 'cheque' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-slate-200 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الشخص / الساحب
                </label>
                <input
                  type="text"
                  value={chequePerson}
                  onChange={e => setChequePerson(e.target.value)}
                  placeholder="اسم صاحب الشيك"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الشيك *
                </label>
                <input
                  type="text"
                  required
                  value={chequeNumber}
                  onChange={e => setChequeNumber(e.target.value)}
                  placeholder="CHQ-123456"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم البنك *
                </label>
                <input
                  type="text"
                  required
                  value={chequeBank}
                  onChange={e => setChequeBank(e.target.value)}
                  placeholder="التجاري وفا بنك، بنك إفريقيا..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          )}

          {/* Conditional Sub-fields for Promissory Note (الكمبيالة) */}
          {paymentMethod === 'promissory_note' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-white rounded-xl border border-slate-200 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الشخص (المسحوب عليه) *
                </label>
                <input
                  type="text"
                  required
                  value={notePerson}
                  onChange={e => setNotePerson(e.target.value)}
                  placeholder="اسم الشخص أو المؤسسة"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الكمبيالة *
                </label>
                <input
                  type="text"
                  required
                  value={noteNumber}
                  onChange={e => setNoteNumber(e.target.value)}
                  placeholder="LC-7890"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم البنك *
                </label>
                <input
                  type="text"
                  required
                  value={noteBank}
                  onChange={e => setNoteBank(e.target.value)}
                  placeholder="البنك الشعبي، الشركة العامة..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تاريخ الاستحقاق *
                </label>
                <input
                  type="date"
                  required
                  value={noteDueDate}
                  onChange={e => setNoteDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          )}

          {/* Conditional Sub-fields for Bank Transfer (تحويل بنكي) */}
          {paymentMethod === 'bank_transfer' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-slate-200 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الشخص (المحول) *
                </label>
                <input
                  type="text"
                  required
                  value={transferPerson}
                  onChange={e => setTransferPerson(e.target.value)}
                  placeholder="اسم الشخص المحول"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم البنك *
                </label>
                <input
                  type="text"
                  required
                  value={transferBank}
                  onChange={e => setTransferBank(e.target.value)}
                  placeholder="التجاري وفا بنك، CIH..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تاريخ التحويل *
                </label>
                <input
                  type="date"
                  required
                  value={transferDate}
                  onChange={e => setTransferDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
            </div>
          )}

          {/* Conditional Sub-fields for Cash Deposit (الإيداع النقدي) */}
          {paymentMethod === 'cash_deposit' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white rounded-xl border border-slate-200 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الشخص (المودع) *
                </label>
                <input
                  type="text"
                  required
                  value={depositPerson}
                  onChange={e => setDepositPerson(e.target.value)}
                  placeholder="اسم المودع"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الإيداع (وصل البنك) *
                </label>
                <input
                  type="text"
                  required
                  value={depositNumber}
                  onChange={e => setDepositNumber(e.target.value)}
                  placeholder="DEP-5678"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تاريخ الإيداع *
                </label>
                <input
                  type="date"
                  required
                  value={depositDate}
                  onChange={e => setDepositDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
            </div>
          )}

          {/* Conditional Sub-fields for Credit Card & Debit Card */}
          {(paymentMethod === 'credit_card' || paymentMethod === 'debit_card') && (
            <div className="p-4 bg-white rounded-xl border border-slate-200 animate-in fade-in">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                رقم العملية / مرجع الدفع الإلكتروني (اختياري)
              </label>
              <input
                type="text"
                value={cardRef}
                onChange={e => setCardRef(e.target.value)}
                placeholder="POS-TXN-123456"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
          )}
        </div>

        {/* Row 6: Purpose (وذلك مقابل / عن) */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-1.5">
            وذلك مقابل (بيان السبب أو الخدمة)
          </label>
          <textarea
            rows={3}
            required
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            placeholder="اكتب تفاصيل ومبرر الدفعة المالية..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-slate-900 leading-relaxed font-tajawal"
          />

          {/* Quick purpose suggestions */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <span className="text-xs text-slate-500">اقتراحات سريعة:</span>
            {COMMON_PURPOSES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPurpose(p)}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full transition-colors border border-slate-200 text-right truncate max-w-xs"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Row 7: Digital Signature Pad */}
        <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                توقيع المحاسب / المستلم
              </h4>
              <p className="text-xs text-slate-500">
                {signatureImage
                  ? 'تم إرفاق التوقيع الرقمي بنجاح'
                  : 'يمكنك التوقيع إلكترونياً الآن وحفظه على السند'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {signatureImage && (
              <div className="h-10 w-24 border rounded-lg bg-white p-1 flex items-center justify-center shadow-inner">
                <img
                  src={signatureImage}
                  alt="التوقيع"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}
            <button
              type="button"
              onClick={() => setIsSignatureModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-bold text-xs shadow-sm transition-colors"
            >
              {signatureImage ? 'تغيير التوقيع' : 'فتح لوحة التوقيع'}
            </button>
            {signatureImage && (
              <button
                type="button"
                onClick={() => setSignatureImage(undefined)}
                className="text-xs text-red-600 hover:underline"
              >
                حذف
              </button>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'حفظ التعديلات' : 'إصدار ومعاينة السند'}</span>
          </button>
        </div>
      </form>

      {/* Signature Modal */}
      <SignaturePadModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={sig => {
          setSignatureImage(sig);
          toast.success('تم تسجيل التوقيع الرقمي');
        }}
        initialSignature={signatureImage}
      />
    </div>
  );
};
