const ntl_number = new Intl.NumberFormat('ru', {
  style   : 'currency',
  currency: 'RUB'
});
const ntl_datetime = new Intl.DateTimeFormat('ru', {
  year  : 'numeric',
  month : 'numeric',
  day   : 'numeric',
  hour  : 'numeric',
  minute: 'numeric',
});

export function formatCurrency(number) {
  return ntl_number.format(number);
}

export function formatDateTime(str) {
  const date = new Date(str);
  return ntl_datetime.format(date);
}

export function declensionOfNumbers(number, ...words) {
  number = Number(number);
  if (Number.isNaN(number)) return null;
  const n = number % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return words[2];  // Родительный множ
  if (n1 > 1 && n1 < 5) return words[1];  // Родительный
  if (n1 === 1) return words[0];  // Именительный
  return words[2];
}
