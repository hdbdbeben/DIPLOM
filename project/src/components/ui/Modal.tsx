import { useUI } from '@/contexts/UIContext';

export function Modal() {
  const { modal, hideModal } = useUI();
  if (!modal) return null;

  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) hideModal(); }}>
      <div className="modal-content">
        <div className="modal-header">
          <h4>{modal.title}</h4>
          <button className="modal-close" onClick={hideModal}>&times;</button>
        </div>
        <div className="modal-body">{modal.body}</div>
        {modal.footer && <div className="modal-footer">{modal.footer}</div>}
      </div>
    </div>
  );
}
