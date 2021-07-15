function availableParam(obj, ...params) {
  return obj && params && params.length !== 0 && params.every((p) => p in obj);
}

function isNullOrWhiteSpace(str) {
  return str === null || /^\s*$/.test(str);
}

function validTin(tin) {
  if (typeof tin !== 'string'
    || (tin.length !== 10 && tin.length !== 12)
    || tin.split('').some((symbol) => isNaN(Number(symbol)))) {
    return false;
  }

  // Юрлицо
  if (tin.length === 10) {
    const control_sum = tin
      .split('')
      .slice(0, -1)
      .reduce((acc, s, i) =>
        [2, 4, 10, 3, 5, 9, 4, 6, 8][i] * Number(s) + acc, 0);
    return Number(tin[9]) === (control_sum % 11) % 10 ;
    // Индивидуальный предприниматель
  } else if (tin.length === 12) {
    const control_sum_first = tin
      .split('')
      .slice(0, -2)
      .reduce((summ, symbol, index) =>
        [7, 2, 4, 10, 3, 5, 9, 4, 6, 8][index] * Number(symbol) + summ, 0);
    const control_sum_second = tin
      .split('')
      .slice(0, -1)
      .reduce((summ, symbol, index) =>
        [3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8][index] * Number(symbol) + summ, 0);

    const part_second = (control_sum_second % 11) % 10;
    const part_first = (control_sum_first % 11) % 10;
    return Number(tin[10]) === part_first && Number(tin[11]) === part_second;
  }
}

module.exports = {
  availableParam,
  isNullOrWhiteSpace,
  validTin
}
