const PptxGenJS = require('pptxgenjs');
const path = require('path');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE'; // 16:9
pptx.defineSlideMaster({
  title: 'MASTER_SLIDE',
  background: { fill: 'FFFFFF' },
  objects: [
    { rect: { x: 0, y: 0, w: '100%', h: 0.08, fill: { color: '1a5276' } } },
    { rect: { x: 0, y: 3.65, w: '100%', h: 0.02, fill: { color: '1a5276' } } },
    { text: { text: 'АСБО | ООО «Социальные услуги»', options: { x: 0.6, y: 3.7, w: 6, h: 0.3, fontSize: 8, color: '999999' } } },
  ],
  slideNumber: { x: 12, y: 3.7, w: 1, h: 0.3, fontSize: 8, color: '999999' },
});

const SCREENSHOTS = path.resolve(__dirname, '..', 'screenshots');

function addTitle(slide, title, subtitle) {
  if (slide.addText) {
    slide.addText(title, { x: 0.6, y: 0.3, w: 12, h: 0.6, fontSize: 24, bold: true, color: '1a5276' });
    if (subtitle) slide.addText(subtitle, { x: 0.6, y: 0.85, w: 12, h: 0.4, fontSize: 14, color: '666666' });
  }
}

// Слайд 1 — Титульный
let s1 = pptx.addSlide();
s1.background = { fill: '1a5276' };
s1.addText('АВТОМАТИЗАЦИЯ БУХГАЛТЕРСКОЙ ДЕЯТЕЛЬНОСТИ\nВ СФЕРЕ СОЦИАЛЬНЫХ УСЛУГ', {
  x: 0.6, y: 1.0, w: 12, h: 1.2, fontSize: 28, bold: true, color: 'FFFFFF', align: 'left'
});
s1.addText('на примере ООО «Социальные услуги»', {
  x: 0.6, y: 2.1, w: 12, h: 0.5, fontSize: 16, color: 'A9DFBF', align: 'left'
});
s1.addText('Выпускная квалификационная работа', { x: 0.6, y: 3.0, w: 12, h: 0.3, fontSize: 12, color: 'D5D8DC' });
s1.addText('Трушкин А.А.', { x: 0.6, y: 3.5, w: 5, h: 0.3, fontSize: 11, color: 'FFFFFF' });

// Слайд 2 — Актуальность и цель
let s2 = pptx.addSlide('MASTER_SLIDE');
addTitle(s2, 'Актуальность и цель работы');
s2.addText([
  { text: 'Актуальность:', options: { bold: true, fontSize: 14, color: '1a5276', breakType: 'none' } },
  { text: '\n• Выручка 2025 г. — 57 970 тыс. руб. (рост 145,7% к 2024 г.)\n• Ручное разнесение банковских выписок — трудоёмкий процесс с риском ошибок\n• 78,4% доходов — государственные контракты → высокие требования к учёту\n• Автоматизация — часть цифровой трансформации и повышения конкурентоспособности', options: { fontSize: 12, color: '333333' } }
], { x: 0.6, y: 1.3, w: 12, h: 1.6 });
s2.addText([
  { text: 'Цель:', options: { bold: true, fontSize: 14, color: '1a5276' } },
  { text: ' автоматизация бухгалтерской деятельности в сфере социальных услуг', options: { fontSize: 12, color: '333333' } }
], { x: 0.6, y: 3.0, w: 12, h: 0.5 });

// Слайд 3 — Объект и предмет, задачи
let s3 = pptx.addSlide('MASTER_SLIDE');
addTitle(s3, 'Объект, предмет и задачи исследования');
s3.addText([
  { text: 'Объект: ', options: { bold: true, fontSize: 13, color: '1a5276' } },
  { text: 'бухгалтерия ООО «Социальные услуги»\n', options: { fontSize: 13 } },
  { text: 'Предмет: ', options: { bold: true, fontSize: 13, color: '1a5276' } },
  { text: 'процесс автоматизации разнесения банковских выписок', options: { fontSize: 13 } }
], { x: 0.6, y: 1.2, w: 5.5, h: 0.9 });

s3.addText([
  { text: 'Задачи:\n', options: { bold: true, fontSize: 11, color: '1a5276' } },
  { text: '1. Анализ предметной области\n2. Анализ бизнес-процессов\n3. Выявление проблем\n4. Обзор существующих решений\n5. Формирование требований\n6. Обоснование проектных решений\n7. Разработка проекта автоматизации\n8. Экономическое обоснование', options: { fontSize: 10, color: '333333' } }
], { x: 6.8, y: 1.2, w: 5.5, h: 2.5 });

// Слайд 4 — Проблема
let s4 = pptx.addSlide('MASTER_SLIDE');
addTitle(s4, 'Проблема и обоснование автоматизации');
s4.addText([
  { text: 'Выявленные проблемы:\n', options: { bold: true, fontSize: 13, color: 'C0392B' } },
  { text: '\n• Неструктурированное поле «Назначение платежа» — затруднена автоматическая классификация', options: { fontSize: 12 } },
  { text: '\n• Высокая доля ручного труда — 46,7 чел.-час./мес. на разнесение 350 выписок', options: { fontSize: 12 } },
  { text: '\n• Сложности с формированием управленческого отчёта ДДС', options: { fontSize: 12 } },
  { text: '\n• Невозможность исключения внутренних оборотов между компаниями группы', options: { fontSize: 12 } },
  { text: '\n• Риск ошибок — в среднем 12 ошибок/мес.', options: { fontSize: 12 } },
], { x: 0.6, y: 1.2, w: 12, h: 2.5 });

// Слайд 5 — Обзор решений и выбор
let s5 = pptx.addSlide('MASTER_SLIDE');
addTitle(s5, 'Обзор решений и выбор стратегии');
const solutions = [
  ['Критерий', 'SOFIT Bank', '1С:АБС', 'RPA', 'Корс-ПП'],
  ['Стоимость владения', 'Низкая (2/5)', 'Высокая (5/5)', 'Средняя (3/5)', 'Средняя (4/5)'],
  ['Интеграция с 1С', 'Отсутствует (1/5)', 'Полная (5/5)', 'Средняя (3/5)', 'Низкая (2/5)'],
  ['Масштабируемость', 'Средняя (3/5)', 'Высокая (4/5)', 'Высокая (4/5)', 'Низкая (2/5)'],
  ['Взвешенная оценка', '2,30', '4,45', '3,10', '3,35'],
];
s5.addTable(solutions, { x: 0.6, y: 1.3, w: 12, h: 2.0, fontSize: 11, border: { type: 'solid', color: 'CCCCCC' },
  colW: [3.5, 2.3, 2.3, 2.3, 2.3],
  rowH: [0.4, 0.4, 0.4, 0.4, 0.4],
});
s5.addText('Выбор: доработка приобретённого решения на базе 1С:Предприятие 8.3 + вспомогательное веб-приложение', {
  x: 0.6, y: 3.3, w: 12, h: 0.4, fontSize: 12, bold: true, color: '1a5276'
});

// Слайд 6 — Процесс разнесения выписок
let s6 = pptx.addSlide('MASTER_SLIDE');
addTitle(s6, 'Типовой процесс разнесения банковской выписки');
s6.addText([
  { text: '1. ', options: { bold: true, color: '1a5276' } }, { text: 'Получение выписки из интернет-банка или файлового архива\n' },
  { text: '2. ', options: { bold: true, color: '1a5276' } }, { text: 'Распознавание и парсинг данных (1CClientBankExchange, TXT, CSV, XML)\n' },
  { text: '3. ', options: { bold: true, color: '1a5276' } }, { text: 'Проверка корректности и фильтрация дублей\n' },
  { text: '4. ', options: { bold: true, color: '1a5276' } }, { text: 'Сопоставление реквизитов со справочниками (контрагенты, договоры, статьи ДДС)\n' },
  { text: '5. ', options: { bold: true, color: '1a5276' } }, { text: 'Формирование бухгалтерских записей\n' },
  { text: '6. ', options: { bold: true, color: '1a5276' } }, { text: 'Передача данных в учётную систему 1С\n' },
  { text: '7. ', options: { bold: true, color: '1a5276' } }, { text: 'Контроль качества и обработка исключений\n' },
  { text: '8. ', options: { bold: true, color: '1a5276' } }, { text: 'Оповещение ответственных сотрудников' },
], { x: 0.6, y: 1.2, w: 12, h: 2.5, fontSize: 12 });

// Слайд 7 — Архитектура
let s7 = pptx.addSlide('MASTER_SLIDE');
addTitle(s7, 'Информационное и программное обеспечение');
s7.addText([
  { text: 'Пользователи:', options: { bold: true, fontSize: 13, color: '1a5276' } },
  { text: '\n• Сотрудники бухгалтерии → загрузка выписок, работа с платежами\n• ИТ-специалист / администратор → управление справочниками, пользователями\n• Руководитель → просмотр отчётов ДДС', options: { fontSize: 12 } }
], { x: 0.6, y: 1.2, w: 5.5, h: 1.3 });

s7.addText([
  { text: 'Технологический стек:', options: { bold: true, fontSize: 13, color: '1a5276' } },
  { text: '\n• Фронтенд: React 18, TypeScript, Vite 6\n• Бэкенд: Express 4, TypeScript\n• База данных: SQLite (better-sqlite3)\n• Интеграция с 1С: файловый обмен, REST API\n• Моки для тестирования: MSW 2', options: { fontSize: 12 } }
], { x: 6.8, y: 1.2, w: 5.5, h: 1.3 });

s7.addText([
  { text: 'Роли доступа: Администратор | Бухгалтер | Руководитель', options: { fontSize: 11, color: '999999' } }
], { x: 0.6, y: 3.0, w: 12, h: 0.3 });

// Слайд 8 — Скриншот: загрузка выписок
let s8 = pptx.addSlide('MASTER_SLIDE');
addTitle(s8, 'Загрузка банковских выписок');
try { s8.addImage({ path: path.join(SCREENSHOTS, '02_statements.png'), x: 0.4, y: 1.1, w: 12.4, h: 2.6 }); } catch(e) {}
s8.addText('Форматы: 1CClientBankExchange, TXT, CSV, XML. Автоматический парсинг, проверка дублей, экспорт в 1С.', {
  x: 0.6, y: 3.7, w: 12, h: 0.3, fontSize: 10, color: '666666' });

// Слайд 9 — Скриншот: платёжные операции
let s9 = pptx.addSlide('MASTER_SLIDE');
addTitle(s9, 'Платёжные операции');
try { s9.addImage({ path: path.join(SCREENSHOTS, '03_payments.png'), x: 0.4, y: 1.1, w: 12.4, h: 2.6 }); } catch(e) {}
s9.addText('Фильтрация по статусу, контрагенту. Ручная классификация. Отправка платёжных поручений в банк.', {
  x: 0.6, y: 3.7, w: 12, h: 0.3, fontSize: 10, color: '666666' });

// Слайд 10 — Скриншот: справочники
let s10 = pptx.addSlide('MASTER_SLIDE');
addTitle(s10, 'Справочники системы');
try { s10.addImage({ path: path.join(SCREENSHOTS, '04_directories.png'), x: 0.4, y: 1.1, w: 12.4, h: 2.6 }); } catch(e) {}
s10.addText('Контрагенты, банки, типы платежей, статьи ДДС, договоры. Полный CRUD с модальными формами.', {
  x: 0.6, y: 3.7, w: 12, h: 0.3, fontSize: 10, color: '666666' });

// Слайд 11 — Скриншот: отчёт ДДС
let s11 = pptx.addSlide('MASTER_SLIDE');
addTitle(s11, 'Отчёт о движении денежных средств (ДДС)');
try { s11.addImage({ path: path.join(SCREENSHOTS, '05_reports.png'), x: 0.4, y: 1.1, w: 12.4, h: 2.6 }); } catch(e) {}
s11.addText('Сводка по статьям доходов/расходов. Фильтр по диапазону дат. Экспорт в CSV.', {
  x: 0.6, y: 3.7, w: 12, h: 0.3, fontSize: 10, color: '666666' });

// Слайд 12 — Скриншот: журнал ошибок
let s12 = pptx.addSlide('MASTER_SLIDE');
addTitle(s12, 'Журнал ошибок и обработка исключений');
try { s12.addImage({ path: path.join(SCREENSHOTS, '06_errors.png'), x: 0.4, y: 1.1, w: 12.4, h: 2.6 }); } catch(e) {}
s12.addText('Статусы: новая → в работе → решена. Назначение ответственного. Журнал действий.', {
  x: 0.6, y: 3.7, w: 12, h: 0.3, fontSize: 10, color: '666666' });

// Слайд 13 — Скриншот: интеграция с 1С
let s13 = pptx.addSlide('MASTER_SLIDE');
addTitle(s13, 'Интеграция с 1С:Предприятие');
try { s13.addImage({ path: path.join(SCREENSHOTS, '07_1c_integration.png'), x: 0.4, y: 1.1, w: 12.4, h: 2.6 }); } catch(e) {}
s13.addText('Импорт организаций/договоров из 1С. Экспорт обработанных платежей. Журнал обмена.', {
  x: 0.6, y: 3.7, w: 12, h: 0.3, fontSize: 10, color: '666666' });

// Слайд 14 — Администрирование
let s14 = pptx.addSlide('MASTER_SLIDE');
addTitle(s14, 'Администрирование системы');
try { s14.addImage({ path: path.join(SCREENSHOTS, '08_admin.png'), x: 0.4, y: 1.1, w: 12.4, h: 2.6 }); } catch(e) {}
s14.addText('Управление пользователями и ролями. Резервное копирование и восстановление БД.', {
  x: 0.6, y: 3.7, w: 12, h: 0.3, fontSize: 10, color: '666666' });

// Слайд 15 — Функционал системы
let s15 = pptx.addSlide('MASTER_SLIDE');
addTitle(s15, 'Реализованный функционал');
s15.addText([
  { text: 'Основные функции:\n', options: { bold: true, fontSize: 13, color: '1a5276' } },
  { text: '\n✓ Загрузка банковских выписок (1CClientBankExchange, TXT, CSV, XML)', options: { fontSize: 12 } },
  { text: '\n✓ Автоматическое распознавание реквизитов платёжных поручений', options: { fontSize: 12 } },
  { text: '\n✓ Классификация операций по контрагентам и статьям ДДС', options: { fontSize: 12 } },
  { text: '\n✓ Ведение справочников (контрагенты, банки, типы платежей, статьи)', options: { fontSize: 12 } },
  { text: '\n✓ Формирование управленческого отчёта ДДС с экспортом в Excel', options: { fontSize: 12 } },
  { text: '\n✓ Исключение внутренних оборотов между организациями группы', options: { fontSize: 12 } },
  { text: '\n✓ Журнал ошибок с назначением ответственных', options: { fontSize: 12 } },
  { text: '\n✓ Интеграция с 1С:Предприятие (импорт/экспорт)', options: { fontSize: 12 } },
  { text: '\n✓ Аудит действий пользователей', options: { fontSize: 12 } },
  { text: '\n✓ Разграничение прав доступа (3 роли)', options: { fontSize: 12 } },
], { x: 0.6, y: 1.2, w: 12, h: 2.5 });

// Слайд 16 — Апробация
let s16 = pptx.addSlide('MASTER_SLIDE');
addTitle(s16, 'Апробация и тестирование');
s16.addText([
  { text: 'Результаты нагрузочного тестирования:', options: { bold: true, fontSize: 13, color: '1a5276' } },
], { x: 0.6, y: 1.2, w: 12, h: 0.4 });
s16.addTable([
  ['Объём выписок', 'Время обработки', 'Среднее на 1 выписку', 'Авто-разнесено', 'Ошибки'],
  ['500 шт.', '12 мин.', '1,44 сек.', '87%', '3%'],
  ['1 000 шт.', '25 мин.', '1,50 сек.', '86%', '3%'],
  ['2 000 шт.', '55 мин.', '1,65 сек.', '84%', '4%'],
], { x: 0.6, y: 1.7, w: 12, h: 1.2, fontSize: 11, border: { type: 'solid', color: 'CCCCCC' } });

s16.addText([
  { text: '\nОжидаемый эффект:\n', options: { bold: true, fontSize: 12, color: '1a5276' } },
  { text: '• Сокращение времени обработки выписок с 46,7 до 8,75 часов в месяц (−81,3%)\n• Снижение ошибок с 12 до 2 в месяц (−83,3%)\n• Освобождение времени бухгалтеров для аналитической работы', options: { fontSize: 11 } },
], { x: 0.6, y: 2.9, w: 12, h: 0.8 });

// Слайд 17 — Экономическая эффективность
let s17 = pptx.addSlide('MASTER_SLIDE');
addTitle(s17, 'Экономическая эффективность проекта');
s17.addTable([
  ['Показатель', 'Значение'],
  ['Капитальные вложения на проектирование (Кп)', '253 812,69 руб.'],
  ['Суммарные затраты на разработку', '268 812,69 руб.'],
  ['Годовая экономия (ΔС)', '450 000 руб.'],
  ['Срок окупаемости (Ток = Кп / ΔС)', '~7 месяцев (0,56 года)'],
  ['Коэффициент эффективности (Ер = ΔС / Кп)', '1,77'],
  ['NPV за 5 лет при ставке 15%', '1 239 660 руб.'],
], { x: 0.6, y: 1.3, w: 10, h: 2.2, fontSize: 12, border: { type: 'solid', color: 'CCCCCC' },
  colW: [5.5, 4.5],
});
s17.addText('Проект признан экономически эффективным. Ер = 1,77 > 1.', {
  x: 0.6, y: 3.5, w: 12, h: 0.3, fontSize: 13, bold: true, color: '27AE60' });

// Слайд 18 — Результаты и перспективы
let s18 = pptx.addSlide('MASTER_SLIDE');
addTitle(s18, 'Результаты и перспективы развития');
s18.addText([
  { text: 'Достигнутые результаты:\n', options: { bold: true, fontSize: 13, color: '27AE60' } },
  { text: '\n✓ Разработан проект автоматизации банковских операций\n✓ Реализован веб-интерфейс с 10 функциональными разделами\n✓ Проведено нагрузочное тестирование\n✓ Выполнено экономическое обоснование\n✓ Система готова к пилотному внедрению', options: { fontSize: 12 } },
], { x: 0.6, y: 1.2, w: 5.5, h: 2.0 });

s18.addText([
  { text: 'Перспективы:\n', options: { bold: true, fontSize: 13, color: '1a5276' } },
  { text: '\n• Интеграция с системами ЭДО\n• Применение ML для классификации назначений платежа\n• Расширение отчётности (баланс, P&L)\n• Масштабирование на другие организации группы\n• Переход на PostgreSQL при росте данных', options: { fontSize: 12 } },
], { x: 6.8, y: 1.2, w: 5.5, h: 2.0 });

// Слайд 19 — Заключение
let s19 = pptx.addSlide('MASTER_SLIDE');
s19.background = { fill: '1a5276' };
s19.addText('ЗАКЛЮЧЕНИЕ', { x: 0.6, y: 0.6, w: 12, h: 0.7, fontSize: 28, bold: true, color: 'FFFFFF' });
s19.addText([
  { text: '• Цель работы достигнута — разработан проект автоматизации бухгалтерской деятельности\n', options: { fontSize: 13, color: 'FFFFFF' } },
  { text: '• Проведён анализ предметной области, обоснован выбор технологий\n', options: { fontSize: 13, color: 'FFFFFF' } },
  { text: '• Реализован полный цикл обработки банковских выписок\n', options: { fontSize: 13, color: 'FFFFFF' } },
  { text: '• Выполнено нагрузочное тестирование — система обрабатывает до 2 000 выписок\n', options: { fontSize: 13, color: 'FFFFFF' } },
  { text: '• Экономический эффект подтверждён — срок окупаемости ~7 месяцев\n', options: { fontSize: 13, color: 'FFFFFF' } },
  { text: '• Результаты могут быть использованы в ООО «Социальные услуги» и адаптированы для других организаций', options: { fontSize: 13, color: 'FFFFFF' } },
], { x: 0.6, y: 1.6, w: 12, h: 1.8 });

s19.addText('Спасибо за внимание!', { x: 0.6, y: 3.3, w: 12, h: 0.5, fontSize: 18, bold: true, color: 'A9DFBF' });

// Сохраняем
const outputPath = path.resolve(__dirname, '..', 'presentation.pptx');
pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log('Presentation saved: ' + outputPath);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
