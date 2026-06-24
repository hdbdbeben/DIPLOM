import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

interface ModalState {
  title: string;
  body: ReactNode;
  footer: ReactNode;
  onClose?: () => void;
}

interface UIContextType {
  toasts: Toast[];
  modal: ModalState | null;
  showToast: (message: string, type?: Toast['type']) => void;
  showModal: (title: string, body: ReactNode, footer?: ReactNode, onClose?: () => void) => void;
  hideModal: () => void;
}

type Listener = () => void;

let uiState: Omit<UIContextType, 'showToast' | 'showModal' | 'hideModal'> = { toasts: [], modal: null };
let uiListeners: Listener[] = [];
let uid = 1;

function emit() {
  uiState = { ...uiState };
  uiListeners.forEach((l) => l());
}

function subscribe(listener: Listener): () => void {
  uiListeners.push(listener);
  return () => { uiListeners = uiListeners.filter((l) => l !== listener); };
}

export function showToast(message: string, type: Toast['type'] = 'info') {
  const id = uid++;
  uiState.toasts = [...uiState.toasts, { id, message, type }];
  emit();
  setTimeout(() => {
    uiState.toasts = uiState.toasts.filter((t) => t.id !== id);
    emit();
  }, 4000);
}

export function showModal(title: string, body: ReactNode, footer?: ReactNode, onClose?: () => void) {
  uiState.modal = { title, body, footer: footer ?? null, onClose };
  emit();
}

export function hideModal() {
  uiState.modal?.onClose?.();
  uiState.modal = null;
  emit();
}

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

export async function showAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
    showModal(
      'Уведомление',
      <div className="alert-message">{message}</div>,
      <button className="btn btn-primary" onClick={() => { hideModal(); resolve(); }}>OK</button>
    );
  });
}

const UIContext = createContext<UIContextType | null>(null);

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used within UIProvider');
  return ctx;
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIContextType>(() => ({ ...uiState, showToast, showModal, hideModal }));

  useEffect(() => {
    return subscribe(() => setState({ ...uiState, showToast, showModal, hideModal }));
  }, []);

  return <UIContext.Provider value={state}>{children}</UIContext.Provider>;
}
