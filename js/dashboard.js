/* ===========================
   dashboard.js — Converter + Arithmetic
   =========================== */

// ══════════════════════════════════════════════
// CONVERSION DATA
// ══════════════════════════════════════════════
const TYPES = {
  length: {
    label: 'Length',
    units: ['Metres', 'Centimetres', 'Kilometres', 'Miles', 'Yards', 'Feet', 'Inches', 'Millimetres'],
    toBase: {
      'Metres': 1, 'Centimetres': 0.01, 'Kilometres': 1000,
      'Miles': 1609.344, 'Yards': 0.9144, 'Feet': 0.3048,
      'Inches': 0.0254, 'Millimetres': 0.001
    },
    convert(val, from, to) {
      return (val * this.toBase[from]) / this.toBase[to];
    }
  },

  temperature: {
    label: 'Temperature',
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
    convert(val, from, to) {
      let c;
      if (from === 'Celsius')    c = val;
      if (from === 'Fahrenheit') c = (val - 32) * 5 / 9;
      if (from === 'Kelvin')     c = val - 273.15;
      if (to === 'Celsius')    return c;
      if (to === 'Fahrenheit') return c * 9 / 5 + 32;
      if (to === 'Kelvin')     return c + 273.15;
    }
  },

  volume: {
    label: 'Volume',
    units: ['Litres', 'Millilitres', 'Cubic Metres', 'Gallons (US)', 'Gallons (UK)', 'Fluid Ounces', 'Cups', 'Tablespoons'],
    toBase: {
      'Litres': 1, 'Millilitres': 0.001, 'Cubic Metres': 1000,
      'Gallons (US)': 3.78541, 'Gallons (UK)': 4.54609,
      'Fluid Ounces': 0.0295735, 'Cups': 0.236588, 'Tablespoons': 0.0147868
    },
    convert(val, from, to) {
      return (val * this.toBase[from]) / this.toBase[to];
    }
  },

  weight: {
    label: 'Weight',
    units: ['Kilograms', 'Grams', 'Milligrams', 'Metric Tonnes', 'Pounds', 'Ounces', 'Stone', 'Carats'],
    toBase: {
      'Kilograms': 1, 'Grams': 0.001, 'Milligrams': 0.000001,
      'Metric Tonnes': 1000, 'Pounds': 0.453592, 'Ounces': 0.0283495,
      'Stone': 6.35029, 'Carats': 0.0002
    },
    convert(val, from, to) {
      return (val * this.toBase[from]) / this.toBase[to];
    }
  }
};

// ══════════════════════════════════════════════
// ARITHMETIC OPERATIONS
//
// Strategy: convert both values to the base unit,
// perform the operation in base, then convert
// the result to the chosen result unit.
//
// For multiply / divide the second operand is
// treated as a SCALAR (dimensionless) because
// multiplying e.g. 5 m × 3 m = 15 m² (different
// dimension) is not meaningful here. We therefore
// multiply/divide the first quantity's value by
// the numeric value of B (already in base units).
//
// Temperature arithmetic is blocked entirely.
// ══════════════════════════════════════════════
const OPERATIONS = {
  add: {
    symbol: '+',
    label:  'Add',
    // A (in base) + B (in base) → result in base
    calculate(aBase, bBase) { return aBase + bBase; },
    description(aVal, aUnit, bVal, bUnit, resVal, resUnit) {
      return `${aVal} ${aUnit}  +  ${bVal} ${bUnit}  =  ${resVal} ${resUnit}`;
    }
  },
  subtract: {
    symbol: '−',
    label:  'Subtract',
    calculate(aBase, bBase) { return aBase - bBase; },
    description(aVal, aUnit, bVal, bUnit, resVal, resUnit) {
      return `${aVal} ${aUnit}  −  ${bVal} ${bUnit}  =  ${resVal} ${resUnit}`;
    }
  },
  multiply: {
    symbol: '×',
    label:  'Multiply',
    // Multiply quantity A by scalar B (value in base)
    calculate(aBase, bBase) { return aBase * bBase; },
    description(aVal, aUnit, bVal, bUnit, resVal, resUnit) {
      return `${aVal} ${aUnit}  ×  ${bVal} ${bUnit}  =  ${resVal} ${resUnit}`;
    }
  },
  divide: {
    symbol: '÷',
    label:  'Divide',
    calculate(aBase, bBase) {
      if (bBase === 0) return NaN;   // division by zero
      return aBase / bBase;
    },
    description(aVal, aUnit, bVal, bUnit, resVal, resUnit) {
      return `${aVal} ${aUnit}  ÷  ${bVal} ${bUnit}  =  ${resVal} ${resUnit}`;
    }
  }
};

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════
let currentType      = 'length';
let currentOperation = 'convert';
let history          = JSON.parse(localStorage.getItem('quanment_history') || '[]');

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function () {
  loadSession();
  populateUnits();
  updateOperationUI();
});

// ══════════════════════════════════════════════
// SESSION
// ══════════════════════════════════════════════
function loadSession() {
  const session = JSON.parse(localStorage.getItem('quanment_session') || 'null');
  if (!session) { window.location.href = 'index.html'; return; }
  const navUser = document.getElementById('navUser');
  if (navUser) navUser.textContent = session.initials || 'U';
}

function handleLogout() {
  localStorage.removeItem('quanment_session');
  window.location.href = 'index.html';
}

// ══════════════════════════════════════════════
// TYPE SELECTION
// ══════════════════════════════════════════════
function setType(type, el) {
  currentType = type;

  // Update active card
  document.querySelectorAll('.type-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  // Disable arithmetic ops for temperature
  const opCards = document.querySelectorAll('.op-card');
  if (type === 'temperature') {
    opCards.forEach(c => {
      const op = c.dataset.op;
      if (op && op !== 'convert') c.classList.add('disabled');
    });
    // Force back to convert
    if (currentOperation !== 'convert') {
      setOperation('convert', document.querySelector('.op-card[data-op="convert"]'));
      return; // setOperation calls populateUnits + updateOperationUI
    }
  } else {
    opCards.forEach(c => c.classList.remove('disabled'));
  }

  populateUnits();
  updateOperationUI();
  resetResults();
}

// ══════════════════════════════════════════════
// OPERATION SELECTION
// ══════════════════════════════════════════════
function setOperation(op, el) {
  // Block arithmetic for temperature
  if (currentType === 'temperature' && op !== 'convert') {
    showTempWarning(true);
    return;
  }

  currentOperation = op;

  document.querySelectorAll('.op-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');

  updateOperationUI();
  resetResults();
  liveConvert();
}

// ══════════════════════════════════════════════
// UPDATE UI: switch between convert / arith panels
// ══════════════════════════════════════════════
function updateOperationUI() {
  const isConvert     = currentOperation === 'convert';
  const isTempArith   = currentType === 'temperature' && !isConvert;

  document.getElementById('convertPanel').style.display    = isConvert  ? 'block' : 'none';
  document.getElementById('arithmeticPanel').style.display = !isConvert ? 'block' : 'none';

  showTempWarning(isTempArith);

  if (!isConvert) {
    // Update operator badge
    const op = OPERATIONS[currentOperation];
    document.getElementById('opBadge').textContent = op.symbol;

    // Update title
    document.getElementById('arithTitle').textContent =
      `${op.label} two ${TYPES[currentType].label.toLowerCase()} values`;

    // Populate arithmetic unit dropdowns
    populateArithUnits();
    liveArith();
  }
}

function showTempWarning(show) {
  const w = document.getElementById('tempWarning');
  if (show) w.classList.add('show');
  else      w.classList.remove('show');
}

// ══════════════════════════════════════════════
// POPULATE UNIT DROPDOWNS
// ══════════════════════════════════════════════
function populateUnits() {
  const units = TYPES[currentType].units;

  ['fromUnit', 'toUnit'].forEach((id, i) => {
    const sel = document.getElementById(id);
    sel.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    sel.selectedIndex = i === 0 ? 0 : 1;
  });

  document.getElementById('fromVal').value = '1';
  document.getElementById('toVal').value   = '';
  liveConvert();
}

function populateArithUnits() {
  const units = TYPES[currentType].units;

  ['arithUnitA', 'arithUnitB', 'arithUnitResult'].forEach((id, i) => {
    const sel = document.getElementById(id);
    sel.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join('');
    sel.selectedIndex = 0;
  });

  document.getElementById('arithValA').value = '1';
  document.getElementById('arithValB').value = '1';
  document.getElementById('arithResult').value = '';
}

// ══════════════════════════════════════════════
// FORMAT NUMBER
// ══════════════════════════════════════════════
function formatNum(n) {
  if (isNaN(n) || !isFinite(n)) return '—';
  if (Math.abs(n) >= 1e9 || (Math.abs(n) < 0.0001 && n !== 0)) {
    return n.toExponential(4);
  }
  return parseFloat(n.toPrecision(8)).toString();
}

// ══════════════════════════════════════════════
// LIVE CONVERT (standard conversion)
// ══════════════════════════════════════════════
function liveConvert() {
  if (currentOperation !== 'convert') return;
  const val   = parseFloat(document.getElementById('fromVal').value);
  const fromU = document.getElementById('fromUnit').value;
  const toU   = document.getElementById('toUnit').value;

  if (isNaN(val)) { document.getElementById('toVal').value = ''; return; }
  const result = TYPES[currentType].convert(val, fromU, toU);
  document.getElementById('toVal').value = formatNum(result);
}

// ══════════════════════════════════════════════
// LIVE ARITHMETIC
// ══════════════════════════════════════════════
function liveArith() {
  if (currentOperation === 'convert') return;

  const valA   = parseFloat(document.getElementById('arithValA').value);
  const valB   = parseFloat(document.getElementById('arithValB').value);
  const unitA  = document.getElementById('arithUnitA').value;
  const unitB  = document.getElementById('arithUnitB').value;
  const unitR  = document.getElementById('arithUnitResult').value;

  if (isNaN(valA) || isNaN(valB)) {
    document.getElementById('arithResult').value = '';
    return;
  }

  const resultBase = computeArith(valA, unitA, valB, unitB);
  if (isNaN(resultBase)) {
    document.getElementById('arithResult').value = 'Error';
    return;
  }

  // Convert result from base unit to chosen result unit
  const typeObj = TYPES[currentType];
  const resultInUnit = resultBase / typeObj.toBase[unitR];
  document.getElementById('arithResult').value = formatNum(resultInUnit);
}

// Core arithmetic in base units
function computeArith(valA, unitA, valB, unitB) {
  const typeObj = TYPES[currentType];
  const baseA   = valA * typeObj.toBase[unitA];
  const baseB   = valB * typeObj.toBase[unitB];
  return OPERATIONS[currentOperation].calculate(baseA, baseB);
}

// ══════════════════════════════════════════════
// CONVERT BUTTON (standard)
// ══════════════════════════════════════════════
function doConvert() {
  const val   = parseFloat(document.getElementById('fromVal').value);
  const fromU = document.getElementById('fromUnit').value;
  const toU   = document.getElementById('toUnit').value;
  if (isNaN(val)) return;

  const result    = TYPES[currentType].convert(val, fromU, toU);
  const formatted = formatNum(result);

  showResultBox('convertResultBox', formatted + ' ' + toU,
    `${val} ${fromU}  =  ${formatted} ${toU}`);

  saveHistory({
    expr:   `${val} ${fromU}  →  ${toU}`,
    result: formatted + ' ' + toU,
    op:     'convert',
    type:   currentType
  });
}

// ══════════════════════════════════════════════
// ARITHMETIC CALCULATE BUTTON
// ══════════════════════════════════════════════
function doArith() {
  const valA  = parseFloat(document.getElementById('arithValA').value);
  const valB  = parseFloat(document.getElementById('arithValB').value);
  const unitA = document.getElementById('arithUnitA').value;
  const unitB = document.getElementById('arithUnitB').value;
  const unitR = document.getElementById('arithUnitResult').value;

  if (isNaN(valA) || isNaN(valB)) return;

  const typeObj    = TYPES[currentType];
  const resultBase = computeArith(valA, unitA, valB, unitB);

  if (isNaN(resultBase)) {
    showResultBox('arithResultBox', 'Division by zero', 'Cannot divide by zero.');
    return;
  }

  const resultInUnit = resultBase / typeObj.toBase[unitR];
  const formatted    = formatNum(resultInUnit);
  const op           = OPERATIONS[currentOperation];
  const desc         = op.description(valA, unitA, valB, unitB, formatted, unitR);

  showResultBox('arithResultBox', formatted + ' ' + unitR, desc);

  saveHistory({
    expr:   `${valA} ${unitA}  ${op.symbol}  ${valB} ${unitB}`,
    result: formatted + ' ' + unitR,
    op:     currentOperation,
    type:   currentType
  });
}

// ══════════════════════════════════════════════
// SWAP UNITS (convert panel only)
// ══════════════════════════════════════════════
function swapUnits() {
  const fromUnit = document.getElementById('fromUnit');
  const toUnit   = document.getElementById('toUnit');
  const fromVal  = document.getElementById('fromVal');
  const toVal    = document.getElementById('toVal');

  const tmpUnit  = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value   = tmpUnit;

  fromVal.value  = toVal.value || fromVal.value;
  liveConvert();
}

// ══════════════════════════════════════════════
// RESULT BOX HELPERS
// ══════════════════════════════════════════════
function showResultBox(boxId, valueText, descText) {
  const box = document.getElementById(boxId);
  // find child elements by class inside the box
  box.querySelector('.result-value').textContent = valueText;
  box.querySelector('.result-desc').textContent  = descText;
  box.classList.add('show');
}

function resetResults() {
  document.getElementById('convertResultBox').classList.remove('show');
  document.getElementById('arithResultBox').classList.remove('show');
  document.getElementById('toVal').value      = '';
  document.getElementById('arithResult').value = '';
}

// ══════════════════════════════════════════════
// HISTORY
// ══════════════════════════════════════════════
function saveHistory(entry) {
  entry.ts = Date.now();
  history.unshift(entry);
  if (history.length > 50) history = history.slice(0, 50);
  localStorage.setItem('quanment_history', JSON.stringify(history));
}

function showConverter() {
  document.getElementById('converterSection').style.display = 'block';
  document.getElementById('historySection').classList.remove('show');
  document.getElementById('navConverter').classList.add('active');
  document.getElementById('navHistory').classList.remove('active');
}

function showHistory() {
  document.getElementById('converterSection').style.display = 'none';
  document.getElementById('historySection').classList.add('show');
  document.getElementById('navConverter').classList.remove('active');
  document.getElementById('navHistory').classList.add('active');
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (!history.length) {
    list.innerHTML = '<div class="history-empty">No calculations yet. Start converting!</div>';
    return;
  }

  list.innerHTML = history.map(h => `
    <div class="history-item">
      <span class="h-expr">${h.expr}</span>
      <span class="h-arrow">→</span>
      <span class="h-result">${h.result}</span>
      <span class="h-badge ${h.op}">${h.op === 'convert' ? 'convert' : h.op} · ${h.type}</span>
    </div>
  `).join('');
}

function clearHistory() {
  if (!confirm('Clear all history?')) return;
  history = [];
  localStorage.removeItem('quanment_history');
  renderHistory();
}

// ══════════════════════════════════════════════
// KEYBOARD SUPPORT
// ══════════════════════════════════════════════
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  if (currentOperation === 'convert') doConvert();
  else doArith();
});

// Attach data-op attributes to op cards on load
// (needed so setType can reference them)
document.addEventListener('DOMContentLoaded', function () {
  const ops = ['convert', 'add', 'subtract', 'multiply', 'divide'];
  document.querySelectorAll('.op-card').forEach((card, i) => {
    card.dataset.op = ops[i];
  });
});