const ntl_date = new Intl.DateTimeFormat('ru', {
  year  : 'numeric',
  month : 'numeric',
  day   : 'numeric'
});
const ntl_number = new Intl.NumberFormat('ru', {
  style   : 'decimal',
});

function formatNumberAsCurrency(number) {
  return ntl_number.format(number);
}

function formatDate(data) {
  const date = new Date(data);
  return ntl_date.format(date);
}

module.exports = {
  formatDate,
  formatNumberAsCurrency
}
