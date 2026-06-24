var BankStatementParser = (function() {
  'use strict';

  function parse1CClientBankExchange(text) {
    var lines = text.split(/\r?\n/);
    var result = { header: {}, documents: [] };
    var currentDoc = null;
    var inDocument = false;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;

      if (!inDocument) {
        if (line === '1CClientBankExchange') continue;
        if (line === 'СекцияДокумент=Платежное поручение' || line === 'СекцияДокумент=Платежный ордер') {
          inDocument = true;
          currentDoc = {};
          continue;
        }
        var eqIdx = line.indexOf('=');
        if (eqIdx > 0) {
          var key = line.substring(0, eqIdx).trim();
          var value = line.substring(eqIdx + 1).trim();
          result.header[key] = value;
        }
      } else {
        if (line === 'КонецДокумента') {
          if (currentDoc) result.documents.push(currentDoc);
          currentDoc = null;
          inDocument = false;
          continue;
        }
        var eqIdx = line.indexOf('=');
        if (eqIdx > 0) {
          var key = line.substring(0, eqIdx).trim();
          var value = line.substring(eqIdx + 1).trim();
          currentDoc[key] = value;
        }
      }
    }
    return result;
  }

  function parseTXT(text) {
    var lines = text.split(/\r?\n/);
    var documents = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      if (line.startsWith('#') || line.startsWith('//')) continue;

      var parts = line.split(';');
      if (parts.length < 5) continue;

      documents.push({
        'Номер': parts[0] || '',
        'Дата': parts[1] || '',
        'Сумма': parts[2] || '0',
        'Плательщик': parts[3] || '',
        'Получатель': parts[4] || '',
        'НазначениеПлатежа': parts[5] || '',
        'ПлательщикИНН': parts[6] || '',
        'ПолучательИНН': parts[7] || '',
        'ПлательщикСчет': parts[8] || '',
        'ПолучательСчет': parts[9] || ''
      });
    }
    return { header: {}, documents: documents };
  }

  function parseXML(xmlText) {
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    var documents = [];
    var docElements = xmlDoc.getElementsByTagName('Документ');

    for (var i = 0; i < docElements.length; i++) {
      var el = docElements[i];
      documents.push({
        'Номер': getTagValue(el, 'Номер'),
        'Дата': getTagValue(el, 'Дата'),
        'Сумма': getTagValue(el, 'Сумма'),
        'Плательщик': getTagValue(el, 'Плательщик'),
        'Получатель': getTagValue(el, 'Получатель'),
        'НазначениеПлатежа': getTagValue(el, 'НазначениеПлатежа'),
        'ПлательщикИНН': getTagValue(el, 'ПлательщикИНН'),
        'ПолучательИНН': getTagValue(el, 'ПолучательИНН'),
        'ПлательщикСчет': getTagValue(el, 'ПлательщикСчет'),
        'ПолучательСчет': getTagValue(el, 'ПолучательСчет')
      });
    }
    return { header: {}, documents: documents };
  }

  function getTagValue(parent, tagName) {
    var el = parent.getElementsByTagName(tagName)[0];
    return el ? el.textContent.trim() : '';
  }

  function detectAndParse(text, filename) {
    text = text.trim();
    var ext = (filename || '').split('.').pop().toLowerCase();

    if (text.startsWith('1CClientBankExchange') || ext === '1c') {
      return parse1CClientBankExchange(text);
    }
    if (ext === 'txt' || text.indexOf(';') > 0) {
      return parseTXT(text);
    }
    if (ext === 'xml' || text.startsWith('<?xml') || text.startsWith('<')) {
      return parseXML(text);
    }
    return parseTXT(text);
  }

  function extractINN(text) {
    if (!text) return '';
    var m = text.match(/\b(\d{10}|\d{12})\b/);
    return m ? m[1] : '';
  }

  function extractName(text, inn) {
    if (!text) return '';
    var cleaned = text;
    if (inn) cleaned = cleaned.replace(inn, '').trim();
    cleaned = cleaned.replace(/^ИНН\s*/i, '').trim();
    cleaned = cleaned.replace(/["«»]/g, '"').replace(/\s+/g, ' ').trim();
    return cleaned;
  }

  function normalizeAmount(val) {
    if (!val) return 0;
    var s = String(val).replace(/[^-0-9.,]/g, '').replace(',', '.').replace(/\s/g, '');
    var parsed = parseFloat(s);
    return isNaN(parsed) ? 0 : parsed;
  }

  function normalizeDate(val) {
    if (!val) return '';
    return val.replace(/[^\d.]/g, '').trim();
  }

  return {
    parse1C: parse1CClientBankExchange,
    parseTXT: parseTXT,
    parseXML: parseXML,
    detectAndParse: detectAndParse,
    extractINN: extractINN,
    extractName: extractName,
    normalizeAmount: normalizeAmount,
    normalizeDate: normalizeDate
  };
})();
