/**
 * @file Контекст аутентификации.
 * Предоставляет состояние текущего пользователя, флаги isAuthenticated/isAdmin,
 * а также методы login/logout для всего дерева компонентов.
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User } from '@/types';

/** Тип данных, передаваемых через контекст аутентификации */
interface AuthContextType {
  /** Текущий авторизованный пользователь или null */
  user: User | null;
  /** Флаг: пользователь аутентифицирован (user !== null) */
  isAuthenticated: boolean;
  /** Флаг: текущий пользователь — администратор */
  isAdmin: boolean;
  /** Установка пользователя после успешного входа */
  login: (user: User) => void;
  /** Сброс состояния при выходе */
  logout: () => void;
}

/** Создание контекста с начальным значением null (проверяется в useAuth) */
const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Провайдер контекста аутентификации.
 * Оборачивает дерево компонентов и предоставляет состояние пользователя.
 *
 * @param children Дочерние React-элементы
 *
 * Состояние:
 * - user: объект пользователя (null до входа)
 * - isAuthenticated: производное от user (приведение к boolean)
 * - isAdmin: вычисляется по полю role пользователя
 *
 * Методы:
 * - login: мемоизированная функция сохранения пользователя через useCallback
 * - logout: мемоизированная функция очистки состояния
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // useCallback с пустым массивом зависимостей — функции стабильны на всём жизненном цикле
  const login = useCallback((u: User) => setUser(u), []);
  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user, // двойное отрицание приводит к boolean
        isAdmin: user?.role === 'admin',
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Хук для доступа к контексту аутентификации.
 * Должен использоваться внутри AuthProvider, иначе выбрасывает ошибку.
 *
 * @returns Объект AuthContextType с состоянием и методами аутентификации
 * @throws {Error} Если хук вызван вне AuthProvider
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
