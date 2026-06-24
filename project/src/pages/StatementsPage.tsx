import { useState, useRef, useEffect, useCallback } from 'react';
import { fetchStatements, uploadStatement, deleteStatement } from '@/api/endpoints';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, escapeHtml } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { showAlert, showToast } from '@/contexts/UIContext';
import { detectAndParse } from '@/lib/parser';
import type { Statement, StatementDocument } from '@/types';
import { useNavigate } from 'react-router-dom';

/**
 * Демонстрационные данные банковской выписки в формате 1CClientBankExchange.
 *
 * Используется для показа функциональности загрузки и парсинга выписок
 * без необходимости загрузки реального файла. Содержит 5 платёжных поручений
 * с различными контрагентами, суммами и назначениями.
 */
const DEMO_DATA = `1CClientBankExchange
ВерсияФормата=1.03
Кодировка=Windows-1251
Отправитель=ООО "Социальные услуги"
Получатель=ПАО СБЕРБАНК
ДатаСоздания=07.05.2026
ВремяСоздания=10:15:00
СекцияДокумент=Платежное поручение
Номер=1248
Дата=07.05.2026
Сумма=202898.75
Плательщик=ИНН 7734660892 ООО "Мави Джинс"
ПлательщикСчет=40702810500010001234
ПлательщикБИК=044525225
Получатель=ООО "Социальные услуги"
ПолучательИНН=7713699602
ПолучательСчет=40702810800220100505
ПолучательБИК=044525225
НазначениеПлатежа=Оплата по счету № 1595/92 за обслуживание
КонецДокумента
СекцияДокумент=Платежное поручение
Номер=1356
Дата=06.05.2026
Сумма=157000.00
Плательщик=Департамент труда и соцзащиты г. Москвы
ПлательщикИНН=7710660053
Получатель=ООО "Социальные услуги"
ПолучательИНН=7713699602
ПолучательСчет=40702810800220100505
НазначениеПлатежа=Оплата по госконтракту за оказание социальных услуг
КонецДокумента
СекцияДокумент=Платежное поручение
Номер=1401
Дата=06.05.2026
Сумма=45000.00
Плательщик=ООО "Социальные услуги"
ПлательщикИНН=7713699602
Получатель=ООО "Ромашка"
ПолучательИНН=7728300200
НазначениеПлатежа=Оплата по договору № 45 за канцелярские товары
КонецДокумента
СекцияДокумент=Платежное поручение
Номер=1402
Дата=05.05.2026
Сумма=32000.50
Плательщик=ООО "Социальные услуги"
ПлательщикИНН=7713699602
Получатель=АО "Флант"
ПолучательИНН=7702033720
НазначениеПлатежа=Оплата по счету № FL-887 за хостинг
КонецДокумента
СекцияДокумент=Платежное поручение
Номер=1275
Дата=05.05.2026
Сумма=89000.00
Плательщик=ИП Иванов И.И.
ПлательщикИНН=771501001234
Получатель=ООО "Социальные услуги"
ПолучательИНН=7713699602
НазначениеПлатежа=Оплата по договору № 12 за соц-псих услуги
КонецДокумента`;

/**
 * Страница управления банковскими выписками.
 *
 * Позволяет загружать файлы выписок (TXT/CSV/XML) через парсер,
 * просматривать архив ранее загруженных выписок, удалять их и
 * переходить к детализации платёжных операций конкретной выписки.
 * Поддерживает демонстрационный режим с предзаполненными данными.
 *
 * Основные возможности:
 * - Загрузка и парсинг файла выписки
 * - Предпросмотр распознанных документов перед сохранением
 * - Подтверждение загрузки с автоматической обработкой операций
 * - Архив выписок с отображением статуса и статистики
 * - Удаление выписки со всеми связанными операциями
 * - Навигация к странице операций конкретной выписки
 *
 * @component
 * @returns JSX-элемент страницы выписок
 */
export function StatementsPage() {
  // Текущий авторизованный пользователь
  const { user } = useAuth();
  // Хук навигации для перехода к операциям выписки
  const navigate = useNavigate();
  // Ссылка на скрытый input[type=file] для загрузки файла
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Список загруженных выписок
  const [statements, setStatements] = useState<Statement[]>([]);
  // Флаг загрузки списка выписок
  const [loading, setLoading] = useState(true);
  // Флаг выполнения загрузки/обработки выписки (блокирует кнопку подтверждения)
  const [uploading, setUploading] = useState(false);
  // Данные предпросмотра: распознанные документы и имя файла (null — предпросмотр скрыт)
  const [preview, setPreview] = useState<{ documents: StatementDocument[]; fileName: string } | null>(null);

  /**
   * Загружает список выписок с сервера.
   *
   * Мемоизирован через useCallback, чтобы избежать лишних пересозданий
   * функции при ререндерах. Ошибки загрузки игнорируются (поглощаются).
   */
  const loadStatements = useCallback(() => {
    setLoading(true);
    fetchStatements()
      .then(setStatements)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Первичная загрузка списка выписок при монтировании компонента
  useEffect(() => { loadStatements(); }, [loadStatements]);

  /**
   * Обработчик выбора файла через input[type=file].
   *
   * Читает содержимое файла как текст, передаёт в парсер для распознавания
   * документов и при успехе отображает панель предпросмотра. При неудаче
   * распознавания показывает предупреждение.
   *
   * @param e - Событие изменения input
   */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Извлекаем первый выбранный файл
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    // По завершении чтения вызываем парсер и показываем предпросмотр
    reader.onload = () => {
      const parsed = detectAndParse(reader.result as string, file.name);
      // Если документы не распознаны — уведомление
      if (!parsed.documents.length) {
        showAlert('Не удалось распознать документы в файле.');
        return;
      }
      // Сохраняем результат парсинга для предпросмотра
      setPreview({ documents: parsed.documents, fileName: file.name });
    };
    reader.readAsText(file);
    // Сбрасываем value input, чтобы повторный выбор того же файла сработал
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * Обработчик загрузки демонстрационной выписки.
   *
   * Парсит предопределённые данные DEMO_DATA и отображает панель предпросмотра
   * с пометкой «демонстрационная выписка».
   */
  const handleDemo = () => {
    const parsed = detectAndParse(DEMO_DATA, 'demo_statement.txt');
    setPreview({ documents: parsed.documents, fileName: 'demo_statement.txt (демонстрационная выписка)' });
  };

  /**
   * Подтверждение загрузки выписки после предпросмотра.
   *
   * Отправляет распознанные документы на сервер для сохранения и
   * автоматической обработки. По завершении показывает статистику:
   * общее количество операций, число автоматически обработанных и ошибок.
   *
   * @async
   */
  const confirmUpload = async () => {
    // Защита: нет данных предпросмотра или уже идёт загрузка
    if (!preview || uploading) return;
    setUploading(true);
    try {
      // Отправка выписки на сервер
      const result = await uploadStatement({
        fileName: preview.fileName,
        documents: preview.documents,
        userId: user?.id ?? null,
      });
      // Скрываем панель предпросмотра
      setPreview(null);
      // Информируем пользователя о результатах обработки
      showAlert(`Выписка загружена: ${result.total} операций, автоматически обработано: ${result.autoProcessed}, ошибок: ${result.errorCount}`);
      // Перезагружаем список выписок
      loadStatements();
    } catch (err) {
      showAlert('Ошибка загрузки: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Обработчик удаления выписки.
   *
   * Запрашивает подтверждение через браузерный диалог confirm,
   * затем удаляет выписку и все связанные с ней платёжные операции.
   *
   * @param id - Идентификатор удаляемой выписки
   * @async
   */
  const handleDelete = async (id: number) => {
    // Подтверждение удаления
    if (!window.confirm('Удалить выписку и все её операции?')) return;
    try {
      await deleteStatement(id);
      // Toast-уведомление об успехе
      showToast('Выписка удалена', 'success');
      // Обновляем список после удаления
      loadStatements();
    } catch (err) {
      showAlert('Ошибка: ' + (err as Error).message);
    }
  };

  return (
    <div className="content-page active">
      {/* Панель инструментов: кнопки загрузки файла и демо-выписки */}
      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>Загрузить выписку</button>
        {/* Скрытый input для выбора файла; управляется через ref */}
        <input ref={fileInputRef} type="file" accept=".txt,.csv,.xml" className="hidden" onChange={handleFileUpload} />
        <button className="btn btn-secondary" onClick={handleDemo}>Загрузить демо-выписку</button>
      </div>
      <div className="page-scroll">
        {/* Панель предпросмотра — отображается после парсинга файла перед подтверждением */}
        {preview && (
          <div className="panel">
            <h4>Предпросмотр загруженной выписки</h4>
            {/* Имя файла с защитой от XSS через escapeHtml */}
            <p>Файл: <strong>{escapeHtml(preview.fileName)}</strong></p>
            <p>Найдено документов: <strong>{preview.documents.length}</strong></p>
            <table className="preview-table">
              <thead><tr><th>№</th><th>Дата</th><th>Номер</th><th>Контрагент</th><th>Сумма</th><th>Назначение</th></tr></thead>
              <tbody>
                {/* Рендер распознанных документов с обрезкой назначения до 60 символов */}
                {preview.documents.map((d, i) => (
                  <tr key={i}><td>{i + 1}</td><td>{d['Дата'] || ''}</td><td>{d['Номер'] || ''}</td><td>{d['Плательщик'] || d['Получатель'] || ''}</td><td>{d['Сумма'] || ''}</td><td>{(d['НазначениеПлатежа'] || '').substring(0, 60)}</td></tr>
                ))}
              </tbody>
            </table>
            {/* Кнопки подтверждения загрузки и отмены */}
            <div className="btn-row">
              <button className="btn btn-primary" onClick={confirmUpload} disabled={uploading}>Подтвердить и обработать</button>
              <button className="btn btn-outline" onClick={() => setPreview(null)}>Отмена</button>
            </div>
          </div>
        )}
        {/* Панель архива выписок — список всех ранее загруженных */}
        <div className="panel">
          <h4>Архив выписок</h4>
          {loading ? <LoadingSpinner /> : (
            <table className="table">
              <thead><tr><th>ID</th><th>Дата загрузки</th><th>Файл</th><th>Операций</th><th>Автоматически</th><th>Ошибок</th><th>Статус</th><th></th></tr></thead>
              <tbody>
                {statements.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td><td>{formatDate(s.uploaded_at)}</td><td>{s.file_name}</td><td>{s.total_operations}</td><td>{s.auto_processed}</td><td>{s.error_count}</td>
                    {/* Бейдж статуса выписки (processed/manual/error) */}
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      {/* Переход к списку операций данной выписки с фильтром по statementId */}
                      <button className="btn btn-sm btn-outline" style={{ marginRight: 6 }} onClick={() => navigate(`/payments?statementId=${s.id}`)}>Операции</button>
                      {/* Удаление выписки с предварительным подтверждением */}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
