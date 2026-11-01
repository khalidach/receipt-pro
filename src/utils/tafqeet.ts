/**
 * Moroccan Dirham Tafqeet Utility (تحويل الأرقام إلى كلمات عربية بالدرهم المغربي)
 * Accurately converts numeric amounts into formal Arabic words formatted for Moroccan Dirhams.
 */

const ONES: string[] = [
  '',
  'واحد',
  'اثنان',
  'ثلاثة',
  'أربعة',
  'خمسة',
  'ستة',
  'سبعة',
  'ثمانية',
  'تسعة',
];

const ONES_FEMININE: string[] = [
  '',
  'واحدة',
  'اثنتان',
  'ثلاث',
  'أربع',
  'خمس',
  'ست',
  'سبع',
  'ثمان',
  'تسع',
];

const TEENS: string[] = [
  'عشرة',
  'أحد عشر',
  'اثنا عشر',
  'ثلاثة عشر',
  'أربعة عشر',
  'خمسة عشر',
  'ستة عشر',
  'سبعة عشر',
  'ثمانية عشر',
  'تسعة عشر',
];

const TENS: string[] = [
  '',
  'عشرة',
  'عشرون',
  'ثلاثون',
  'أربعون',
  'خمسون',
  'ستون',
  'سبعون',
  'ثمانون',
  'تسعون',
];

const HUNDREDS: string[] = [
  '',
  'مائة',
  'مائتان',
  'ثلاثمائة',
  'أربعمائة',
  'خمسمائة',
  'ستمائة',
  'سبعمائة',
  'ثمانمائة',
  'تسعمائة',
];

/**
 * Converts a 3-digit number (0-999) into Arabic words
 */
function convertThreeDigits(num: number, isFeminine: boolean = false): string {
  if (num === 0) return '';

  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;
  const parts: string[] = [];

  if (hundreds > 0) {
    parts.push(HUNDREDS[hundreds]);
  }

  if (remainder > 0) {
    if (remainder < 10) {
      const unitWord = isFeminine ? ONES_FEMININE[remainder] : ONES[remainder];
      parts.push(unitWord);
    } else if (remainder >= 10 && remainder < 20) {
      parts.push(TEENS[remainder - 10]);
    } else {
      const units = remainder % 10;
      const tens = Math.floor(remainder / 10);
      if (units > 0) {
        const unitWord = isFeminine ? ONES_FEMININE[units] : ONES[units];
        parts.push(`${unitWord} و${TENS[tens]}`);
      } else {
        parts.push(TENS[tens]);
      }
    }
  }

  return parts.join(' و');
}

/**
 * Formats a major integer amount into Arabic words with thousands, millions, billions
 */
function integerToWords(num: number): string {
  if (num === 0) return 'صفر';

  const billions = Math.floor(num / 1_000_000_000);
  const millions = Math.floor((num % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((num % 1_000_000) / 1_000);
  const remainder = num % 1000;

  const parts: string[] = [];

  // Billions (مليار)
  if (billions > 0) {
    if (billions === 1) {
      parts.push('مليار');
    } else if (billions === 2) {
      parts.push('ملياران');
    } else if (billions >= 3 && billions <= 10) {
      parts.push(`${convertThreeDigits(billions)} مليارات`);
    } else {
      parts.push(`${convertThreeDigits(billions)} مليار`);
    }
  }

  // Millions (مليون)
  if (millions > 0) {
    if (millions === 1) {
      parts.push('مليون');
    } else if (millions === 2) {
      parts.push('مليونان');
    } else if (millions >= 3 && millions <= 10) {
      parts.push(`${convertThreeDigits(millions)} ملايين`);
    } else {
      parts.push(`${convertThreeDigits(millions)} مليون`);
    }
  }

  // Thousands (ألف)
  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('ألف');
    } else if (thousands === 2) {
      parts.push('ألفان');
    } else if (thousands >= 3 && thousands <= 10) {
      parts.push(`${convertThreeDigits(thousands)} آلاف`);
    } else {
      parts.push(`${convertThreeDigits(thousands)} ألف`);
    }
  }

  // Remainder (0-999)
  if (remainder > 0) {
    parts.push(convertThreeDigits(remainder));
  }

  return parts.join(' و');
}

/**
 * Returns the proper Moroccan Dirham currency phrase based on the numeric value
 */
function getDirhamUnit(amount: number): string {
  const lastTwo = amount % 100;
  if (amount === 1) return 'درهم مغربي واحد';
  if (amount === 2) return 'درهمان مغربيان';
  if (amount >= 3 && amount <= 10) return 'دراهم مغربية';
  if (lastTwo >= 11 && lastTwo <= 99) return 'درهماً مغربياً';
  return 'درهم مغربي';
}

/**
 * Returns the proper Centime unit phrase
 */
function getCentimeUnit(cents: number): string {
  if (cents === 1) return 'سنتيم واحد';
  if (cents === 2) return 'سنتيمان';
  if (cents >= 3 && cents <= 10) return 'سنتيمات';
  return 'سنتيماً';
}

/**
 * Main Tafqeet Function
 * @param amount Number e.g. 5000 or 712860 or 1500.50
 * @param options Additional customization
 * @returns Fully formatted Arabic text e.g. "خمسة آلاف درهم مغربي فقط لا غير"
 */
export function tafqeetDirham(
  amount: number | string,
  options: { addPrefix?: boolean; addSuffix?: boolean } = { addPrefix: false, addSuffix: true }
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount) || numericAmount < 0) {
    return '';
  }

  if (numericAmount === 0) {
    return 'صفر درهم مغربي فقط لا غير';
  }

  const integerPart = Math.floor(numericAmount);
  const decimalPart = Math.round((numericAmount - integerPart) * 100);

  let result = '';

  if (integerPart > 0) {
    const words = integerToWords(integerPart);
    if (integerPart === 1) {
      result = 'درهم مغربي واحد';
    } else if (integerPart === 2) {
      result = 'درهمان مغربيان';
    } else if (integerPart >= 3 && integerPart <= 10) {
      result = `${words} ${getDirhamUnit(integerPart)}`;
    } else {
      result = `${words} ${getDirhamUnit(integerPart)}`;
    }
  }

  if (decimalPart > 0) {
    const centWords = convertThreeDigits(decimalPart);
    const centUnit = getCentimeUnit(decimalPart);
    const centPhrase = decimalPart === 1 ? 'سنتيم واحد' : decimalPart === 2 ? 'سنتيمان' : `${centWords} ${centUnit}`;
    
    if (integerPart > 0) {
      result += ` و${centPhrase}`;
    } else {
      result = centPhrase;
    }
  }

  if (options.addPrefix) {
    result = `فقط ${result}`;
  }

  if (options.addSuffix ?? true) {
    result = `${result} فقط لا غير`;
  }

  return result.trim();
}

/**
 * Formats a number with thousands commas and Moroccan Dirham symbol
 * e.g. 712860 -> "712,860.00 dh"
 */
export function formatCurrency(amount: number, symbol: string = 'dh'): string {
  if (isNaN(amount)) return `0.00 ${symbol}`;
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${symbol}`;
}
