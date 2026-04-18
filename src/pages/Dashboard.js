// src/pages/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { quantityAPI } from '../services/api';
import './Dashboard.css';

// ─── UNIT DEFINITIONS ─────────────────────────────────────────
// Frontend display names → Backend enum names
const TYPES = {
  length: {
    label: 'Length',
    icon: '📏',
    measurementType: 'length',
    units: [
      { label: 'Inches',      value: 'INCHES'      },
      { label: 'Feet',        value: 'FEET'         },
      { label: 'Yards',       value: 'YARDS'        },
      { label: 'Centimeters', value: 'CENTIMETERS'  },
    ],
  },
  temperature: {
    label: 'Temperature',
    icon: '🌡️',
    measurementType: 'temperature',
    units: [
      { label: 'Celsius',    value: 'CELSIUS'    },
      { label: 'Fahrenheit', value: 'FAHRENHEIT' },
      { label: 'Kelvin',     value: 'KELVIN'     },
    ],
  },
  volume: {
    label: 'Volume',
    icon: '🧪',
    measurementType: 'volume',
    units: [
      { label: 'Millilitre', value: 'MILLILITRE' },
      { label: 'Litre',      value: 'LITRE'      },
      { label: 'Gallon',     value: 'GALLON'     },
    ],
  },
  weight: {
    label: 'Weight',
    icon: '⚖️',
    measurementType: 'weight',
    units: [
      { label: 'Gram',     value: 'GRAM'     },
      { label: 'Kilogram', value: 'KILOGRAM' },
      { label: 'Pound',    value: 'POUND'    },
    ],
  },
};

const OPERATIONS = [
  { key: 'convert',  label: 'Convert', symbol: '⇄' },
  { key: 'add',      label: 'Add',     symbol: '+' },
  { key: 'subtract', label: 'Subtract', symbol: '−' },
  { key: 'divide',   label: 'Divide',  symbol: '÷' },
];

export default function Dashboard() {
  const { user, logout, getInitials } = useAuth();
  const navigate = useNavigate();

  const [view,     setView]     = useState('converter'); // 'converter' | 'history'
  const [type,     setType]     = useState('length');
  const [operation, setOp]      = useState('convert');
  const [history,  setHistory]  = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  // Convert panel state
  const [fromVal,  setFromVal]  = useState('1');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit,   setToUnit]   = useState('');
  const [toVal,    setToVal]    = useState('');
  const [convResult, setConvResult] = useState(null);
  const [convLoading, setConvLoading] = useState(false);

  // Arithmetic panel state
  const [valA, setValA]         = useState('1');
  const [unitA, setUnitA]       = useState('');
  const [valB, setValB]         = useState('1');
  const [unitB, setUnitB]       = useState('');
  const [unitR, setUnitR]       = useState('');
  const [arithResult, setArithResult] = useState(null);
  const [arithLoading, setArithLoading] = useState(false);

  // Initialize unit dropdowns when type changes
  useEffect(() => {
    const units = TYPES[type].units;
    setFromUnit(units[0]?.value || '');
    setToUnit(units[1]?.value || units[0]?.value || '');
    setUnitA(units[0]?.value || '');
    setUnitB(units[0]?.value || '');
    setUnitR(units[0]?.value || '');
    setToVal('');
    setConvResult(null);
    setArithResult(null);
    // Force back to convert for temperature arithmetic
    if (type === 'temperature' && operation !== 'convert') {
      setOp('convert');
    }
  }, [type]);

  // Reset results when operation changes
  useEffect(() => {
    setConvResult(null);
    setArithResult(null);
    setToVal('');
  }, [operation]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // ─── CONVERT ──────────────────────────────────────────────
  const doConvert = async () => {
    if (!fromVal || isNaN(fromVal)) return;
    setConvLoading(true);
    try {
      const data = await quantityAPI.convert(
        parseFloat(fromVal), fromUnit, toUnit, TYPES[type].measurementType
      );
      if (data.error) {
        setConvResult({ error: true, msg: data.message });
      } else {
        const resultLabel = TYPES[type].units.find(u => u.value === toUnit)?.label || toUnit;
        setToVal(data.result);
        setConvResult({ value: data.result, unit: resultLabel, desc: `${fromVal} ${fromUnit} = ${data.result} ${resultLabel}` });
      }
    } catch (e) {
      setConvResult({ error: true, msg: e.message });
    } finally {
      setConvLoading(false);
    }
  };

  const swapUnits = () => {
    const tmp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tmp);
    setFromVal(toVal || fromVal);
    setToVal('');
    setConvResult(null);
  };

  // ─── ARITHMETIC ───────────────────────────────────────────
  const doArith = async () => {
    if (!valA || !valB || isNaN(valA) || isNaN(valB)) return;
    setArithLoading(true);
    const measurementType = TYPES[type].measurementType;
    try {
      let data;
      const a = parseFloat(valA), b = parseFloat(valB);
      if (operation === 'add') {
        data = await quantityAPI.add(a, unitA, b, unitB, measurementType, unitR);
      } else if (operation === 'subtract') {
        data = await quantityAPI.subtract(a, unitA, b, unitB, measurementType, unitR);
      } else if (operation === 'divide') {
        data = await quantityAPI.divide(a, unitA, b, unitB, measurementType);
      }

      if (data?.error) {
        setArithResult({ error: true, msg: data.message });
      } else {
        const opSym = OPERATIONS.find(o => o.key === operation)?.symbol;
        const unitLabel = TYPES[type].units.find(u => u.value === unitR)?.label || unitR;
        setArithResult({
          value: data.result,
          unit: unitLabel,
          desc: `${valA} ${unitA} ${opSym} ${valB} ${unitB} = ${data.result} ${unitLabel}`,
        });
      }
    } catch (e) {
      setArithResult({ error: true, msg: e.message });
    } finally {
      setArithLoading(false);
    }
  };

  // ─── HISTORY ──────────────────────────────────────────────
  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const data = await quantityAPI.getHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch (e) {
      setHistory([]);
    } finally {
      setHistLoading(false);
    }
  }, []);

  const clearHistory = async () => {
    if (!window.confirm('Clear all history?')) return;
    try {
      setHistLoading(true);
      await quantityAPI.deleteHistory();
      setHistory([]);
    } catch (e) {
      alert('History clear nahi ho saki: ' + (e.message || 'Server error'));
    } finally {
      setHistLoading(false);
    }
  };

  const deleteHistoryItem = async (id) => {
    try {
      await quantityAPI.deleteHistoryById(id);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (e) {
      alert('Item delete nahi hua: ' + (e.message || 'Server error'));
    }
  };

  useEffect(() => {
    if (view === 'history') loadHistory();
  }, [view, loadHistory]);

  const units = TYPES[type].units;
  const isTempArith = type === 'temperature' && operation !== 'convert';

  return (
    <div className="dash-root">
      {/* NAV */}
      <nav className="dash-nav">
        <div className="nav-logo">Quanment</div>
        <div className="nav-links">
          <button
            className={`nav-link${view === 'converter' ? ' active' : ''}`}
            onClick={() => setView('converter')}
          >Converter</button>
          <button
            className={`nav-link${view === 'history' ? ' active' : ''}`}
            onClick={() => setView('history')}
          >History</button>
        </div>
        <div className="nav-right">
          <div className="nav-user" title={user?.name || ''}>{getInitials()}</div>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">Welcome To Quantity Measurement</div>

      {/* ══ CONVERTER SECTION ══ */}
      {view === 'converter' && (
        <div className="main">

          {/* TYPE SELECTOR */}
          <div className="section-label">Choose Type</div>
          <div className="type-grid">
            {Object.entries(TYPES).map(([key, t]) => (
              <div
                key={key}
                className={`type-card${type === key ? ' active' : ''}`}
                onClick={() => setType(key)}
              >
                <span className="icon">{t.icon}</span>
                <div className="label">{t.label}</div>
              </div>
            ))}
          </div>

          {/* OPERATION SELECTOR */}
          <div className="section-label">Choose Operation</div>
          <div className="op-grid">
            {OPERATIONS.map(op => (
              <div
                key={op.key}
                className={`op-card${operation === op.key ? ' active' : ''}${type === 'temperature' && op.key !== 'convert' ? ' disabled' : ''}`}
                onClick={() => {
                  if (type === 'temperature' && op.key !== 'convert') return;
                  setOp(op.key);
                }}
              >
                <span className="op-icon">{op.symbol}</span>
                <div className="op-label">{op.label}</div>
              </div>
            ))}
          </div>

          {/* TEMPERATURE WARNING */}
          {isTempArith && (
            <div className="temp-warning show">
              <span className="warn-icon">⚠️</span>
              <div>
                <strong>Arithmetic not available for Temperature</strong>
                <p>Arithmetic is not physically meaningful for temperature scales. Only conversion is supported.</p>
              </div>
            </div>
          )}

          {/* ── CONVERT PANEL ── */}
          {operation === 'convert' && (
            <div className="converter-panel">
              <div className="converter-row">
                <div className="field-group">
                  <div className="field-label">From</div>
                  <input
                    className="number-input"
                    type="number"
                    value={fromVal}
                    onChange={(e) => { setFromVal(e.target.value); setToVal(''); setConvResult(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && doConvert()}
                  />
                  <select className="unit-select" value={fromUnit} onChange={(e) => { setFromUnit(e.target.value); setConvResult(null); }}>
                    {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>

                <button className="swap-btn" onClick={swapUnits} title="Swap">⇄</button>

                <div className="field-group">
                  <div className="field-label">To</div>
                  <input className="number-input result-input" type="number" value={toVal} placeholder="—" readOnly />
                  <select className="unit-select" value={toUnit} onChange={(e) => { setToUnit(e.target.value); setConvResult(null); }}>
                    {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>
              </div>

              <button className="convert-btn" onClick={doConvert} disabled={convLoading}>
                {convLoading ? 'Converting…' : 'Convert →'}
              </button>

              {convResult && (
                <div className={`result-box show ${convResult.error ? 'error' : ''}`}>
                  <div className="result-label">Result</div>
                  <div className="result-value">
                    {convResult.error ? '❌ Error' : `${convResult.value} ${convResult.unit}`}
                  </div>
                  <div className="result-desc">
                    {convResult.error ? convResult.msg : convResult.desc}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── ARITHMETIC PANEL ── */}
          {operation !== 'convert' && !isTempArith && (
            <div className="converter-panel">
              <div className="arith-section-title">
                {OPERATIONS.find(o => o.key === operation)?.label} two {TYPES[type].label.toLowerCase()} values
              </div>

              <div className="arith-row">
                <div className="field-group arith-field">
                  <div className="field-label">Value A</div>
                  <input className="number-input" type="number" value={valA}
                    onChange={(e) => { setValA(e.target.value); setArithResult(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && doArith()} />
                  <select className="unit-select" value={unitA} onChange={(e) => setUnitA(e.target.value)}>
                    {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>

                <div className="op-badge">{OPERATIONS.find(o => o.key === operation)?.symbol}</div>

                <div className="field-group arith-field">
                  <div className="field-label">Value B</div>
                  <input className="number-input" type="number" value={valB}
                    onChange={(e) => { setValB(e.target.value); setArithResult(null); }}
                    onKeyDown={(e) => e.key === 'Enter' && doArith()} />
                  <select className="unit-select" value={unitB} onChange={(e) => setUnitB(e.target.value)}>
                    {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                  </select>
                </div>

                <div className="op-badge">=</div>

                <div className="field-group arith-field">
                  <div className="field-label">Result in</div>
                  <input className="number-input result-input" type="text"
                    value={arithResult && !arithResult.error ? arithResult.value : ''}
                    placeholder="—" readOnly />
                  {operation !== 'divide' && (
                    <select className="unit-select" value={unitR} onChange={(e) => setUnitR(e.target.value)}>
                      {units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                    </select>
                  )}
                </div>
              </div>

              <button className="convert-btn" onClick={doArith} disabled={arithLoading}>
                {arithLoading ? 'Calculating…' : 'Calculate →'}
              </button>

              {arithResult && (
                <div className={`result-box show ${arithResult.error ? 'error' : ''}`}>
                  <div className="result-label">Result</div>
                  <div className="result-value">
                    {arithResult.error ? '❌ Error' : `${arithResult.value} ${arithResult.unit}`}
                  </div>
                  <div className="result-desc">
                    {arithResult.error ? arithResult.msg : arithResult.desc}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ══ HISTORY SECTION ══ */}
      {view === 'history' && (
        <div className="history-panel show">
          <div className="history-header">
            <div className="history-title">Conversion History</div>
            <button className="clear-btn" onClick={clearHistory}>Clear All</button>
          </div>
          <div className="history-list">
            {histLoading ? (
              <div className="history-empty">Loading history…</div>
            ) : history.length === 0 ? (
              <div className="history-empty">No calculations yet. Start converting!</div>
            ) : (
              history.map(h => (
                <div key={h.id} className="history-item">
                  <span className="h-expr">{h.operation}</span>
                  <span className="h-arrow">→</span>
                  <span className="h-result">
                    {h.error ? `❌ ${h.errorMessage}` : `${h.operand1} ${h.operation?.toLowerCase()} ${h.operand2} = ${h.result}`}
                  </span>
                  <span className={`h-badge ${h.operation?.toLowerCase()}`}>{h.operation?.toLowerCase()}</span>
                  <button className="h-delete" onClick={() => deleteHistoryItem(h.id)} title="Delete">✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}