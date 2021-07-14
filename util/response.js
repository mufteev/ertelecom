function setResult(res, data) {
  return setResponse(res, data, null, 0);
}

function setError(res, { msg, code }) {
  return setResponse(res, msg, code);
}

function setResponse(res, data, errorMessage, errorCode) {
  return res.json({
    data,
    errorCode,
    errorMessage,
  });
}

module.exports = {
  setResult,
  setError
}
