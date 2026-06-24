interface TabItem {
  key: string;
  label: string;
}

export function Tabs({ items, activeTab, onTabChange }: { items: TabItem[]; activeTab: string; onTabChange: (key: string) => void }) {
  return (
    <div className="tabs">
      {items.map((item) => (
        <button
          key={item.key}
          className={`tab${activeTab === item.key ? ' active' : ''}`}
          onClick={() => onTabChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
