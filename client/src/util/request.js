async function request(url, option) {
  try {
    const response = await fetch(url, option);
    if (!response.ok) throw response;
    const json = await response.json();

    if (json.errorCode === 0) {
      return json.data;
    } else {
      throw TypeError(json.errorMessage);
    }
  } catch (e) {
    const error = e instanceof Response
      ? `${ e.statusText } [${ e.url }]`
      : e instanceof TypeError ? e.message : e;
    await Promise.reject(error);
  }
}

export const getJsonAsync = async (url) => request(url, { method: 'GET' });
export const postJsonAsync = async (url, body) => request(url, {
  method : 'POST',
  body   : JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' }
});
