
/**
 * A utility to convert numbers into Arabic words (Tafqeet).
 * Supports numbers up to 999,999,999.
 */

const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
const tens = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
const hundreds = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];

function processGroup(n: number): string {
  let result = "";
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;

  if (h > 0) {
    result += hundreds[h];
  }

  if (t > 0 || o > 0) {
    if (result !== "") result += " و";
    if (t === 1) {
      result += teens[o];
    } else {
      if (o > 0) {
        result += ones[o];
        if (t > 0) result += " و";
      }
      if (t > 0) {
        result += tens[t];
      }
    }
  }

  return result;
}

export function numberToArabicWords(n: number): string {
  if (n === 0) return "صفر";
  if (n < 0) return "سالب " + numberToArabicWords(Math.abs(n));

  let result = "";
  const millions = Math.floor(n / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const remainder = n % 1000;

  if (millions > 0) {
    if (millions === 1) result += "مليون";
    else if (millions === 2) result += "مليونان";
    else if (millions >= 3 && millions <= 10) result += processGroup(millions) + " ملايين";
    else result += processGroup(millions) + " مليون";
  }

  if (thousands > 0) {
    if (result !== "") result += " و";
    if (thousands === 1) result += "ألف";
    else if (thousands === 2) result += "ألفان";
    else if (thousands >= 3 && thousands <= 10) result += processGroup(thousands) + " آلاف";
    else result += processGroup(thousands) + " ألف";
  }

  if (remainder > 0) {
    if (result !== "") result += " و";
    result += processGroup(remainder);
  }

  return result.trim();
}
