import PptxGenJS from "pptxgenjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const SCREENSHOTS = path.join(ROOT, "screenshots");
const DOC_SCREENSHOTS = path.join(ROOT, "docs", "screenshots");
const OUTPUT = path.join(ROOT, "presentation.pptx");

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 inches
pptx.author = "Трушкин А.А.";
pptx.title = "Автоматизация бухгалтерской деятельности в сфере социальных услуг";

// ── Colors ──
const C = {
  dark: "1A3C6E",
  accent: "2E86C1",
  accent2: "3498DB",
  white: "FFFFFF",
  black: "222222",
  gray: "555555",
  lightGray: "ECF0F1",
  green: "27AE60",
  red: "C0392B",
  bg: "F8F9FA",
};

// ── Shared text options ──
const bodyOpts = { fontSize: 14, color: C.gray, align: "left", breakLine: true };

function img(name) {
  const p1 = path.join(SCREENSHOTS, name);
  if (fs.existsSync(p1)) return p1;
  const p2 = path.join(DOC_SCREENSHOTS, name);
  if (fs.existsSync(p2)) return p2;
  return null;
}

function slide(s) {
  s.background = { color: C.white };
  // Footer line
  s.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 6.9, w: 12.3, h: 0.02, fill: { color: C.accent }
  });
  s.addText("ВКР | Трушкин А.А. | Автоматизация бухгалтерской деятельности", {
    x: 0.5, y: 6.95, w: 6, h: 0.35, fontSize: 8, color: C.gray
  });
  return s;
}

// ══════════════════════════════════════════════
// SLIDE 1 — Title
// ══════════════════════════════════════════════
(function () {
  const s = pptx.addSlide();
  s.background = { color: C.dark };
  // Accent bar at top
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: C.accent } });

  s.addText("АВТОМАТИЗАЦИЯ БУХГАЛТЕРСКОЙ ДЕЯТЕЛЬНОСТИ", {
    x: 1, y: 1.2, w: 11.3, h: 1, fontSize: 30, bold: true, color: C.white, align: "center",
  });
  s.addText("В СФЕРЕ СОЦИАЛЬНЫХ УСЛУГ", {
    x: 1, y: 2.1, w: 11.3, h: 0.8, fontSize: 24, color: C.accent2, align: "center",
  });
  s.addText("на примере ООО «Социальные услуги»", {
    x: 1, y: 2.8, w: 11.3, h: 0.6, fontSize: 16, color: C.lightGray, align: "center",
  });

  s.addShape(pptx.ShapeType.rect, { x: 3.5, y: 3.7, w: 6.3, h: 0.03, fill: { color: C.accent } });

  s.addText("Выпускная квалификационная работа", {
    x: 1, y: 4.1, w: 11.3, h: 0.5, fontSize: 14, color: C.lightGray, align: "center",
  });
  s.addText("Выполнил: Трушкин Александр Александрович", {
    x: 1, y: 4.8, w: 11.3, h: 0.4, fontSize: 13, color: C.lightGray, align: "center",
  });
  s.addText("Москва, 2026 г.", {
    x: 1, y: 5.5, w: 11.3, h: 0.4, fontSize: 12, color: C.lightGray, align: "center",
  });
})();

// ══════════════════════════════════════════════
// SLIDE 2 — Актуальность и цель
// ══════════════════════════════════════════════
(function () {
  const s = slide(pptx.addSlide());
  s.addText("Актуальность и цель работы", {
    x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 24, bold: true, color: C.dark,
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.85, w: 2.5, h: 0.04, fill: { color: C.accent } });

  const items = [
    { label: "Рост организации", desc: "ООО «Социальные услуги» — быстрорастущая организация" },
    { label: "Выручка 2025 г.", desc: "57 970 тыс. руб. — рост на **145,7%** к 2024 году" },
    { label: "Нагрузка на бухгалтерию", desc: "Ручное разнесение банковских выписок занимает много времени" },
    { label: "Ошибки", desc: "Ручная обработка ведёт к ошибкам и отвлекает от аналитической работы" },
    { label: "Цифровая трансформация", desc: "Автоматизация — часть цифровой трансформации и повышения конкурентоспособности" },
  ];

  items.forEach((it, i) => {
    const y = 1.2 + i * 1.0;
    s.addText(it.label, { x: 0.7, y, w: 4.5, h: 0.35, fontSize: 15, bold: true, color: C.accent });
    s.addText(it.desc, { x: 0.7, y: y + 0.35, w: 11.5, h: 0.45, fontSize: 13, color: C.gray });
  });

  // Goal box
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 6.1, w: 12.3, h: 0.65, fill: { color: C.accent }, rectRadius: 0.1,
  });
  s.addText("Цель: автоматизация бухгалтерской деятельности в сфере социальных услуг", {
    x: 0.7, y: 6.12, w: 11.9, h: 0.6, fontSize: 16, bold: true, color: C.white, align: "center",
  });
})();

// ══════════════════════════════════════════════
// SLIDE 3 — Объект, предмет, задачи
// ══════════════════════════════════════════════
(function () {
  const s = slide(pptx.addSlide());
  s.addText("Объект, предмет и задачи", {
    x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 24, bold: true, color: C.dark,
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.85, w: 2.5, h: 0.04, fill: { color: C.accent } });

  // Object & Subject
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.2, w: 5.8, h: 1.1, fill: { color: C.lightGray }, rectRadius: 0.1,
  });
  s.addText("Объект", { x: 0.7, y: 1.25, w: 2, h: 0.35, fontSize: 14, bold: true, color: C.accent });
  s.addText("Бухгалтерия ООО «Социальные услуги»", { x: 0.7, y: 1.6, w: 5.3, h: 0.5, fontSize: 13, color: C.black });

  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.8, y: 1.2, w: 6, h: 1.1, fill: { color: C.lightGray }, rectRadius: 0.1,
  });
  s.addText("Предмет", { x: 7, y: 1.25, w: 2, h: 0.35, fontSize: 14, bold: true, color: C.accent });
  s.addText("Процесс автоматизации разнесения банковских выписок", { x: 7, y: 1.6, w: 5.5, h: 0.5, fontSize: 13, color: C.black });

  // Tasks
  s.addText("Задачи (8):", { x: 0.5, y: 2.6, w: 3, h: 0.4, fontSize: 16, bold: true, color: C.dark });
  const tasks = [
    "Анализ предметной области",
    "Анализ существующих бизнес-процессов",
    "Выявление проблем текущей системы",
    "Обзор существующих решений",
    "Формирование требований к системе",
    "Обоснование проектных решений",
    "Разработка проекта автоматизации",
    "Экономическое обоснование",
  ];
  tasks.forEach((t, i) => {
    const col = i < 4 ? 0 : 1;
    const row = i % 4;
    const x = 0.6 + col * 6.2;
    const y = 3.1 + row * 0.85;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 5.9, h: 0.7, fill: { color: C.bg }, rectRadius: 0.08,
    });
    s.addText(`${i + 1}.  ${t}`, {
      x: x + 0.15, y: y + 0.1, w: 5.5, h: 0.5, fontSize: 13, color: C.black,
    });
  });
})();

// ══════════════════════════════════════════════
// SLIDE 4 — Характеристика организации
// ══════════════════════════════════════════════
(function () {
  const s = slide(pptx.addSlide());
  s.addText("Характеристика организации", {
    x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 24, bold: true, color: C.dark,
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.85, w: 2.5, h: 0.04, fill: { color: C.accent } });

  // Key facts
  const facts = [
    ["ООО «Социальные услуги»", "Москва, ИНН 7713699602"],
    ["Создана", "19.01.2010"],
    ["Сотрудников (конец 2025 г.)", "47 человек"],
    ["Доля специалистов", "68,1%"],
    ["Лицензии", "4 лицензии по 3 видам деятельности"],
    ["Основной заказчик", "Департамент труда и социальной защиты Москвы"],
  ];
  facts.forEach(([k, v], i) => {
    const y = 1.1 + i * 0.55;
    s.addText(k + ":", { x: 0.6, y, w: 4.5, h: 0.45, fontSize: 14, bold: true, color: C.accent });
    s.addText(v, { x: 5.2, y, w: 7.5, h: 0.45, fontSize: 14, color: C.black });
  });

  // Revenue structure - TABLE
  s.addText("Структура выручки:", { x: 0.5, y: 4.5, w: 5, h: 0.4, fontSize: 15, bold: true, color: C.dark });

  const rows = [
    [
      { text: "Направление", options: { bold: true, fontSize: 12, color: C.white, fill: { color: C.accent }, align: "left" } },
      { text: "Доля", options: { bold: true, fontSize: 12, color: C.white, fill: { color: C.accent }, align: "center" } },
    ],
    ["Социальное обслуживание пожилых", "67,3%"],
    ["Социально-психологические услуги", "23,1%"],
    ["Консультационные услуги", "9,6%"],
    [
      { text: "Доля государственных контрактов", options: { bold: true, fontSize: 12, color: C.white, fill: { color: C.dark }, align: "left" } },
      { text: "78,4%", options: { bold: true, fontSize: 12, color: C.white, fill: { color: C.dark }, align: "center" } },
    ],
  ];

  s.addTable(rows, {
    x: 0.5, y: 5.0, w: 8, colW: [5.5, 2.5], rowH: [0.4, 0.45, 0.45, 0.45, 0.45],
    border: { type: "solid", pt: 0.5, color: C.accent },
    fontSize: 13, color: C.black, fontFace: "Calibri",
  });
})();

// ══════════════════════════════════════════════
// SLIDE 5 — Проблема и обоснование автоматизации
// ══════════════════════════════════════════════
(function () {
  const s = slide(pptx.addSlide());
  s.addText("Проблема и обоснование автоматизации", {
    x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 24, bold: true, color: C.dark,
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.85, w: 2.5, h: 0.04, fill: { color: C.accent } });

  // Problem box
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 1.1, w: 12.3, h: 1.2, fill: { color: "FADBD8" }, rectRadius: 0.1,
  });
  s.addText("КЛЮЧЕВАЯ ПРОБЛЕМА", {
    x: 0.8, y: 1.15, w: 4, h: 0.35, fontSize: 14, bold: true, color: C.red,
  });
  s.addText("Ручное разнесение банковских выписок в 1С", {
    x: 0.8, y: 1.5, w: 11.5, h: 0.5, fontSize: 16, bold: true, color: C.black,
  });

  // Problems list
  const problems = [
    { icon: "1", text: "Неструктурированное поле «Назначение платежа» затрудняет автоматическую классификацию операций" },
    { icon: "2", text: "Высокая доля ручной работы — увеличение времени обработки" },
    { icon: "3", text: "Сложности с формированием управленческого отчёта о движении денежных средств (ДДС)" },
    { icon: "4", text: "Невозможность автоматического исключения внутренних оборотов между организациями группы" },
    { icon: "5", text: "Риск ошибок при ручном вводе реквизитов" },
  ];

  problems.forEach((p, i) => {
    const y = 2.6 + i * 0.8;
    s.addShape(pptx.ShapeType.ellipse, {
      x: 0.7, y: y + 0.08, w: 0.45, h: 0.45, fill: { color: i % 2 === 0 ? C.accent : C.dark },
    });
    s.addText(p.icon, {
      x: 0.7, y: y + 0.08, w: 0.45, h: 0.45, fontSize: 14, bold: true, color: C.white, align: "center", valign: "middle",
    });
    s.addText(p.text, { x: 1.4, y, w: 11.3, h: 0.6, fontSize: 13, color: C.black });
  });
})();

// ══════════════════════════════════════════════
// SLIDE 6 — Обзор решений и выбор стратегии
// ══════════════════════════════════════════════
(function () {
  const s = slide(pptx.addSlide());
  s.addText("Обзор решений и выбор стратегии", {
    x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 24, bold: true, color: C.dark,
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.85, w: 2.5, h: 0.04, fill: { color: C.accent } });

  const rows = [
    [
      { text: "Решение", options: { bold: true, fontSize: 12, color: C.white, fill: { color: C.accent }, align: "left" } },
      { text: "Особенности", options: { bold: true, fontSize: 12, color: C.white, fill: { color: C.accent }, align: "left" } },
      { text: "Оценка", options: { bold: true, fontSize: 12, color: C.white, fill: { color: C.accent }, align: "center" } },
    ],
    ["SOFIT Bank", "На базе Oracle, высокая интеграция. Дорогостоящий, требуется квалифицированный персонал", "Средне"],
    ["1С: Автоматизированная\nбанковская система", "Платформа 1С:Предприятие 8.3, открытый код, интеграция с существующей учётной системой", "Высоко"],
    ["RPA-автоматизация", "Программные роботы, интеграция с OCR и ML. Требует отдельной платформы управления", "Средне"],
    ["Корс-ПП", "Программа для учёта платёжных поручений. Ограниченный функционал, слабая интеграция", "Низко"],
  ];

  s.addTable(rows, {
    x: 0.5, y: 1.1, w: 12.3, colW: [3, 7, 2.3],
    border: { type: "solid", pt: 0.5, color: C.accent },
    rowH: [0.4, 0.75, 0.8, 0.75, 0.75],
    fontSize: 12, color: C.black, fontFace: "Calibri",
    autoPage: false,
  });

  // Choice box
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.5, y: 5.0, w: 12.3, h: 1.8, fill: { color: "D5F5E3" }, rectRadius: 0.1,
  });
  s.addText("ВЫБОР", { x: 0.8, y: 5.05, w: 3, h: 0.35, fontSize: 14, bold: true, color: C.green });
  s.addText("Доработка приобретённого решения «1С: Автоматизированная банковская система» штатными специалистами", {
    x: 0.8, y: 5.4, w: 11.5, h: 0.5, fontSize: 15, bold: true, color: C.black,
  });
  s.addText("Обоснование: интеграция с существующей учётной системой, открытый код для доработки, экономическая целесообразность для малой организации", {
    x: 0.8, y: 5.9, w: 11.5, h: 0.7, fontSize: 13, color: C.gray,
  });
})();

// ══════════════════════════════════════════════
// SLIDE 7 — Процесс разнесения банковской выписки
// ══════════════════════════════════════════════
(function () {
  const s = slide(pptx.addSlide());
  s.addText("Процесс разнесения банковской выписки", {
    x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 24, bold: true, color: C.dark,
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.85, w: 2.5, h: 0.04, fill: { color: C.accent } });

  const stages = [
    { num: "1", title: "Получение\nвыписки", desc: "Из интернет-банка или файлового архива" },
    { num: "2", title: "Распознавание\nи парсинг", desc: "API, SFTP, OCR;\nформаты TXT, CSV, XML, 1C" },
    { num: "3", title: "Проверка\nкорректности", desc: "Фильтрация дублей,\nвалидация данных" },
    { num: "4", title: "Сопоставление\nреквизитов", desc: "Контрагенты, договоры,\nстатьи ДДС" },
    { num: "5", title: "Формирование\nпроводок", desc: "Бухгалтерские записи,\nплатёжные поручения" },
    { num: "6", title: "Передача\nв 1С", desc: "Интеграция с учётной\nсистемой" },
    { num: "7", title: "Контроль\nкачества", desc: "Обработка\nисключений" },
    { num: "8", title: "Оповещение", desc: "Уведомление\nсотрудников" },
  ];

  stages.forEach((st, i) => {
    const x = 0.3 + i * 1.58;
    // Circle
    s.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.4, y: 1.1, w: 0.7, h: 0.7, fill: { color: i % 2 === 0 ? C.accent : C.dark },
    });
    s.addText(st.num, {
      x: x + 0.4, y: 1.1, w: 0.7, h: 0.7, fontSize: 20, bold: true, color: C.white,
      align: "center", valign: "middle",
    });
    // Arrow to next (except last)
    if (i < 7) {
      s.addText("→", {
        x: x + 1.1, y: 1.15, w: 0.5, h: 0.6, fontSize: 22, color: C.accent, align: "center",
      });
    }
    // Title
    s.addText(st.title, {
      x: x + 0.1, y: 2.0, w: 1.4, h: 0.8, fontSize: 11, bold: true, color: C.dark, align: "center",
    });
    // Description
    s.addText(st.desc, {
      x: x + 0.05, y: 2.8, w: 1.45, h: 0.7, fontSize: 9, color: C.gray, align: "center",
    });
  });

  // Detailed flow diagram at bottom with detailed info
  s.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 3.8, w: 12.3, h: 0.02, fill: { color: C.accent },
  });

  s.addText(
    "Вход:\nВыписка из банка\n(API/файл)",
    { x: 0.5, y: 4.1, w: 2.5, h: 1.0, fontSize: 11, color: C.accent, bold: true }
  );
  s.addText("→", { x: 2.9, y: 4.3, w: 0.4, h: 0.5, fontSize: 20, color: C.accent, align: "center" });

  s.addText(
    "Обработка:\nПарсинг → Проверка →\nКлассификация → Проводки",
    { x: 3.3, y: 4.1, w: 3.0, h: 1.2, fontSize: 11, color: C.dark }
  );
  s.addText("→", { x: 6.2, y: 4.3, w: 0.4, h: 0.5, fontSize: 20, color: C.accent, align: "center" });

  s.addText(
    "Выход:\n1С:Предприятие\nОтчёт ДДС",
    { x: 6.6, y: 4.1, w: 2.5, h: 1.0, fontSize: 11, color: C.accent, bold: true }
  );

  // Metrics
  s.addShape(pptx.ShapeType.roundRect, {
    x: 9.5, y: 4.0, w: 3.2, h: 2.5, fill: { color: C.bg }, rectRadius: 0.1,
  });
  s.addText("Результат обработки:", { x: 9.7, y: 4.1, w: 2.8, h: 0.4, fontSize: 11, bold: true, color: C.dark });
  s.addText("350 выписок/мес.\n46,7 часов ручной работы\n≈12 ошибок → снижение\nв ~10 раз (~1–2 ошибки)", {
    x: 9.7, y: 4.6, w: 2.8, h: 0.9, fontSize: 10, color: C.gray,
  });
  s.addText("Автомат. разнесение:\n84%", {
    x: 9.7, y: 5.5, w: 2.8, h: 0.6, fontSize: 16, bold: true, color: C.green,
  });
})();

// ══════════════════════════════════════════════
// SLIDE 8 — Информационное и программное обеспечение
// ══════════════════════════════════════════════
(function () {
  const s = slide(pptx.addSlide());
  s.addText("Информационное и программное обеспечение", {
    x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 24, bold: true, color: C.dark,
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.85, w: 2.5, h: 0.04, fill: { color: C.accent } });

  // Users
  s.addText("Пользователи системы (3 категории):", {
    x: 0.5, y: 1.1, w: 6, h: 0.4, fontSize: 16, bold: true, color: C.dark,
  });

  const users = [
    { role: "Сотрудники бухгалтерии", desc: "Работа с выписками, платежами, справочниками, отчётами" },
    { role: "Сетевой администратор / ИТ-специалист", desc: "Администрирование, пользователи, роли, резервное копирование" },
    { role: "Руководитель компании", desc: "Просмотр отчётов ДДС, выписок, платежей" },
  ];
  users.forEach((u, i) => {
    const y = 1.6 + i * 0.85;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y, w: 12.3, h: 0.7, fill: { color: C.bg }, rectRadius: 0.08,
    });
    s.addText(u.role, { x: 0.7, y: y + 0.05, w: 5.5, h: 0.3, fontSize: 14, bold: true, color: C.accent });
    s.addText(u.desc, { x: 0.7, y: y + 0.35, w: 11.8, h: 0.3, fontSize: 12, color: C.gray });
  });

  // Tech stack table
  s.addText("Технологический стек:", {
    x: 0.5, y: 4.25, w: 6, h: 0.4, fontSize: 16, bold: true, color: C.dark,
  });

  const techRows = [
    [
      { text: "Слой", options: { bold: true, fontSize: 12, color: C.white, fill: { color: C.accent }, align: "left" } },
      { text: "Технологии", options: { bold: true, fontSize: 12, color: C.white, fill: { color: C.accent }, align: "left" } },
    ],
    ["Фронтенд", "React 18, TypeScript, Vite 6, React Router 6"],
    ["Бэкенд", "Express 4, TypeScript"],
    ["База данных", "SQLite (better-sqlite3); целевая — MySQL"],
    ["Парсер выписок", "1CClientBankExchange v1.03, TXT (CSV), XML"],
    ["API-моки (dev)", "MSW 2 (Mock Service Worker)"],
  ];

  s.addTable(techRows, {
    x: 0.5, y: 4.7, w: 12.3, colW: [3, 9.3],
    border: { type: "solid", pt: 0.5, color: C.accent },
    fontSize: 12, color: C.black, fontFace: "Calibri",
  });
})();

// ══════════════════════════════════════════════
// SLIDE 9 — Функционал системы (со скриншотами)
// ══════════════════════════════════════════════
(function () {
  const s = slide(pptx.addSlide());
  s.addText("Функционал системы", {
    x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 24, bold: true, color: C.dark,
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.85, w: 2.5, h: 0.04, fill: { color: C.accent } });

  // Left column — feature list
  const features = [
    "Загрузка банковских выписок (1C, TXT, CSV, XML)",
    "Платёжные операции: просмотр, фильтрация, классификация",
    "Справочники: контрагенты, банки, статьи ДДС, договоры",
    "Отчёт ДДС с экспортом в Excel (CSV)",
    "Журнал ошибок с управлением статусами",
    "Интеграция с 1С:Предприятие (импорт/экспорт)",
    "Администрирование: пользователи, роли, резервное копирование",
    "Журнал действий (аудит операций)",
  ];

  features.forEach((f, i) => {
    const y = 1.1 + i * 0.68;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 0.5, y, w: 0.35, h: 0.35, fill: { color: C.accent }, rectRadius: 0.05,
    });
    s.addText(`${i + 1}`, {
      x: 0.5, y, w: 0.35, h: 0.35, fontSize: 13, bold: true, color: C.white,
      align: "center", valign: "middle",
    });
    s.addText(f, { x: 1.0, y, w: 5.8, h: 0.55, fontSize: 12, color: C.black });
  });

  // Right column — 2 large screenshots (improved readability)
  const shots = [
    { file: "03_payments.png", alt: "23-payments-filtered.png", label: "Платёжные операции", y: 1.1 },
    { file: "05_reports.png", alt: "07-reports.png", label: "Отчёт ДДС", y: 3.75 },
  ];

  shots.forEach((sh) => {
    const imageY = sh.y + 0.35;
    let p = img(sh.file);
    if (!p) p = img(sh.alt);
    s.addShape(pptx.ShapeType.roundRect, {
      x: 6.8, y: sh.y, w: 6.0, h: 2.35, fill: { color: C.bg }, rectRadius: 0.08,
    });
    s.addText(sh.label, {
      x: 6.8, y: sh.y + 0.01, w: 6.0, h: 0.32, fontSize: 11, bold: true, color: C.accent, align: "center",
    });
    if (p) {
      s.addImage({ path: p, x: 6.9, y: imageY, w: 5.8, h: 1.95, sizing: { type: "contain", w: 5.8, h: 1.95 } });
    } else {
      s.addText(`[Скриншот не найден]`, {
        x: 6.9, y: imageY, w: 5.8, h: 1.95, fontSize: 10, color: C.gray, align: "center", valign: "middle",
      });
    }
  });
})();

// ══════════════════════════════════════════════
// SLIDE 10 — Апробация (со скриншотами)
// ══════════════════════════════════════════════
(function () {
  const s = slide(pptx.addSlide());
  s.addText("Апробация и тестирование", {
    x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 24, bold: true, color: C.dark,
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.85, w: 2.5, h: 0.04, fill: { color: C.accent } });

  // Testing steps
  s.addText("Пилотное тестирование:", {
    x: 0.5, y: 1.1, w: 6, h: 0.4, fontSize: 16, bold: true, color: C.dark,
  });

  const steps = [
    "Проверена административная часть системы",
    "Заполнены карточки организации, контрагента и платёжные реквизиты",
    "Добавлен новый контрагент",
    "Проведён тестовый платёж партнёру АО «Флант»",
    "Сгенерирован файл транзакции",
  ];
  steps.forEach((st, i) => {
    const y = 1.6 + i * 0.55;
    s.addText(`✓  ${st}`, {
      x: 0.6, y, w: 7, h: 0.45, fontSize: 13, color: C.black,
    });
  });

  // Right — screenshot of payment create
  const p1 = img("10_payment_create.png");
  if (p1) {
    s.addImage({ path: p1, x: 7.5, y: 1.1, w: 5.2, h: 2.8, sizing: { type: "contain", w: 5.2, h: 2.8 } });
  }

  // Results
  s.addText("Результаты тестирования:", {
    x: 0.5, y: 4.5, w: 6, h: 0.4, fontSize: 16, bold: true, color: C.dark,
  });

  const results = [
    "Сокращён объём ручных операций",
    "Повышена точность и скорость разнесения данных",
    "Снижена нагрузка на бухгалтеров",
    "Система устойчиво обрабатывает до 2 000 выписок",
    "Среднее время на выписку — 1,65 сек.",
    "Доля автоматического разнесения — 84%",
  ];
  results.forEach((r, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i % 3;
    const x = 0.5 + col * 6.2;
    const y = 5.0 + row * 0.55;
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 5.9, h: 0.45, fill: { color: C.lightGray }, rectRadius: 0.05,
    });
    s.addText(`✓  ${r}`, { x: x + 0.1, y, w: 5.7, h: 0.45, fontSize: 12, color: C.black, valign: "middle" });
  });
})();

// ══════════════════════════════════════════════
// SLIDE 11 — Экономическая эффективность
// ══════════════════════════════════════════════
(function () {
  const s = slide(pptx.addSlide());
  s.addText("Экономическая эффективность", {
    x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 24, bold: true, color: C.dark,
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0.85, w: 2.5, h: 0.04, fill: { color: C.accent } });

  // Main metrics table (left)
  const rows = [
    [
      { text: "Показатель", options: { bold: true, fontSize: 12, color: C.white, fill: { color: C.accent }, align: "left" } },
      { text: "Значение", options: { bold: true, fontSize: 12, color: C.white, fill: { color: C.accent }, align: "center" } },
    ],
    ["Капитальные вложения на проектирование (Кп)", "253 812,69 руб."],
    ["Суммарные затраты на разработку (Кп + Ко)", "268 812,69 руб."],
    ["Годовая экономия (ΔС)", "450 000 руб."],
    ["Годовой экон. эффект (Эг = ΔС − Кп × Ен)", "425 950,80 руб."],
    ["Срок окупаемости (Ток = Эг / ΔС)", "0,9 года ≈ 1 месяц"],
    ["Коэфф. экон. эффективности (Ер)", "2,38"],
    [
      { text: "NPV за 5 лет (ставка 15%)", options: { bold: true, fontSize: 12, color: C.white, fill: { color: C.dark }, align: "left" } },
      { text: "1 239 660 руб.", options: { bold: true, fontSize: 12, color: C.white, fill: { color: C.dark }, align: "center" } },
    ],
  ];

  s.addTable(rows, {
    x: 0.5, y: 1.1, w: 7.3, colW: [4.5, 2.8],
    border: { type: "solid", pt: 0.5, color: C.accent },
    fontSize: 11, color: C.black, fontFace: "Calibri",
  });

  // ΔС breakdown table (right)
  s.addText("Обоснование годовой экономии (ΔС):", {
    x: 8.1, y: 1.1, w: 4.8, h: 0.35, fontSize: 13, bold: true, color: C.dark,
  });

  const savingRows = [
    [
      { text: "Статья экономии", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.accent }, align: "left" } },
      { text: "Сумма, руб.", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.accent }, align: "center" } },
    ],
    ["Сокращение трудозатрат бухгалтерии (37,95 ч/мес. × 12 мес. × 800 руб./ч)", "364 320"],
    ["Снижение стоимости ошибок (10 опл./мес. × 12 мес. × 500 руб.)", "60 000"],
    ["Снижение штрафов и пеней (экспертная оценка)", "25 680"],
    [
      { text: "ИТОГО ΔС", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.dark }, align: "left" } },
      { text: "450 000", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.dark }, align: "center" } },
    ],
  ];

  s.addTable(savingRows, {
    x: 8.1, y: 1.5, w: 4.8, colW: [3.3, 1.5],
    border: { type: "solid", pt: 0.5, color: C.accent },
    fontSize: 9, color: C.black, fontFace: "Calibri",
  });

  // Labor and NPV schedule
  s.addText("Трудоёмкость и NPV:", {
    x: 0.5, y: 4.7, w: 6, h: 0.35, fontSize: 13, bold: true, color: C.dark,
  });

  const laborRows = [
    ["Исполнитель", "Дней"],
    ["Руководитель", "16"],
    ["Программист", "78"],
    ["Общая продолж-ть", "78 дн."],
  ];

  const laborTblOpts = {
    x: 0.5, y: 5.05, w: 4.5, colW: [3.0, 1.5],
    border: { type: "solid", pt: 0.5, color: C.accent },
    fontSize: 10, color: C.black, fontFace: "Calibri",
  };

  const laborHeader = [
    [
      { text: "Исполнитель", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.accent }, align: "left" } },
      { text: "Дней", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.accent }, align: "center" } },
    ],
    ["Руководитель", "16"],
    ["Программист", "78"],
    [
      { text: "Общая продолж-ть", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.dark }, align: "left" } },
      { text: "78 дн.", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.dark }, align: "center" } },
    ],
  ];

  s.addTable(laborHeader, {
    x: 0.5, y: 5.05, w: 4.5, colW: [3.0, 1.5],
    border: { type: "solid", pt: 0.5, color: C.accent },
    fontSize: 10, color: C.black, fontFace: "Calibri",
  });

  // NPV mini-table
  const npvRows = [
    [
      { text: "Год", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.accent }, align: "center" } },
      { text: "Ден. поток", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.accent }, align: "right" } },
      { text: "NPV накопл.", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.accent }, align: "right" } },
    ],
    ["0", "−268 813", "−268 813"],
    ["1", "391 304", "122 492"],
    ["2", "340 266", "462 757"],
    ["3", "295 883", "758 640"],
    ["4", "257 290", "1 015 930"],
    [
      { text: "5", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.dark }, align: "center" } },
      { text: "223 730", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.dark }, align: "right" } },
      { text: "1 239 660", options: { bold: true, fontSize: 10, color: C.white, fill: { color: C.dark }, align: "right" } },
    ],
  ];

  s.addTable(npvRows, {
    x: 5.4, y: 5.05, w: 7.4, colW: [0.7, 3.35, 3.35],
    border: { type: "solid", pt: 0.5, color: C.accent },
    fontSize: 10, color: C.black, fontFace: "Calibri",
  });

  // Conclusion box
  s.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 6.5, w: 12.3, h: 0.35, fill: { color: "D5F5E3" },
  });
  s.addText("Вывод: проект экономически эффективен. Ток ≈ 1 мес. < Тнорм (5 лет), Ер = 2,38 > 0,15. Внедрение целесообразно.", {
    x: 0.7, y: 6.5, w: 11.9, h: 0.35, fontSize: 11, bold: true, color: C.green,
  });
})();

// ══════════════════════════════════════════════
// SLIDE 12 — Результаты, перспективы, заключение
// ══════════════════════════════════════════════
(function () {
  const s = slide(pptx.addSlide());
  s.background = { color: C.dark };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.08, fill: { color: C.accent } });

  s.addText("Результаты и перспективы", {
    x: 0.5, y: 0.3, w: 12, h: 0.6, fontSize: 24, bold: true, color: C.white,
  });

  // Results
  s.addText("Результаты работы:", {
    x: 0.7, y: 1.1, w: 6, h: 0.4, fontSize: 16, bold: true, color: C.accent2,
  });
  const results = [
    "Проведён анализ предметной области",
    "Разработан проект автоматизации банковских операций",
    "Реализовано веб-приложение с полным циклом обработки выписок",
    "Выполнено экономическое обоснование",
    "Система протестирована (пилотное тестирование)",
    "Сокращён объём ручных операций, снижена нагрузка на бухгалтеров",
  ];
  results.forEach((r, i) => {
    s.addText(`✓  ${r}`, {
      x: 0.7, y: 1.55 + i * 0.42, w: 5.8, h: 0.38, fontSize: 12, color: C.lightGray,
    });
  });

  // Perspectives
  s.addText("Перспективы развития:", {
    x: 7, y: 1.1, w: 6, h: 0.4, fontSize: 16, bold: true, color: C.accent2,
  });
  const persp = [
    "Интеграция с системой электронного документооборота (ЭДО)",
    "Применение машинного обучения для классификации неструктурированных назначений платежа",
    "Расширение отчётности",
    "Масштабирование на другие организации группы",
    "Миграция на PostgreSQL при росте объёмов данных",
  ];
  persp.forEach((p, i) => {
    s.addText(`→  ${p}`, {
      x: 7, y: 1.55 + i * 0.42, w: 5.8, h: 0.38, fontSize: 12, color: C.lightGray,
    });
  });

  s.addShape(pptx.ShapeType.rect, { x: 1, y: 4.3, w: 11.3, h: 0.02, fill: { color: C.accent } });

  // Conclusion
  s.addText("ЗАКЛЮЧЕНИЕ", {
    x: 1, y: 4.6, w: 11.3, h: 0.5, fontSize: 18, bold: true, color: C.white, align: "center",
  });
  s.addText(
    "Цель работы достигнута — разработан теоретически обоснованный и практически применимый подход к автоматизации разнесения банковских выписок. Результаты могут быть использованы в ООО «Социальные услуги» и адаптированы для других организаций социальной сферы.",
    {
      x: 1, y: 5.1, w: 11.3, h: 0.9, fontSize: 14, color: C.lightGray, align: "center",
    }
  );

  // Thank you
  s.addText("Спасибо за внимание!", {
    x: 1, y: 6.2, w: 11.3, h: 0.6, fontSize: 28, bold: true, color: C.accent2, align: "center",
  });
  s.addText("Готов ответить на ваши вопросы", {
    x: 1, y: 6.7, w: 11.3, h: 0.4, fontSize: 14, color: C.lightGray, align: "center",
  });
})();

// ── Generate ──
pptx.writeFile({ fileName: OUTPUT }).then(() => {
  console.log("Presentation created:", OUTPUT);
}).catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
