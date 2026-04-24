/**
 * Sinonin Ledger — read endpoint (v2)
 * -------------------------------------------------------------
 * Publishes the Sinonin Ledger workbook as a read-only JSON API.
 * Serves the PWA's read layer: fetched on app open and every
 * 60s; merged with local storage using cloud-authoritative rules.
 *
 * Deploy: Extensions → Apps Script → replace all code with this
 * file → Deploy → Manage deployments → select existing deployment
 * → pencil icon → Version: New version → Deploy. This updates the
 * EXISTING URL, so the PWA config doesn't need to change.
 *
 * If you instead choose "New deployment", Google issues a new
 * URL and you must tell Dr. Cheison so the PWA can be updated.
 *
 * Query parameter:
 *   ?since=YYYY-MM-DD     Only returns rows with date >= since.
 *                         PWA uses this for incremental fetches.
 */

const CONFIG = {
  pluckerSheet:    'Plucker Records',
  actualsSheet:    'Actual Kgs Delivered',
  expensesSheet:   'Sinonin Expenses',
  expensesHistory: 'Expenses_History',
  bankedSheet:     'Banked Income',
  poultrySheet:    'Poultry Sales',

  pluckerMap: {
    timestamp: 'Timestamp',
    date:      'Date',
    block:     'Block',
    plucker:   'Name',
    kg:        'Qty Plucked',
    factory:   'Factory Delivered'
  },

  actualsMap: {
    timestamp: 'Timestamp',
    date:      'Date',
    factory:   'Factory',
    block:     'Block',
    kg:        'Actual Kg Delivered'
  },

  expenseMap: {
    timestamp:   'Timestamp',
    date:        'Date',
    tier:        'Tier',
    category:    'Category',
    description: 'Description',
    amount:      'Amount (Ksh)',
    block:       'Block',
    payee:       'Paid to'
  },

  bankedMap: {
    timestamp: 'Timestamp',
    date:      'Date',
    business:  'Business',
    source:    'Source',
    amount:    'Amount (Ksh)',
    period:    'For period',
    reference: 'Reference / Notes'
  },

  poultryMap: {
    timestamp: 'Timestamp',
    date:      'Date',
    product:   'Product',
    unit:      'Unit',
    quantity:  'Quantity',
    amount:    'Amount (Ksh)',
    buyer:     'Buyer',
    notes:     'Notes'
  }
};

function doGet(e) {
  const sinceParam = (e && e.parameter && e.parameter.since) || null;
  const since = sinceParam && /^\d{4}-\d{2}-\d{2}$/.test(sinceParam) ? sinceParam : null;

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const payload = {
    ok:          true,
    generatedAt: new Date().toISOString(),
    since:       since,
    pluckers:    safely(() => readPluckers(ss, since)),
    actuals:     safely(() => readActuals(ss, since)),
    expenses:    safely(() => readExpenses(ss, since)),
    banked:      safely(() => readBanked(ss, since)),
    poultry:     safely(() => readPoultry(ss, since))
  };

  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function readPluckers(ss, since) {
  const rows = sheetToObjects(ss, CONFIG.pluckerSheet);
  const map = CONFIG.pluckerMap;
  return rows
    .map(r => ({
      type:      'plucker',
      timestamp: clean(r[map.timestamp]),
      date:      normaliseDate(r[map.date]),
      block:     clean(r[map.block]),
      plucker:   clean(r[map.plucker]),
      kg:        toNumber(r[map.kg]),
      factory:   clean(r[map.factory])
    }))
    .filter(r => r.date && r.kg > 0)
    .filter(r => !since || r.date >= since);
}

function readActuals(ss, since) {
  const rows = sheetToObjects(ss, CONFIG.actualsSheet);
  const map = CONFIG.actualsMap;
  return rows
    .map(r => ({
      type:      'actual',
      timestamp: clean(r[map.timestamp]),
      date:      normaliseDate(r[map.date]),
      factory:   clean(r[map.factory]),
      block:     clean(r[map.block]),
      kg:        toNumber(r[map.kg])
    }))
    .filter(r => r.date && r.kg > 0)
    .filter(r => !since || r.date >= since);
}

function readExpenses(ss, since) {
  const map = CONFIG.expenseMap;
  const mapRow = (source) => (r) => ({
    type:        'expense',
    timestamp:   clean(r[map.timestamp]),
    date:        normaliseDate(r[map.date]),
    tier:        clean(r[map.tier]),
    category:    clean(r[map.category]),
    description: clean(r[map.description]),
    amount:      toNumber(r[map.amount]),
    block:       clean(r[map.block]),
    payee:       clean(r[map.payee]),
    source:      source
  });
  const live    = sheetToObjects(ss, CONFIG.expensesSheet).map(mapRow('live'));
  const history = sheetToObjects(ss, CONFIG.expensesHistory).map(mapRow('history'));
  return live.concat(history)
    .filter(r => r.date && r.amount > 0)
    .filter(r => !since || r.date >= since);
}

function readBanked(ss, since) {
  const rows = sheetToObjects(ss, CONFIG.bankedSheet);
  const map = CONFIG.bankedMap;
  return rows
    .map(r => ({
      type:      'banked',
      timestamp: clean(r[map.timestamp]),
      date:      normaliseDate(r[map.date]),
      business:  clean(r[map.business]),
      source:    clean(r[map.source]),
      amount:    toNumber(r[map.amount]),
      period:    clean(r[map.period]),
      reference: clean(r[map.reference])
    }))
    .filter(r => r.date && r.amount > 0)
    .filter(r => !since || r.date >= since);
}

function readPoultry(ss, since) {
  const rows = sheetToObjects(ss, CONFIG.poultrySheet);
  const map = CONFIG.poultryMap;
  return rows
    .map(r => ({
      type:      'poultry',
      timestamp: clean(r[map.timestamp]),
      date:      normaliseDate(r[map.date]),
      product:   clean(r[map.product]),
      unit:      clean(r[map.unit]),
      quantity:  toNumber(r[map.quantity]),
      amount:    toNumber(r[map.amount]),
      buyer:     clean(r[map.buyer]),
      notes:     clean(r[map.notes])
    }))
    .filter(r => r.date && r.amount > 0)
    .filter(r => !since || r.date >= since);
}

/**
 * Helpers — unchanged from v1
 */

function sheetToObjects(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    Logger.log('Sheet not found: ' + sheetName);
    return [];
  }
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => String(h).trim());
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function safely(fn) {
  try {
    return fn();
  } catch (err) {
    Logger.log('Read failed: ' + err);
    return [];
  }
}

function clean(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;
  if (typeof value === 'number') return value;
  const cleaned = String(value).replace(/,/g, '').replace(/[^\d.\-]/g, '');
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}

function normaliseDate(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  const match = text.match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{4})/);
  if (match) {
    const day   = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    const year  = match[3];
    return year + '-' + month + '-' + day;
  }
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    return iso[1] + '-' + iso[2].padStart(2, '0') + '-' + iso[3].padStart(2, '0');
  }
  return '';
}
