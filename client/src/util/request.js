export function getJSON(url) {
  return fetch(url, { method: 'GET' })
    .then(response => response.ok ? response.json() : Promise.reject(response));
}

export function postJSON(url, body) {
  return fetch(url, {
    method : 'POST',
    body   : JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' }
  })
    .then(response => response.ok ? response.json() : Promise.reject(response));
}
