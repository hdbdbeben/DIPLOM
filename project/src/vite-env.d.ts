/**
 * @file Расширение типов для Vite-окружения.
 * Декларирует пользовательские переменные окружения, доступные через import.meta.env.
 * Тройной слеш-директива подключает типы Vite client (process.env, import.meta, asset imports).
 */

/// <reference types="vite/client" />

/** Пользовательские переменные окружения, определённые в .env файлах */
interface ImportMetaEnv {
  /** Флаг включения MSW-моков (Mock Service Worker).
   *  Значение 'true' активирует перехват HTTP-запросов в dev-режиме. */
  readonly VITE_USE_MOCKS: string;
}

/**
 * Расширение стандартного интерфейса ImportMeta для поддержки
 * типизированного доступа к import.meta.env с пользовательскими переменными.
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
