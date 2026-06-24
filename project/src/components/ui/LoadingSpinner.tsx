/**
 * Индикатор загрузки. Отображает анимированный спиннер с текстом «Загрузка...».
 * Используется как fallback при ожидании асинхронных данных (React Suspense, ленивая загрузка).
 *
 * Не принимает props — визуальное представление полностью фиксировано.
 *
 * @component
 */
export function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      {/** Визуальный элемент анимации спиннера (CSS) */}
      <div className="spinner" />
      <span>Загрузка...</span>
    </div>
  );
}
