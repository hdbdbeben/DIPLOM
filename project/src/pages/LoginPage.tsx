import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { login } from '@/api/endpoints';
import { ApiError } from '@/api/client';

/**
 * Страница аутентификации пользователя в системе АСБО.
 *
 * Предоставляет форму входа с полями логина и пароля, обрабатывает
 * отправку учётных данных на сервер, сохраняет сессию через контекст
 * авторизации и перенаправляет на главную страницу при успехе.
 * Также отображает демонстрационные учётные данные для тестового доступа.
 *
 * @component
 * @returns JSX-элемент страницы входа
 */
export function LoginPage() {
  // Состояние поля ввода логина
  const [loginVal, setLoginVal] = useState('');
  // Состояние поля ввода пароля
  const [password, setPassword] = useState('');
  // Состояние текста ошибки аутентификации
  const [error, setError] = useState('');
  // Флаг выполнения запроса — блокирует кнопку и меняет её текст
  const [loading, setLoading] = useState(false);
  // Получаем функцию входа из контекста авторизации (aliased как authLogin)
  const { login: authLogin } = useAuth();
  // Хук для программной навигации после успешного входа
  const navigate = useNavigate();

  /**
   * Обработчик отправки формы входа.
   *
   * Предотвращает стандартное поведение формы, валидирует заполнение полей,
   * отправляет API-запрос аутентификации и при успехе сохраняет пользователя
   * в контексте авторизации с последующим перенаправлением на главную.
   *
   * @param e - Событие отправки формы
   */
  const handleSubmit = async (e: React.FormEvent) => {
    // Блокируем перезагрузку страницы
    e.preventDefault();
    // Проверка: оба поля обязательны
    if (!loginVal || !password) return;
    // Устанавливаем флаг загрузки, сбрасываем предыдущую ошибку
    setLoading(true);
    setError('');
    try {
      // Запрос аутентификации к API
      const user = await login(loginVal, password);
      // Сохраняем данные пользователя в контексте авторизации
      authLogin(user);
      // Перенаправление на главную страницу
      navigate('/');
    } catch (err) {
      // Если ошибка типизированная (ApiError) — показываем её сообщение,
      // иначе — общее сообщение о проблеме подключения
      setError(err instanceof ApiError ? err.message : 'Ошибка подключения к серверу');
    } finally {
      // Снимаем флаг загрузки в любом случае
      setLoading(false);
    }
  };

  return (
    <div className="page active" id="loginPage">
      <div className="login-container">
        {/* Заголовок страницы с названием системы и организацией */}
        <div className="login-header">
          <h1>АСБО</h1>
          <p>Автоматизированная система банковских операций</p>
          <p className="login-sub">ООО «Социальные услуги»</p>
        </div>
        {/* Форма входа: логин, пароль, кнопка отправки */}
        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="loginUser">Логин</label>
            {/* Поле ввода логина, управляемое состоянием loginVal */}
            <input id="loginUser" type="text" placeholder="Введите логин" value={loginVal} onChange={(e) => setLoginVal(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="loginPass">Пароль</label>
            {/* Поле ввода пароля, управляемое состоянием password */}
            <input id="loginPass" type="password" placeholder="Введите пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {/* Блок ошибки — отображается условно при наличии сообщения об ошибке */}
          {error && <div className="error-msg">{error}</div>}
          {/* Кнопка отправки формы; блокируется на время запроса, текст меняется на «Вход...» */}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        {/* Блок демонстрационных учётных данных для тестового входа */}
        <div className="login-demo">
          <p><strong>Демо-доступ:</strong></p>
          <p>Администратор: admin / admin</p>
          <p>Бухгалтер: buh / buh123</p>
          <p>Руководитель: dir / dir123</p>
        </div>
      </div>
    </div>
  );
}
