import { AppState } from './state.js';

const BASE = '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(method, path, body) {
  const url = BASE + path;
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== undefined) opts.body = JSON.stringify(body);

  let res;
  try {
    res = await fetch(url, opts);
  } catch (e) {
    throw new ApiError('Сетевая ошибка. Проверьте подключение к серверу.', 0, null);
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = (data && data.error) ? data.error : `Ошибка сервера (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }

  return data;
}

export const api = {
  get(path)    { return request('GET', path); },
  post(path, b) { return request('POST', path, b); },
  put(path, b)  { return request('PUT', path, b); },
  del(path)     { return request('DELETE', path); }
};

export function withLoading(key, promise) {
  AppState.setLoading(key, true);
  return promise.finally(() => AppState.setLoading(key, false));
}
