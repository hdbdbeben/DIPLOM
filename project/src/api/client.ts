/**
 * @file Модуль HTTP-клиента для взаимодействия с REST API сервера.
 * Предоставляет базовый класс ошибок ApiError, внутреннюю функцию request
 * и объект api с методами GET, POST, PUT, DELETE.
 */

/** Базовый путь API, проксируется через Vite на бэкенд */
const BASE = '/api';

/**
 * Кастомный класс ошибки, выбрасываемый при неудачных HTTP-запросах.
 * Содержит HTTP-статус и тело ответа для отладки.
 */
export class ApiError extends Error {
  /** HTTP-код ответа (0 — сетевая ошибка) */
  status: number;
  /** Тело ответа сервера (объект JSON или строка) */
  data: unknown;

  /**
   * @param message Текст ошибки для отображения пользователю
   * @param status HTTP-статус ответа
   * @param data Распарсенное тело ответа
   */
  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * Внутренняя функция выполнения HTTP-запроса.
 *
 * @param method HTTP-метод (GET, POST, PUT, DELETE)
 * @param path Путь относительно BASE (например, '/login')
 * @param body Тело запроса (сериализуется в JSON, если передано)
 * @returns Распарсенное тело ответа, приведённое к типу T
 * @throws {ApiError} При сетевой ошибке или HTTP-статусе не из 2xx
 */
async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const url = BASE + path;
  const opts: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  // Добавляем тело запроса, только если оно передано (POST/PUT)
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(url, opts);
  } catch {
    // Сетевая ошибка (DNS, соединение, таймаут) — оборачиваем в ApiError со статусом 0
    throw new ApiError('Сетевая ошибка. Проверьте подключение к серверу.', 0, null);
  }

  // Определяем тип контента для выбора способа парсинга
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  // Если JSON — парсим как JSON, иначе читаем как текст
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    // Извлекаем сообщение ошибки из тела ответа или формируем стандартное
    const msg = data?.error ? data.error : `Ошибка сервера (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }

  return data as T;
}

/**
 * Объект с методами для выполнения HTTP-запросов к API.
 * Каждый метод соответствует HTTP-глаголу и возвращает Promise с типизированным ответом.
 */
export const api = {
  /** GET-запрос без тела */
  get<T>(path: string): Promise<T> {
    return request<T>('GET', path);
  },
  /** POST-запрос с опциональным телом */
  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('POST', path, body);
  },
  /** PUT-запрос с опциональным телом */
  put<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('PUT', path, body);
  },
  /** DELETE-запрос без тела */
  del<T>(path: string): Promise<T> {
    return request<T>('DELETE', path);
  },
  /** GET-запрос, возвращающий Blob (для скачивания файлов) */
  async getBlob(path: string): Promise<void> {
    const url = BASE + path;
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(text || `Ошибка сервера (${res.status})`, res.status, text);
    }
    const blob = await res.blob();
    const disposition = res.headers.get('content-disposition');
    const match = disposition?.match(/filename="?([^";\n]+)"?/);
    const filename = match?.[1] || 'export.txt';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  },
  /** POST-запрос, возвращающий Blob (для скачивания файлов) */
  async postBlob(path: string, body?: unknown, fallbackFilename?: string): Promise<void> {
    const url = BASE + path;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(text || `Ошибка сервера (${res.status})`, res.status, text);
    }
    const blob = await res.blob();
    const disposition = res.headers.get('content-disposition');
    const match = disposition?.match(/filename="?([^";\n]+)"?/);
    const filename = match?.[1] || fallbackFilename || 'export.txt';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  },
};
