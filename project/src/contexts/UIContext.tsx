/**
 * @file Контекст пользовательского интерфейса (тосты и модальные окна).
 * Использует паттерн «глобального состояния вне React» (external store)
 * для возможности вызова showToast/showModal из любого места без хуков.
 * React-компоненты синхронизируются через подписку на события.
 *
 * Архитектура:
 * - uiState — мутабельный объект состояния вне дерева React
 * - uiListeners — массив callback-функций для оповещения React о изменениях
 * - emit() — уведомляет всех подписчиков о мутации состояния
 * - subscribe() — регистрирует React-компонент для получения обновлений
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

/** Структура одного тост-уведомления */
interface Toast {
  /** Уникальный идентификатор для удаления по таймауту */
  id: number;
  /** Текст сообщения */
  message: string;
  /** Тип тоста: info, success, error, warning */
  type: 'info' | 'success' | 'error' | 'warning';
}

/** Состояние модального окна */
interface ModalState {
  /** Заголовок модального окна */
  title: string;
  /** Контент (JSX-элементы) */
  body: ReactNode;
  /** Нижняя панель с кнопками */
  footer: ReactNode;
  /** Колбэк, вызываемый при закрытии окна */
  onClose?: () => void;
}

/** Тип данных, передаваемых через UI-контекст */
interface UIContextType {
  /** Массив активных тостов */
  toasts: Toast[];
  /** Текущее модальное окно или null */
  modal: ModalState | null;
  /** Показать тост-уведомление */
  showToast: (message: string, type?: Toast['type']) => void;
  /** Показать модальное окно */
  showModal: (title: string, body: ReactNode, footer?: ReactNode, onClose?: () => void) => void;
  /** Скрыть текущее модальное окно */
  hideModal: () => void;
}

/** Тип функции-слушателя (без аргументов) */
type Listener = () => void;

/**
 * Глобальное состояние UI, мутабельное.
 * React-компоненты получают его копию через подписку.
 * showToast/showModal/hideModal исключены из типа, т.к. они импортируются напрямую.
 */
let uiState: Omit<UIContextType, 'showToast' | 'showModal' | 'hideModal'> = { toasts: [], modal: null };
/** Список подписчиков на изменения состояния */
let uiListeners: Listener[] = [];
/** Счётчик для генерации уникальных ID тостов (инкрементируется монотонно) */
let uid = 1;

/**
 * Уведомляет всех React-подписчиков об изменении глобального состояния.
 * Создаёт новый объект состояния (shallow copy) для корректной работы useSyncExternalStore.
 */
function emit() {
  uiState = { ...uiState };
  uiListeners.forEach((l) => l());
}

/**
 * Подписка React-компонента на изменения глобального UI-состояния.
 * Возвращает функцию отписки, совместимую с useEffect cleanup.
 *
 * @param listener Функция, вызываемая при каждом изменении состояния
 * @returns Функция отписки для очистки в useEffect
 */
function subscribe(listener: Listener): () => void {
  uiListeners.push(listener);
  return () => { uiListeners = uiListeners.filter((l) => l !== listener); };
}

/**
 * Показать тост-уведомление (может вызываться вне React-компонентов).
 * Тосты автоматически удаляются через 4 секунды.
 *
 * @param message Текст уведомления
 * @param type Тип тоста (по умолчанию 'info')
 */
export function showToast(message: string, type: Toast['type'] = 'info') {
  const id = uid++;
  // Добавляем тост в начало массива (новые сверху)
  uiState.toasts = [...uiState.toasts, { id, message, type }];
  emit();
  // Автоудаление тоста через 4 секунды
  setTimeout(() => {
    uiState.toasts = uiState.toasts.filter((t) => t.id !== id);
    emit();
  }, 4000);
}

/**
 * Показать модальное окно (может вызываться вне React-компонентов).
 * Одновременно может быть открыто только одно модальное окно.
 *
 * @param title Заголовок окна
 * @param body Контент окна (JSX)
 * @param footer Нижняя панель с кнопками (опционально)
 * @param onClose Колбэк при закрытии окна (опционально)
 */
export function showModal(title: string, body: ReactNode, footer?: ReactNode, onClose?: () => void) {
  uiState.modal = { title, body, footer: footer ?? null, onClose };
  emit();
}

/**
 * Скрыть текущее модальное окно (может вызываться вне React-компонентов).
 * Вызывает onClose колбэк, если он был передан при открытии.
 */
export function hideModal() {
  // Вызываем колбэк перед очисткой состояния
  uiState.modal?.onClose?.();
  uiState.modal = null;
  emit();
}

/**
 * Показать диалог подтверждения (модальное окно с кнопками Да/Нет).
 * Возвращает Promise, разрешающийся в boolean: true — Да, false — Нет.
 *
 * @param message Текст вопроса для подтверждения
 * @returns Promise<boolean> — результат выбора пользователя
 */
export async function showConfirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    showModal(
      'Подтверждение',
      <div className="alert-message">{message}</div>,
      <>
        <button className="btn btn-primary" onClick={() => { hideModal(); resolve(true); }}>Да</button>
        <button className="btn btn-outline" onClick={() => { hideModal(); resolve(false); }}>Нет</button>
      </>
    );
  });
}

/**
 * Показать уведомление (модальное окно с кнопкой OK).
 * Возвращает Promise, разрешающийся после закрытия окна.
 *
 * @param message Текст уведомления
 * @returns Promise<void>
 */
export async function showAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    showModal(
      'Уведомление',
      <div className="alert-message">{message}</div>,
      <button className="btn btn-primary" onClick={() => { hideModal(); resolve(); }}>OK</button>
    );
  });
}

/** Создание контекста с начальным значением null (проверяется в useUI) */
const UIContext = createContext<UIContextType | null>(null);

/**
 * Хук для доступа к UI-контексту.
 * Должен использоваться внутри UIProvider, иначе выбрасывает ошибку.
 *
 * @returns Объект UIContextType с состоянием тостов и модального окна
 * @throws {Error} Если хук вызван вне UIProvider
 */
export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}

/**
 * Провайдер UI-контекста.
 * Подписывается на изменения глобального состояния и передаёт их
 * в дерево React-компонентов.
 *
 * @param children Дочерние React-элементы
 *
 * Эффекты:
 * - useEffect с пустым массивом зависимостей: подписка на глобальное состояние
 *   при монтировании, отписка при размонтировании
 * - При каждом emit() вызывается setState, вызывая ререндер подписанных компонентов
 */
export function UIProvider({ children }: { children: ReactNode }) {
  // Инициализируем состояние актуальным снимком глобального uiState
  // + добавляем ссылки на функции (они стабильны, не меняются)
  const [state, setState] = useState<UIContextType>(() => ({ ...uiState, showToast, showModal, hideModal }));

  useEffect(() => {
    // Подписываемся на изменения, при каждом emit — обновляем React-состояние
    return subscribe(() => setState({ ...uiState, showToast, showModal, hideModal }));
  }, []);

  return <UIContext.Provider value={state}>{children}</UIContext.Provider>;
}
