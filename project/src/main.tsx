/**
 * @file Точка входа в приложение.
 * Инициализирует MSW (Mock Service Worker) в dev-режиме при VITE_USE_MOCKS=true,
 * затем монтирует React-дерево в DOM-элемент #root.
 *
 * MSW перехватывает HTTP-запросы на уровне Service Worker и возвращает
 * фиктивные ответы, что позволяет разрабатывать интерфейс без запущенного бэкенда.
 * В production или при VITE_USE_MOCKS=false запросы идут на реальный сервер.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

/**
 * Асинхронная функция инициализации и запуска приложения.
 *
 * Порядок выполнения:
 * 1. Проверка переменной окружения VITE_USE_MOCKS
 * 2. При true — динамический импорт и запуск MSW worker (ленивая загрузка, не бандлится в production)
 * 3. Монтирование React-приложения в #root независимо от режима
 */
async function startApp() {
  // VITE_USE_MOCKS определена в .env файлах и доступна через import.meta.env
  const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

  if (USE_MOCKS) {
    // Динамический импорт: код MSW не включается в бандл при USE_MOCKS=false
    const { worker } = await import('./mocks/browser');
    // Запуск Service Worker с опцией bypass — запросы к реальному серверу пропускаются
    await worker.start({ onUnhandledRequest: 'bypass' });
    console.log('[MSW] Mocking enabled');
  }

  // Монтирование React-дерева: <App/> содержит провайдеры и маршрутизацию
  ReactDOM.createRoot(document.getElementById('root')!).render(
      <App />
  );
}

startApp();
