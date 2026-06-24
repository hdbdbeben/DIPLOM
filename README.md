# АСБО — Автоматизированная система банковских операций

Веб-приложение для ООО «Социальные услуги»: загрузка банковских выписок, автоматическая классификация платежей, справочники контрагентов, отчёт ДДС, журнал ошибок.

## Стек

| Слой | Технологии |
|---|---|
| Фронтенд | React 18, TypeScript, Vite 6, React Router, CSS custom properties |
| Бэкенд | Express 4, TypeScript, better-sqlite3 |
| Моки | MSW 2 (Service Worker в браузере) |
| БД | SQLite (`project/asbo.db`) |

## Быстрый старт

```bash
cd project
npm install          # зависимости фронтенда
cd server
npm install          # зависимости бэкенда
cd ..
```

### Dev-режим (два терминала)

```bash
# Терминал 1 — бэкенд
cd project/server
npm run dev          # tsx watch → http://localhost:3000

# Терминал 2 — фронтенд
cd project
npm run dev          # Vite HMR → http://localhost:5173
                     # API-запросы проксируются на :3000
```

### Режим с моками (без бэкенда)

```bash
cd project
# Отредактировать .env: VITE_USE_MOCKS=true
npm run dev          # MSW перехватывает все API-запросы
```

### Production

```bash
cd project
npm run build        # сборка в dist/
cd server
npm start            # Express отдаёт dist/ + API
```

## Демо-доступ

| Роль | Логин | Пароль |
|---|---|---|
| Администратор | `admin` | `admin` |
| Бухгалтер | `buh` | `buh123` |
| Руководитель | `dir` | `dir123` |

## Структура проекта

```
project/
├── src/                 # React-фронтенд (TypeScript)
│   ├── api/             #   HTTP-клиент и эндпоинты
│   ├── mocks/           #   MSW-обработчики и данные
│   ├── contexts/        #   Auth + UI контексты
│   ├── components/      #   UI-компоненты + Layout
│   ├── pages/           #   Страницы (8 разделов)
│   └── lib/             #   Утилиты и парсер выписок
├── server/
│   └── src/             # Express-бэкенд (TypeScript)
│       ├── repositories/ #  Слой доступа к БД (13 репозиториев)
│       ├── routes/       #  API-роуты (13 модулей)
│       ├── utils/        #  Парсинг выписок
│       └── db.ts         #  SQLite: схема, seed, CRUD
├── index.html           # Точка входа Vite
├── vite.config.ts       # Конфиг Vite + прокси
└── package.json         # Зависимости фронтенда
```
