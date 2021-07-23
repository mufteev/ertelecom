export function digitValidate(str, min, max) {
  if (!/^-?\d+$/.test(str)) return 'Введите число';
  const digit = parseInt(str);
  if (digit < min) return `Минимальное значение ${ min }`;
  if (digit > max) return `Максимальное значение ${ max }`;
  return null;
}

export function isNullOrWhiteSpace(str) {
  return str === null || /^\s*$/.test(str);
}

export function isFunction(call) {
  return typeof call === 'function';
}

export function tinValidate(value) {
  if (typeof value !== 'string'
    || (value.length !== 10 && value.length !== 12)
    || value.split('').some((symbol) => isNaN(Number(symbol)))) {
    return false;
  }

  // Юрлицо
  if (value.length === 10) {
    const control_sum = value
      .split('')
      .slice(0, -1)
      .reduce((acc, s, i) =>
        [2, 4, 10, 3, 5, 9, 4, 6, 8][i] * Number(s) + acc, 0);
    return Number(value[9]) === (control_sum % 11) % 10;
    // Индивидуальный предприниматель
  } else if (value.length === 12) {
    const control_sum_first = value
      .split('')
      .slice(0, -2)
      .reduce((summ, symbol, index) =>
        [7, 2, 4, 10, 3, 5, 9, 4, 6, 8][index] * Number(symbol) + summ, 0);
    const control_sum_second = value
      .split('')
      .slice(0, -1)
      .reduce((summ, symbol, index) =>
        [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8][index] * Number(symbol) + summ, 0);

    const part_second = (control_sum_second % 11) % 10;
    const part_first = (control_sum_first % 11) % 10;
    return Number(value[10]) === part_first && Number(value[11]) === part_second;
  }
}

