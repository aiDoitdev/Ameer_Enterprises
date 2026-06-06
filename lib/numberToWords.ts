const units = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN',
];

const tensWords = [
  '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY',
];

function twoDigits(n: number): string {
  if (n < 20) return units[n];
  const t = tensWords[Math.floor(n / 10)];
  const u = units[n % 10];
  return u ? `${t} ${u}` : t;
}

function threeDigits(n: number): string {
  if (n < 100) return twoDigits(n);
  const h = `${units[Math.floor(n / 100)]} HUNDRED`;
  const remainder = n % 100;
  return remainder ? `${h} ${twoDigits(remainder)}` : h;
}

export function numberToWords(n: number): string {
  const amount = Math.round(Math.abs(n));
  if (amount === 0) return 'ZERO';

  const parts: string[] = [];

  if (amount >= 10_000_000) {
    parts.push(`${threeDigits(Math.floor(amount / 10_000_000))} CRORE`);
  }
  if ((amount % 10_000_000) >= 100_000) {
    parts.push(`${threeDigits(Math.floor((amount % 10_000_000) / 100_000))} LAKH`);
  }
  if ((amount % 100_000) >= 1_000) {
    parts.push(`${threeDigits(Math.floor((amount % 100_000) / 1_000))} THOUSAND`);
  }
  if (amount % 1_000 > 0) {
    parts.push(threeDigits(amount % 1_000));
  }

  return parts.join(' ');
}
