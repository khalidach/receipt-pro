import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

declare global {
  interface Window {
    electronAPI?: {
      isElectron: boolean;
      print: () => Promise<boolean>;
      printToPDF?: (filename?: string) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
      savePDFBuffer?: (base64Data: string, filename?: string) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
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
 * Exports the receipt element as a crisp, high-resolution A4 PDF with exact RTL shaping and balanced margins
 * Runs identically in both Browser and Electron
 */
export async function exportReceiptToPDF(
  elementId: string = 'receipt-print-area',
  filename: string = 'سند_قبض.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  // 1. Ensure all custom fonts (Amiri, Tajawal, Cairo) are fully loaded
  if (document.fonts) {
    await document.fonts.ready;
  }

  // 2. Capture canvas with 3x scale for ultra crisp text and Arabic glyphs
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 794,
    onclone: (clonedDoc) => {
      const clonedEl = clonedDoc.getElementById(elementId);
      if (clonedEl) {
        // Enforce exact A4 proportions (794px x 1123px at 96 DPI)
        clonedEl.style.width = '794px';
        clonedEl.style.minWidth = '794px';
        clonedEl.style.maxWidth = '794px';
        clonedEl.style.minHeight = '1120px';
        clonedEl.style.boxShadow = 'none';
        clonedEl.style.border = 'none';
        clonedEl.style.borderRadius = '0';
        clonedEl.style.direction = 'rtl';
        clonedEl.style.letterSpacing = '0px';
        clonedEl.style.fontFeatureSettings = '"liga" 1, "calt" 1';

        // Ensure zero letter-spacing on all Arabic text inside the clone to prevent disconnected letters
        const allDescendants = clonedEl.querySelectorAll('*');
        allDescendants.forEach((node) => {
          const htmlNode = node as HTMLElement;
          if (htmlNode.style) {
            if (
              !htmlNode.classList.contains('font-mono') &&
              !htmlNode.classList.contains('font-serif')
            ) {
              htmlNode.style.letterSpacing = '0px';
            }
          }
        });
      }
    },
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const canvasRatio = canvas.width / canvas.height;

  // If the document is unusually tall (e.g. multiple installments history shown), fit by height
  if (canvasRatio < 0.62) {
    const printHeight = 297;
    const printWidth = printHeight * canvasRatio;
    const xOffset = (210 - printWidth) / 2;
    pdf.addImage(imgData, 'JPEG', xOffset, 0, printWidth, printHeight, undefined, 'FAST');
  } else {
    // Standard A4 sheet: full bleed onto 210x297mm
    // The receipt container's internal padding (p-6/p-8) provides the natural 8-10mm margin from the paper edges
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  }

  // 3. Save PDF
  if (window.electronAPI?.savePDFBuffer) {
    // Native Electron Save Dialog with exact high-res PDF data
    const dataUri = pdf.output('datauristring');
    const res = await window.electronAPI.savePDFBuffer(dataUri, filename);
    if (!res.success && !res.canceled) {
      throw new Error(res.error || 'Failed to save PDF');
    }
  } else {
    // Standard Browser Download
    pdf.save(filename);
  }
}
