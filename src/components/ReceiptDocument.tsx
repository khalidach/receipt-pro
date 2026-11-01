import React from "react";
import { Receipt, CompanyProfile } from "../types/receipt";
import { formatCurrency } from "../utils/tafqeet";

interface ReceiptDocumentProps {
  receipt: Receipt;
  company: CompanyProfile;
  showInstallmentHistory?: boolean;
  onDeleteInstallment?: (installmentId: string) => void;
}

export const ReceiptDocument: React.FC<ReceiptDocumentProps> = ({
  receipt,
  company,
  showInstallmentHistory = false,
  onDeleteInstallment,
}) => {
  const isCash = receipt.paymentMethod === "cash";
  const isCheque = receipt.paymentMethod === "cheque";
  const isBankTransfer = receipt.paymentMethod === "bank_transfer";

  return (
    <div
      id="receipt-print-area"
      dir="rtl"
      className="receipt-sheet bg-white text-slate-900 mx-auto w-full max-w-[800px] p-8 sm:p-12 shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-8 font-tajawal select-none"
      style={{
        minHeight: "1050px",
        boxSizing: "border-box",
      }}
    >
      {/* ================= HEADER SECTION ================= */}
      <div className="flex items-start justify-between gap-4 mb-4">
        {/* Top Right: Company Header */}
        <div className="text-right flex-1">
          <h1 className="text-3xl sm:text-4xl font-bold font-amiri text-slate-900 leading-tight mb-1">
            {company.name || "اسم الشركة"}
          </h1>
          <p className="text-lg sm:text-xl font-amiri text-slate-600 font-semibold mb-0.5">
            {company.subtitle || "سند قبض مالي"}
          </p>
          <p className="text-[11px] sm:text-xs tracking-[0.25em] text-slate-400 font-medium uppercase font-serif">
            {company.nameEn || "OFFICIAL PAYMENT RECEIPT"}
          </p>
          {company.taxNumber && (
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              {company.taxNumber}
            </p>
          )}
        </div>

        {/* Top Center: Company Logo Box */}
        <div className="flex-shrink-0 flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 flex items-center justify-center p-2 overflow-hidden shadow-inner">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt="Logo"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span className="text-slate-300 font-tajawal text-xs text-center font-medium">
                شعار الشركة
              </span>
            )}
          </div>
        </div>

        {/* Top Left: Receipt Number & Date Box */}
        <div className="w-48 sm:w-56 rounded-2xl border-2 border-slate-800 p-3 sm:p-4 bg-white shadow-sm flex flex-col justify-center space-y-2">
          <div className="flex items-center justify-between text-base sm:text-lg">
            <span className="font-bold text-slate-800 text-sm sm:text-base">
              الرقم:
            </span>
            <span className="font-mono font-extrabold text-blue-700 tracking-wider">
              {receipt.receiptNumber}
            </span>
          </div>
          <div className="flex items-center justify-between text-base sm:text-lg border-t border-slate-200 pt-1.5">
            <span className="font-bold text-slate-800 text-sm sm:text-base">
              التاريخ:
            </span>
            <span className="font-mono font-bold text-slate-900">
              {receipt.date}
            </span>
          </div>
        </div>
      </div>

      {/* Main Divider Line across the receipt */}
      <div className="w-full border-b-2 border-slate-800 mb-8 mt-2" />

      {/* ================= SECTION 1: RECIPIENT INFO (بيانات المستلم) ================= */}
      <div className="relative border-2 border-slate-800 rounded-2xl p-6 mb-7 bg-white">
        {/* Border Title Badge */}
        <div className="absolute -top-3.5 right-6 px-3 bg-white font-bold text-slate-900 text-base sm:text-lg tracking-wide">
          بيانات المستلم
        </div>

        {/* Line 1: وصلنا من السيد / السادة */}
        <div className="flex items-baseline gap-3 mb-5">
          <span className="font-bold text-slate-900 text-base sm:text-lg whitespace-nowrap">
            وصلنا من السيد / السادة :
          </span>
          <div className="flex-1 relative pb-1">
            <div className="text-base sm:text-lg font-bold text-slate-800 px-2 font-tajawal">
              {receipt.clientName ||
                "........................................................"}
            </div>
            <div className="w-full border-b-2 border-dotted border-slate-400 absolute bottom-0 left-0 right-0" />
          </div>
        </div>

        {/* Line 2: مبلغ وقدره */}
        <div className="flex items-baseline gap-3">
          <span className="font-bold text-slate-900 text-base sm:text-lg whitespace-nowrap">
            مبلغ وقدره :
          </span>
          <div className="flex-1 relative pb-1">
            <div className="text-base sm:text-lg font-semibold text-slate-800 px-2 leading-relaxed">
              {receipt.amountInWords ||
                "........................................................"}
            </div>
            <div className="w-full border-b-2 border-dotted border-slate-400 absolute bottom-0 left-0 right-0" />
          </div>
        </div>
      </div>

      {/* ================= OPTIONAL SECTION: TRAVELERS INFO (بيانات المسافرين) ================= */}
      {receipt.hasTravelers &&
        receipt.travelers &&
        receipt.travelers.length > 0 && (
          <div className="relative border-2 border-slate-800 rounded-2xl p-5 mb-7 bg-white">
            {/* Border Title Badge */}
            <div className="absolute -top-3.5 right-6 px-3 bg-white font-bold text-slate-900 text-base sm:text-lg tracking-wide flex items-center gap-2">
              <span>بيانات المسافرين</span>
              <span className="text-xs font-mono font-medium text-slate-500">
                ({receipt.travelers.length} مسافر)
              </span>
            </div>

            <div className="pt-2">
              <div className="flex flex-wrap items-center gap-2.5">
                {receipt.travelers.map((traveler, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-300 bg-slate-50/80 text-slate-900 text-sm sm:text-base font-bold shadow-xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-white text-xs font-mono flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>{traveler}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* ================= SECTION 2: PAYMENT METHOD & FINANCIAL ACCOUNT ================= */}
      {/* Right Column: طريقة الدفع (md:col-span-5) | Left Column: الحساب المالي (md:col-span-7) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-7">
        {/* Right Column (First in RTL): طريقة الدفع (md:col-span-5) - Only selected method shown */}
        <div className="relative border-2 border-slate-800 rounded-2xl p-5 bg-white md:col-span-5 flex flex-col justify-between">
          {/* Border Title Badge */}
          <div className="absolute -top-3.5 right-6 px-3 bg-white font-bold text-slate-900 text-base sm:text-lg tracking-wide">
            طريقة الدفع
          </div>

          <div className="pt-2 text-sm sm:text-base space-y-2.5">
            {/* CASH (نقداً) */}
            {receipt.paymentMethod === "cash" && (
              <div className="space-y-2 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border-2 border-slate-800 flex items-center justify-center bg-slate-900">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">
                    نقداً (Cash)
                  </span>
                </div>
                <p className="text-xs text-slate-500 pr-7">
                  تم استلام المبلغ نقداً وبعملة الدرهم المغربي
                </p>
              </div>
            )}

            {/* CREDIT CARD (بطاقة ائتمان) */}
            {receipt.paymentMethod === "credit_card" && (
              <div className="space-y-2 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border-2 border-slate-800 flex items-center justify-center bg-slate-900">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">
                    بطاقة ائتمان (Credit Card)
                  </span>
                </div>
                {receipt.cardDetails?.transactionNumber && (
                  <div className="pr-7 text-xs text-slate-700">
                    رقم العملية:{" "}
                    <strong className="font-mono">
                      {receipt.cardDetails.transactionNumber}
                    </strong>
                  </div>
                )}
              </div>
            )}

            {/* DEBIT CARD (بطاقة الخصم المباشر) */}
            {receipt.paymentMethod === "debit_card" && (
              <div className="space-y-2 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border-2 border-slate-800 flex items-center justify-center bg-slate-900">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">
                    بطاقة الخصم المباشر (Debit Card)
                  </span>
                </div>
                {receipt.cardDetails?.transactionNumber && (
                  <div className="pr-7 text-xs text-slate-700">
                    رقم العملية:{" "}
                    <strong className="font-mono">
                      {receipt.cardDetails.transactionNumber}
                    </strong>
                  </div>
                )}
              </div>
            )}

            {/* CHEQUE (شيك) */}
            {receipt.paymentMethod === "cheque" && (
              <div className="space-y-2 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border-2 border-slate-800 flex items-center justify-center bg-slate-900">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">
                    شيك بنكي (Cheque)
                  </span>
                </div>
                <div className="pr-7 space-y-1.5 text-xs sm:text-sm text-slate-800">
                  {receipt.chequeDetails?.personName && (
                    <div>
                      اسم الشخص:{" "}
                      <strong>{receipt.chequeDetails.personName}</strong>
                    </div>
                  )}
                  <div>
                    رقم الشيك:{" "}
                    <strong className="font-mono">
                      {receipt.chequeDetails?.chequeNumber || "-"}
                    </strong>
                  </div>
                  <div>
                    اسم البنك:{" "}
                    <strong>{receipt.chequeDetails?.bankName || "-"}</strong>
                  </div>
                  {receipt.chequeDetails?.chequeDate && (
                    <div>
                      تاريخ الشيك:{" "}
                      <strong className="font-mono">
                        {receipt.chequeDetails.chequeDate}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PROMISSORY NOTE (كمبيالة) */}
            {receipt.paymentMethod === "promissory_note" && (
              <div className="space-y-2 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border-2 border-slate-800 flex items-center justify-center bg-slate-900">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">
                    كمبيالة (Lettre de Change)
                  </span>
                </div>
                <div className="pr-7 space-y-1.5 text-xs sm:text-sm text-slate-800">
                  <div>
                    اسم الشخص:{" "}
                    <strong>
                      {receipt.promissoryNoteDetails?.personName || "-"}
                    </strong>
                  </div>
                  <div>
                    رقم الكمبيالة:{" "}
                    <strong className="font-mono">
                      {receipt.promissoryNoteDetails?.noteNumber || "-"}
                    </strong>
                  </div>
                  <div>
                    اسم البنك:{" "}
                    <strong>
                      {receipt.promissoryNoteDetails?.bankName || "-"}
                    </strong>
                  </div>
                  <div>
                    تاريخ الاستحقاق:{" "}
                    <strong className="font-mono">
                      {receipt.promissoryNoteDetails?.dueDate || "-"}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* BANK TRANSFER (تحويل بنكي) */}
            {receipt.paymentMethod === "bank_transfer" && (
              <div className="space-y-2 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border-2 border-slate-800 flex items-center justify-center bg-slate-900">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">
                    تحويل بنكي (Bank Transfer)
                  </span>
                </div>
                <div className="pr-7 space-y-1.5 text-xs sm:text-sm text-slate-800">
                  <div>
                    اسم الشخص:{" "}
                    <strong>
                      {receipt.bankTransferDetails?.personName || "-"}
                    </strong>
                  </div>
                  <div>
                    اسم البنك:{" "}
                    <strong>
                      {receipt.bankTransferDetails?.bankName || "-"}
                    </strong>
                  </div>
                  <div>
                    تاريخ التحويل:{" "}
                    <strong className="font-mono">
                      {receipt.bankTransferDetails?.transferDate || "-"}
                    </strong>
                  </div>
                  {receipt.bankTransferDetails?.transactionNumber && (
                    <div>
                      رقم العملية:{" "}
                      <strong className="font-mono">
                        {receipt.bankTransferDetails.transactionNumber}
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CASH DEPOSIT (الإيداع النقدي) */}
            {receipt.paymentMethod === "cash_deposit" && (
              <div className="space-y-2 py-1">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border-2 border-slate-800 flex items-center justify-center bg-slate-900">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                  <span className="text-base font-bold text-slate-900">
                    إيداع نقدي (Cash Deposit)
                  </span>
                </div>
                <div className="pr-7 space-y-1.5 text-xs sm:text-sm text-slate-800">
                  <div>
                    اسم الشخص:{" "}
                    <strong>
                      {receipt.cashDepositDetails?.personName || "-"}
                    </strong>
                  </div>
                  <div>
                    رقم الإيداع:{" "}
                    <strong className="font-mono">
                      {receipt.cashDepositDetails?.depositNumber || "-"}
                    </strong>
                  </div>
                  <div>
                    تاريخ الإيداع:{" "}
                    <strong className="font-mono">
                      {receipt.cashDepositDetails?.depositDate || "-"}
                    </strong>
                  </div>
                  {receipt.cashDepositDetails?.bankName && (
                    <div>
                      اسم البنك:{" "}
                      <strong>{receipt.cashDepositDetails.bankName}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Left Column (Second in RTL): الحساب المالي (md:col-span-7) - Larger Box */}
        <div className="relative border-2 border-slate-800 rounded-2xl p-5 sm:p-6 bg-white md:col-span-7 flex flex-col justify-between">
          {/* Border Title Badge */}
          <div className="absolute -top-3.5 right-6 px-3 bg-white font-bold text-slate-900 text-base sm:text-lg tracking-wide">
            الحساب المالي
          </div>

          <div className="space-y-3 pt-2">
            {/* If total contract value was provided, show full contract breakdown */}
            {receipt.totalAmount && receipt.totalAmount > 0 ? (
              <>
                {/* 1. إجمالي العقد / المطلوب */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-slate-800">
                  <span className="font-bold text-sm sm:text-base">
                    إجمالي العقد / المطلوب:
                  </span>
                  <span
                    className="font-mono font-bold text-base sm:text-lg"
                    dir="ltr"
                  >
                    {formatCurrency(
                      receipt.totalAmount,
                      company.currencySymbol,
                    )}
                  </span>
                </div>

                {/* 2. المبلغ المتبقي في الدفعة الأخيرة (اختياري في السند الجديد، وإلزامي في سند القسط) */}
                {receipt.previousRemainingAmount !== undefined &&
                  receipt.previousRemainingAmount !== null && (
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-slate-800">
                      <span className="font-bold text-sm sm:text-base">
                        المبلغ المتبقي في الدفعة الأخيرة:
                      </span>
                      <span
                        className="font-mono font-bold text-base sm:text-lg text-amber-800"
                        dir="ltr"
                      >
                        {formatCurrency(
                          receipt.previousRemainingAmount,
                          company.currencySymbol,
                        )}
                      </span>
                    </div>
                  )}

                {/* 3. المبلغ الحالي */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 pt-0.5">
                  <span className="font-bold text-slate-900 text-base sm:text-lg">
                    المبلغ الحالي:
                  </span>
                  <div
                    className="text-xl sm:text-2xl font-extrabold text-blue-700 font-mono tracking-tight flex items-baseline gap-1.5"
                    dir="ltr"
                  >
                    <span>
                      {receipt.paidAmount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-lg font-bold text-blue-900">
                      {company.currencySymbol || "dh"}
                    </span>
                  </div>
                </div>

                {/* 4. المبلغ المتبقي */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-bold text-sm sm:text-base text-slate-900">
                    المبلغ المتبقي:
                  </span>
                  <div
                    className={`font-mono font-bold text-base sm:text-lg ${
                      (receipt.remainingAmount || 0) > 0
                        ? "text-amber-700"
                        : "text-emerald-700"
                    }`}
                    dir="ltr"
                  >
                    {formatCurrency(
                      receipt.remainingAmount || 0,
                      company.currencySymbol,
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* If NO total contract was entered: Show ONLY المبلغ الحالي (No total, No remaining balance!) */
              <div className="my-auto py-4 text-center space-y-2">
                <span className="font-bold text-slate-800 text-base sm:text-lg block">
                  المبلغ الحالي المقبوض:
                </span>
                <div
                  className="text-3xl sm:text-4xl font-extrabold text-blue-700 font-mono tracking-tight flex items-baseline justify-center gap-2"
                  dir="ltr"
                >
                  <span>
                    {receipt.paidAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-2xl font-bold text-blue-900">
                    {company.currencySymbol || "dh"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  سند قبض مالي بمبلغ مقبوض مباشر
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= SECTION 3: PURPOSE (وذلك مقابل) ================= */}
      <div className="relative border-2 border-slate-800 rounded-2xl p-6 mb-12 bg-white">
        {/* Border Title Badge */}
        <div className="absolute -top-3.5 right-6 px-3 bg-white font-bold text-slate-900 text-base sm:text-lg tracking-wide">
          وذلك مقابل
        </div>

        {/* Lined paper lines with purpose text */}
        <div className="pt-2 relative min-h-[110px] flex flex-col justify-between">
          <div className="relative z-10 text-base sm:text-lg font-medium text-slate-900 leading-9 font-tajawal px-1">
            {receipt.purpose ||
              "................................................................................................................................................................"}
          </div>

          {/* 4 horizontal notebook ruled lines in the background */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pt-7 pb-2">
            <div className="border-b border-slate-300 w-full" />
            <div className="border-b border-slate-300 w-full" />
            <div className="border-b border-slate-300 w-full" />
            <div className="border-b border-slate-300 w-full" />
          </div>
        </div>
      </div>

      {/* ================= FOOTER: SIGNATURES & STAMP ================= */}
      <div className="grid grid-cols-2 gap-8 items-end pt-4 pb-2">
        {/* Left Column: الختم الرسمي */}
        <div className="text-center flex flex-col items-center">
          <div className="h-28 flex items-center justify-center relative w-full mb-1">
            {receipt.stampImage || company.stampUrl ? (
              <img
                src={receipt.stampImage || company.stampUrl}
                alt="الختم الرسمي"
                className="max-h-24 max-w-full object-contain filter drop-shadow opacity-95 transform -rotate-3"
              />
            ) : (
              // <div className="w-20 h-20 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-300 text-xs">
              //   {/* موضع الختم */}
              // </div>
              <div>{/* موضع الختم */}</div>
            )}
          </div>
          <div className="w-48 sm:w-60 border-b-2 border-slate-800 mb-2" />
          <h3 className="text-lg sm:text-xl font-bold font-amiri text-slate-900">
            الختم الرسمي
          </h3>
        </div>

        {/* Right Column: المحاسب / المستلم */}
        <div className="text-center flex flex-col items-center">
          <div className="h-28 flex items-center justify-center relative w-full mb-1">
            {receipt.signatureImage ? (
              <img
                src={receipt.signatureImage}
                alt="توقيع المستلم"
                className="max-h-24 max-w-full object-contain filter drop-shadow"
              />
            ) : (
              // <div className="w-32 h-16 border border-dashed border-slate-200 rounded flex items-center justify-center text-slate-300 text-xs">
              //   موضع التوقيع
              // </div>
              <div>{/* موضع التوقيع */}</div>
            )}
          </div>
          <div className="w-48 sm:w-60 border-b-2 border-slate-800 mb-2" />
          <h3 className="text-lg sm:text-xl font-bold font-amiri text-slate-900">
            المحاسب / المستلم
          </h3>
        </div>
      </div>

      {/* Optional Installment Chain Table (Shown if there are previous installments and enabled) */}
      {showInstallmentHistory &&
        receipt.installments &&
        receipt.installments.length > 0 && (
          <div className="mt-8 pt-4 border-t-2 border-slate-200 text-xs">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-800 text-sm">
                سجل الدفعات والأقساط السابقة المرتبطة:
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">
                (إجمالي {receipt.installments.length} دفعات)
              </span>
            </div>
            <table className="w-full border-collapse border border-slate-200 text-right">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-2 border border-slate-200">التاريخ</th>
                  <th className="p-2 border border-slate-200">المبلغ المسدد</th>
                  <th className="p-2 border border-slate-200">طريقة الدفع</th>
                  <th className="p-2 border border-slate-200">ملاحظات</th>
                  {onDeleteInstallment && (
                    <th className="p-2 border border-slate-200 text-center no-print w-20">
                      إجراء
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {receipt.installments.map((inst, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-200 hover:bg-slate-50"
                  >
                    <td className="p-2 border border-slate-200 font-mono">
                      {inst.date}
                    </td>
                    <td className="p-2 border border-slate-200 font-bold font-mono text-emerald-700">
                      {formatCurrency(inst.amount, company.currencySymbol)}
                    </td>
                    <td className="p-2 border border-slate-200">
                      {inst.paymentMethod === "cash"
                        ? "نقداً"
                        : inst.paymentMethod === "cheque"
                          ? "شيك"
                          : "تحويل بنكي"}
                    </td>
                    <td className="p-2 border border-slate-200 text-slate-600">
                      {inst.notes || "-"}
                    </td>
                    {onDeleteInstallment && (
                      <td className="p-2 border border-slate-200 text-center no-print">
                        <button
                          type="button"
                          onClick={() => onDeleteInstallment(inst.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold transition-colors"
                          title="حذف هذا القسط وخصم مبلغه تلقائياً من هذا السند"
                        >
                          حذف القسط
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
};
