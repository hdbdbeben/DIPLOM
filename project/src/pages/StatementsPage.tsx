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

export function StatementsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [statements, setStatements] = useState<Statement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ documents: StatementDocument[]; fileName: string } | null>(null);

  const loadStatements = useCallback(() => {
    setLoading(true);
    fetchStatements()
      .then(setStatements)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadStatements(); }, [loadStatements]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = detectAndParse(reader.result as string, file.name);
      if (!parsed.documents.length) {
        showAlert('Не удалось распознать документы в файле.');
        return;
      }
      setPreview({ documents: parsed.documents, fileName: file.name });
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDemo = () => {
    const parsed = detectAndParse(DEMO_DATA, 'demo_statement.txt');
    setPreview({ documents: parsed.documents, fileName: 'demo_statement.txt (демонстрационная выписка)' });
  };

  const confirmUpload = async () => {
    if (!preview || uploading) return;
    setUploading(true);
    try {
      const result = await uploadStatement({
        fileName: preview.fileName,
        documents: preview.documents,
        userId: user?.id ?? null,
      });
      setPreview(null);
      showAlert(`Выписка загружена: ${result.total} операций, автоматически обработано: ${result.autoProcessed}, ошибок: ${result.errorCount}`);
      loadStatements();
    } catch (err) {
      showAlert('Ошибка загрузки: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить выписку и все её операции?')) return;
    try {
      await deleteStatement(id);
      showToast('Выписка удалена', 'success');
      loadStatements();
    } catch (err) {
      showAlert('Ошибка: ' + (err as Error).message);
    }
  };

  return (
    <div className="content-page active">
      <div className="toolbar">
        <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>Загрузить выписку</button>
        <input ref={fileInputRef} type="file" accept=".txt,.csv,.xml" className="hidden" onChange={handleFileUpload} />
        <button className="btn btn-secondary" onClick={handleDemo}>Загрузить демо-выписку</button>
      </div>
      <div className="page-scroll">
        {preview && (
          <div className="panel">
            <h4>Предпросмотр загруженной выписки</h4>
            <p>Файл: <strong>{escapeHtml(preview.fileName)}</strong></p>
            <p>Найдено документов: <strong>{preview.documents.length}</strong></p>
            <table className="preview-table">
              <thead><tr><th>№</th><th>Дата</th><th>Номер</th><th>Контрагент</th><th>Сумма</th><th>Назначение</th></tr></thead>
              <tbody>
                {preview.documents.map((d, i) => (
                  <tr key={i}><td>{i + 1}</td><td>{d['Дата'] || ''}</td><td>{d['Номер'] || ''}</td><td>{d['Плательщик'] || d['Получатель'] || ''}</td><td>{d['Сумма'] || ''}</td><td>{(d['НазначениеПлатежа'] || '').substring(0, 60)}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="btn-row">
              <button className="btn btn-primary" onClick={confirmUpload} disabled={uploading}>Подтвердить и обработать</button>
              <button className="btn btn-outline" onClick={() => setPreview(null)}>Отмена</button>
            </div>
          </div>
        )}
        <div className="panel">
          <h4>Архив выписок</h4>
          {loading ? <LoadingSpinner /> : (
            <table className="table">
              <thead><tr><th>ID</th><th>Дата загрузки</th><th>Файл</th><th>Операций</th><th>Автоматически</th><th>Ошибок</th><th>Статус</th><th></th></tr></thead>
              <tbody>
                {statements.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td><td>{formatDate(s.uploaded_at)}</td><td>{s.file_name}</td><td>{s.total_operations}</td><td>{s.auto_processed}</td><td>{s.error_count}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      <button className="btn btn-sm btn-outline" style={{ marginRight: 6 }} onClick={() => navigate(`/payments?statementId=${s.id}`)}>Операции</button>
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
