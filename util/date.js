function addDays(date, days) {
  const dateResult = new Date(date);
  dateResult.setDate(date.getDate() + days);
  return dateResult;
}

module.exports = {
  addDays
}
