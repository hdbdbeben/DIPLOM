import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { login } from '@/api/endpoints';
import { ApiError } from '@/api/client';

export function LoginPage() {
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginVal || !password) return;
    setLoading(true);
    setError('');
    try {
      const user = await login(loginVal, password);
      authLogin(user);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page active" id="loginPage">
      <div className="login-container">
        <div className="login-header">
          <h1>АСБО</h1>
          <p>Автоматизированная система банковских операций</p>
          <p className="login-sub">ООО «Социальные услуги»</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group">
            <label htmlFor="loginUser">Логин</label>
            <input id="loginUser" type="text" placeholder="Введите логин" value={loginVal} onChange={(e) => setLoginVal(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="loginPass">Пароль</label>
            <input id="loginPass" type="password" placeholder="Введите пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
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
