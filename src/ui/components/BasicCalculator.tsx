import React, { useState } from 'react';
import {
  backspace, clearAll, clearEntry, equals, initialCalc, inputDecimal, inputDigit,
  currentValue, inputOperator, Op, percent, reciprocal, sqrt, toggleSign, CalcState,
} from '../../domain/calculator/basicCalc';

type Kind = 'num' | 'op' | 'fn' | 'eq';
interface Key { label: string; kind: Kind; run: (s: CalcState) => CalcState }

const num = (d: string): Key => ({ label: d, kind: 'num', run: (s) => inputDigit(s, d) });
const op = (o: Op): Key => ({ label: o, kind: 'op', run: (s) => inputOperator(s, o) });

const ROWS: Key[][] = [
  [
    { label: 'C', kind: 'fn', run: () => clearAll() },
    { label: 'CE', kind: 'fn', run: clearEntry },
    { label: '⌫', kind: 'fn', run: backspace },
    op('÷'),
  ],
  [
    { label: '√', kind: 'fn', run: sqrt },
    { label: '1/x', kind: 'fn', run: reciprocal },
    { label: '%', kind: 'fn', run: percent },
    op('×'),
  ],
  [num('7'), num('8'), num('9'), op('-')],
  [num('4'), num('5'), num('6'), op('+')],
  [num('1'), num('2'), num('3'), { label: '=', kind: 'eq', run: equals }],
  [
    { label: '±', kind: 'fn', run: toggleSign },
    num('0'),
    { label: '.', kind: 'num', run: inputDecimal },
  ],
];

/** Keyboard shortcuts, active while the calculator panel has focus. */
function keyToAction(e: React.KeyboardEvent): ((s: CalcState) => CalcState) | null {
  const k = e.key;
  if (/^[0-9]$/.test(k)) return (s) => inputDigit(s, k);
  if (k === '.' || k === ',') return inputDecimal;
  if (k === '+') return (s) => inputOperator(s, '+');
  if (k === '-') return (s) => inputOperator(s, '-');
  if (k === '*' || k === 'x' || k === 'X') return (s) => inputOperator(s, '×');
  if (k === '/') return (s) => inputOperator(s, '÷');
  if (k === '%') return percent;
  if (k === 'Enter' || k === '=') return equals;
  if (k === 'Backspace') return backspace;
  if (k === 'Escape') return () => clearAll();
  return null;
}

export default function BasicCalculator({ onUsePrice }: { onUsePrice?: (value: number) => void }) {
  const [s, setS] = useState<CalcState>(initialCalc);

  return (
    <div
      className="basic-calc"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const action = keyToAction(e);
        if (action) {
          e.preventDefault();
          setS((prev) => action(prev));
        }
      }}
    >
      <h2>Calculator</h2>
      <div className="calc-screen">
        <div className="calc-expr">{s.expr || '\u00a0'}</div>
        <div className="calc-display">{s.display}</div>
      </div>

      <div className="calc-keys">
        {ROWS.flat().map((k) => (
          <button
            key={k.label}
            className={`key key-${k.kind}`}
            onClick={() => setS((prev) => k.run(prev))}
            // keep keyboard focus on the panel so typing keeps working after a click
            onMouseDown={(e) => e.preventDefault()}
          >
            {k.label}
          </button>
        ))}
      </div>

      {onUsePrice ? (
        <button
          className="use-btn"
          onClick={() => {
            const v = currentValue(s);
            if (v === null || v <= 0) return;
            onUsePrice(v);
            setS((prev) => equals(prev)); // show the final result on the calculator too
          }}
        >
          Use as Actual Price ↑
        </button>
      ) : null}
      <p className="calc-tip">Tip: click here, then type with your keyboard.</p>
    </div>
  );
}
