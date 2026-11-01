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

  // Splits purpose text into 3 distinct lines that sit directly on notebook ruled lines
  const formatPurposeLines = (text?: string): string[] => {
    if (!text || !text.trim()) {
      return ["", "", ""];
    }
    const paragraphs = text.split("\n").filter((p) => p.trim().length > 0);
    const lines: string[] = [];
    const maxChars = 75;

    for (const para of paragraphs) {
      if (para.length <= maxChars) {
        lines.push(para);
      } else {
        const words = para.split(" ");
        let current = "";
        for (const word of words) {
          if ((current + " " + word).trim().length <= maxChars) {
            current = (current + " " + word).trim();
          } else {
            if (current) lines.push(current);
            current = word;
          }
        }
        if (current) lines.push(current);
      }
    }

    while (lines.length < 3) {
      lines.push("");
    }
    return lines.slice(0, 3);
  };

  const purposeLines = formatPurposeLines(receipt.purpose);

  return (
    <div
      id="receipt-print-area"
      dir="rtl"
      className="receipt-sheet bg-white text-slate-900 mx-auto w-full max-w-[800px] p-6 sm:p-8 shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-6 font-tajawal select-none flex flex-col justify-between"
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
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center p-2 overflow-hidden shadow-inner">
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
      <div className="w-full border-b-2 border-slate-800 mb-5 mt-2" />

      {/* ================= SECTION 1: RECIPIENT INFO (بيانات المستلم) ================= */}
      <div className="border-2 border-slate-800 rounded-2xl overflow-hidden bg-white mb-4">
        {/* Header Bar */}
        <div className="bg-slate-100 border-b-2 border-slate-800 px-4 pt-[2px] pb-[13px] sm:pt-1 sm:pb-3.5 flex items-center justify-between">
          <span className="font-bold text-slate-900 text-base sm:text-lg font-tajawal">
            بيانات المستلم
          </span>
        </div>

        {/* Box Body */}
        <div className="p-4 sm:p-5 bg-white space-y-4">
          {/* Line 1: وصلنا من السيد / السادة */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 text-base sm:text-lg whitespace-nowrap shrink-0 font-tajawal">
              وصلنا من السيد / السادة :
            </span>
            <div className="flex-1 border-b-2 border-dotted border-slate-400 px-2 pb-0.5 min-h-[30px] flex items-center">
              <span className="text-base sm:text-lg font-bold text-slate-900 font-tajawal">
                {receipt.clientName || ""}
              </span>
            </div>
          </div>

          {/* Line 2: مبلغ وقدره */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 text-base sm:text-lg whitespace-nowrap shrink-0 font-tajawal">
              مبلغ وقدره :
            </span>
            <div className="flex-1 border-b-2 border-dotted border-slate-400 px-2 pb-0.5 min-h-[30px] flex items-center">
              <span className="text-base sm:text-lg font-semibold text-slate-800 font-tajawal">
                {receipt.amountInWords || ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= OPTIONAL SECTION: TRAVELERS INFO (بيانات المسافرين) ================= */}
      {receipt.hasTravelers &&
        receipt.travelers &&
        receipt.travelers.length > 0 && (
          <div className="border-2 border-slate-800 rounded-2xl overflow-hidden bg-white mb-4">
            <div className="bg-slate-100 border-b-2 border-slate-800 px-4 pt-[2px] pb-[13px] sm:pt-1 sm:pb-3.5 flex items-center justify-between">
              <span className="font-bold text-slate-900 text-base sm:text-lg font-tajawal">
                بيانات المسافرين
              </span>
              <span className="text-xs font-tajawal font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-md border border-slate-300 mt-1">
                {receipt.travelers.length}{" "}
                {receipt.travelers.length === 1
                  ? "مسافر"
                  : receipt.travelers.length === 2
                    ? "مسافران"
                    : "مسافرين"}
              </span>
            </div>

            <div className="p-4 bg-white">
              <div className="flex flex-wrap items-center gap-2.5">
                {receipt.travelers.map((traveler, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 pt-1 pb-1.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 text-sm sm:text-base font-bold shadow-xs"
                  >
                    <svg className="w-5 h-5 shrink-0 mt-1" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="11" fill="#1e293b" />
                      <text
                        x="12"
                        y="16.5"
                        fill="white"
                        fontSize="13"
                        fontFamily="sans-serif"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {idx + 1}
                      </text>
                    </svg>
                    <span className="font-tajawal">{traveler}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      {/* ================= SECTION 2: PAYMENT METHOD & FINANCIAL ACCOUNT ================= */}
      {/* Right Column: طريقة الدفع (md:col-span-5) | Left Column: الحساب المالي (md:col-span-7) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
        {/* Right Column (First in RTL): طريقة الدفع (md:col-span-5) - Only selected method shown */}
        <div className="md:col-span-5 border-2 border-slate-800 rounded-2xl overflow-hidden bg-white flex flex-col">
          <div className="bg-slate-100 border-b-2 border-slate-800 px-4 pt-[2px] pb-[13px] sm:pt-1 sm:pb-3.5 font-bold text-slate-900 text-base sm:text-lg font-tajawal">
            طريقة الدفع
          </div>

          <div className="p-4 bg-white flex-1 flex flex-col justify-between">
            <div className="text-sm sm:text-base space-y-2.5">
              {/* CASH (نقداً) */}
              {receipt.paymentMethod === "cash" && (
                <div className="space-y-2 py-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-slate-900 flex items-center justify-center shrink-0 mt-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-slate-900 font-tajawal">
                      نقداً (Cash)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 pr-7 font-tajawal">
                    تم استلام المبلغ نقداً وبعملة الدرهم المغربي
                  </p>
                </div>
              )}

              {/* CREDIT CARD (بطاقة ائتمان) */}
              {receipt.paymentMethod === "credit_card" && (
                <div className="space-y-2 py-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-slate-900 flex items-center justify-center shrink-0 mt-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-slate-900 font-tajawal">
                      بطاقة ائتمان (Credit Card)
                    </span>
                  </div>
                  {receipt.cardDetails?.transactionNumber && (
                    <div className="pr-7 text-xs text-slate-700 font-tajawal">
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
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-slate-900 flex items-center justify-center shrink-0 mt-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-slate-900 font-tajawal">
                      بطاقة الخصم المباشر (Debit Card)
                    </span>
                  </div>
                  {receipt.cardDetails?.transactionNumber && (
                    <div className="pr-7 text-xs text-slate-700 font-tajawal">
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
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-slate-900 flex items-center justify-center shrink-0 mt-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-slate-900 font-tajawal">
                      شيك بنكي (Cheque)
                    </span>
                  </div>
                  <div className="pr-7 space-y-1.5 text-xs sm:text-sm text-slate-800 font-tajawal">
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
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-slate-900 flex items-center justify-center shrink-0 mt-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-slate-900 font-tajawal">
                      كمبيالة (Lettre de Change)
                    </span>
                  </div>
                  <div className="pr-7 space-y-1.5 text-xs sm:text-sm text-slate-800 font-tajawal">
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
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-slate-900 flex items-center justify-center shrink-0 mt-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-slate-900 font-tajawal">
                      تحويل بنكي (Bank Transfer)
                    </span>
                  </div>
                  <div className="pr-7 space-y-1.5 text-xs sm:text-sm text-slate-800 font-tajawal">
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
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-slate-900 flex items-center justify-center shrink-0 mt-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-base sm:text-lg font-bold text-slate-900 font-tajawal">
                      إيداع نقدي (Cash Deposit)
                    </span>
                  </div>
                  <div className="pr-7 space-y-1.5 text-xs sm:text-sm text-slate-800 font-tajawal">
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
        </div>

        {/* Left Column (Second in RTL): الحساب المالي (md:col-span-7) */}
        <div className="md:col-span-7 border-2 border-slate-800 rounded-2xl overflow-hidden bg-white flex flex-col">
          <div className="bg-slate-100 border-b-2 border-slate-800 px-4 pt-[2px] pb-[13px] sm:pt-1 sm:pb-3.5 font-bold text-slate-900 text-base sm:text-lg font-tajawal">
            الحساب المالي
          </div>

          <div className="p-4 sm:p-5 bg-white flex-1 flex flex-col justify-between">
            <div className="space-y-2.5">
              {/* If total contract value was provided, show full contract breakdown */}
              {receipt.totalAmount && receipt.totalAmount > 0 ? (
                <>
                  {/* 1. إجمالي العقد / المطلوب */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-slate-800">
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
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 text-slate-800">
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
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 pt-0.5">
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
                  <div className="flex items-center justify-between pt-0.5">
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
                <div className="my-auto py-3 text-center space-y-1.5">
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
      </div>

      {/* ================= SECTION 3: PURPOSE (وذلك مقابل) ================= */}
      <div className="border-2 border-slate-800 rounded-2xl overflow-hidden bg-white mb-5">
        <div className="bg-slate-100 border-b-2 border-slate-800 px-4 pt-[2px] pb-[13px] sm:pt-1 sm:pb-3.5 font-bold text-slate-900 text-base sm:text-lg font-tajawal">
          وذلك مقابل
        </div>

        <div className="p-4 sm:p-5 bg-white space-y-2.5">
          {purposeLines.map((lineText, idx) => (
            <div
              key={idx}
              className="border-b border-slate-300 min-h-[34px] pb-1.5 px-1 flex items-end"
            >
              <span className="text-base sm:text-lg font-medium text-slate-900 font-tajawal leading-normal">
                {lineText}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ================= FOOTER: SIGNATURES & STAMP ================= */}
      <div className="grid grid-cols-2 gap-8 items-end pt-2 pb-1 mt-auto">
        {/* Left Column: الختم الرسمي */}
        <div className="text-center flex flex-col items-center">
          <div className="h-20 sm:h-22 flex items-center justify-center relative w-full mb-1">
            {receipt.stampImage || company.stampUrl ? (
              <img
                src={receipt.stampImage || company.stampUrl}
                alt="الختم الرسمي"
                className="max-h-20 max-w-full object-contain filter drop-shadow opacity-95 transform -rotate-3"
              />
            ) : (
              <div>{/* موضع الختم */}</div>
            )}
          </div>
          <div className="w-48 sm:w-56 border-b-2 border-slate-800 mb-1.5" />
          <h3 className="text-base sm:text-lg font-bold font-amiri text-slate-900">
            الختم الرسمي
          </h3>
        </div>

        {/* Right Column: المحاسب / المستلم */}
        <div className="text-center flex flex-col items-center">
          <div className="h-20 sm:h-22 flex items-center justify-center relative w-full mb-1">
            {receipt.signatureImage ? (
              <img
                src={receipt.signatureImage}
                alt="توقيع المستلم"
                className="max-h-20 max-w-full object-contain filter drop-shadow"
              />
            ) : (
              <div>{/* موضع التوقيع */}</div>
            )}
          </div>
          <div className="w-48 sm:w-56 border-b-2 border-slate-800 mb-1.5" />
          <h3 className="text-base sm:text-lg font-bold font-amiri text-slate-900">
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
