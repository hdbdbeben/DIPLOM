import { useUI } from '@/contexts/UIContext';

/**
 * Глобальное модальное окно приложения. Управляется через UIContext.
 *
 * Отображает модальное окно с заголовком, телом и опциональным подвалом.
 * Поддерживает закрытие двумя способами:
 * - Кнопка «×» в заголовке
 * - Клик по оверлею (фону) за пределами контентной области
 *
 * Если modal === null (в контексте), компонент не рендерит ничего.
 *
 * @component
 */
export function Modal() {
  const { modal, hideModal } = useUI();

  /** Модальное окно неактивно — ничего не рендерим */
  if (!modal) return null;

  return (
    <div
      className="modal"
      /**
       * Закрытие модального окна при клике на оверлей.
       * Сравнение e.target === e.currentTarget гарантирует, что клик
       * был именно по оверлею, а не по внутреннему содержимому.
       */
      onClick={(e) => { if (e.target === e.currentTarget) hideModal(); }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h4>{modal.title}</h4>
          {/** Кнопка закрытия модального окна */}
          <button className="modal-close" onClick={hideModal}>&times;</button>
        </div>
        <div className="modal-body">{modal.body}</div>
        {/** Подвал отображается только если передан в объекте modal */}
        {modal.footer && <div className="modal-footer">{modal.footer}</div>}
      </div>
    </div>
  );
}
