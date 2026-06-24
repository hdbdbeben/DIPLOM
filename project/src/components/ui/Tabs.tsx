/**
 * Элемент вкладки — ключ и отображаемая метка.
 */
interface TabItem {
  /** Уникальный идентификатор вкладки */
  key: string;
  /** Текстовая метка вкладки, отображаемая пользователю */
  label: string;
}

/**
 * Компонент вкладок (табов).
 *
 * Отображает горизонтальный набор кнопок-вкладок. Активная вкладка выделяется
 * CSS-классом 'active'. При клике на вкладку вызывается колбэк onTabChange,
 * передавая ключ выбранной вкладки родительскому компоненту для управления
 * состоянием активной вкладки сверху (controlled component).
 *
 * @param props.items    - Массив объектов вкладок с полями key и label
 * @param props.activeTab - Ключ текущей активной вкладки
 * @param props.onTabChange - Колбэк смены вкладки, получает ключ новой вкладки
 * @component
 */
export function Tabs({ items, activeTab, onTabChange }: { items: TabItem[]; activeTab: string; onTabChange: (key: string) => void }) {
  return (
    <div className="tabs">
      {items.map((item) => (
        <button
          key={item.key}
          /** Условное добавление класса 'active' для выделения текущей вкладки */
          className={`tab${activeTab === item.key ? ' active' : ''}`}
          onClick={() => onTabChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
