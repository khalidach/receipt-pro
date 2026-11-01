import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      print: () => Promise<boolean>;
      printToPDF: (filename?: string) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
    };
  }
}

/**
 * Triggers standard browser / Electron window print dialog
 */
export async function printReceipt(): Promise<void> {
  if (window.electronAPI?.isElectron) {
    await window.electronAPI.print();
  } else {
    window.print();
  }
}

/**
 * Exports the receipt element as a crisp, high-resolution A4 PDF
 */
export async function exportReceiptToPDF(
  elementId: string = 'receipt-print-area',
  filename: string = 'سند_قبض.pdf'
): Promise<void> {
  // If running in Electron, leverage native Chromium printToPDF for 100% crisp vector PDF!
  if (window.electronAPI?.isElectron) {
    const res = await window.electronAPI.printToPDF(filename);
    if (!res.success && !res.canceled) {
      throw new Error(res.error || 'Failed to export PDF');
    }
    return;
  }

  // Browser Fallback: High-resolution canvas to PDF
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // Create canvas with 2.5x scale for crisp font rendering
  const canvas = await html2canvas(element, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Calculate scaled dimensions to fit neatly on page
  const ratio = canvasWidth / canvasHeight;
  let printWidth = pdfWidth - 10; // 5mm margin on each side
  let printHeight = printWidth / ratio;

  if (printHeight > pdfHeight - 10) {
    printHeight = pdfHeight - 10;
    printWidth = printHeight * ratio;
  }

  const xOffset = (pdfWidth - printWidth) / 2;
  const yOffset = 5;

  pdf.addImage(imgData, 'JPEG', xOffset, yOffset, printWidth, printHeight, undefined, 'FAST');
  pdf.save(filename);
}

