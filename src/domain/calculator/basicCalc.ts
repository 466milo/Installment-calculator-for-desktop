export type Op = '+' | '-' | '×' | '÷';

export interface CalcState {
  display: string;        // what the user sees
  acc: number | null;     // stored left operand
  op: Op | null;          // pending operator
  fresh: boolean;         // next digit starts a new number
  expr: string;           // small history line, e.g. "12 + 5"
  error: boolean;
}

export const initialCalc: CalcState = {
  display: '0', acc: null, op: null, fresh: true, expr: '', error: false,
};

const MAX_DIGITS = 14;

export function clean(n: number): number {
  return parseFloat(n.toPrecision(12));
}

export function fmt(n: number): string {
  if (!isFinite(n)) return 'Error';
  const c = clean(n);
  const abs = Math.abs(c);
  if (abs !== 0 && (abs >= 1e15 || abs < 1e-9)) return c.toExponential(6).replace(/\.?0+e/, 'e');
  return String(c);
}

function apply(a: number, b: number, op: Op): number {
  switch (op) {
    case '+': return a + b;
    case '-': return a - b;
    case '×': return a * b;
    case '÷': return b === 0 ? NaN : a / b;
  }
}

const errState: CalcState = { ...initialCalc, display: 'Error', error: true };

export function inputDigit(s: CalcState, d: string): CalcState {
  if (s.error) s = initialCalc;
  if (s.fresh) return { ...s, display: d, fresh: false };
  if (s.display.replace(/[-.]/g, '').length >= MAX_DIGITS) return s;
  return { ...s, display: s.display === '0' ? d : s.display + d };
}

export function inputDecimal(s: CalcState): CalcState {
  if (s.error) s = initialCalc;
  if (s.fresh) return { ...s, display: '0.', fresh: false };
  if (s.display.includes('.')) return s;
  return { ...s, display: s.display + '.' };
}

export function inputOperator(s: CalcState, op: Op): CalcState {
  if (s.error) return s;
  const cur = Number(s.display);
  // changing operator before typing a second number
  if (s.op && s.fresh && s.acc !== null) {
    return { ...s, op, expr: `${fmt(s.acc)} ${op}` };
  }
  let acc = cur;
  if (s.op && s.acc !== null) {
    acc = apply(s.acc, cur, s.op);
    if (!isFinite(acc)) return errState;
  }
  return { display: fmt(acc), acc, op, fresh: true, expr: `${fmt(acc)} ${op}`, error: false };
}

export function equals(s: CalcState): CalcState {
  if (s.error || !s.op || s.acc === null) return s;
  const cur = Number(s.display);
  const res = apply(s.acc, cur, s.op);
  if (!isFinite(res)) return errState;
  return {
    display: fmt(res), acc: null, op: null, fresh: true,
    expr: `${fmt(s.acc)} ${s.op} ${fmt(cur)} =`, error: false,
  };
}

export function percent(s: CalcState): CalcState {
  if (s.error) return s;
  const cur = Number(s.display);
  // with a pending operator: "200 + 10 %" -> 10% of 200 = 20
  const val = s.op && s.acc !== null ? (s.acc * cur) / 100 : cur / 100;
  return { ...s, display: fmt(val), fresh: false };
}

export function toggleSign(s: CalcState): CalcState {
  if (s.error || s.display === '0') return s;
  return {
    ...s,
    display: s.display.startsWith('-') ? s.display.slice(1) : '-' + s.display,
  };
}

export function backspace(s: CalcState): CalcState {
  if (s.error) return initialCalc;
  if (s.fresh) return s;
  const next = s.display.slice(0, -1);
  return { ...s, display: next === '' || next === '-' ? '0' : next, fresh: next === '' || next === '-' };
}

export function clearEntry(s: CalcState): CalcState {
  return { ...s, display: '0', fresh: true, error: false };
}

export function clearAll(): CalcState {
  return initialCalc;
}

export function sqrt(s: CalcState): CalcState {
  if (s.error) return s;
  const cur = Number(s.display);
  if (cur < 0) return errState;
  return { ...s, display: fmt(Math.sqrt(cur)), fresh: true };
}

export function reciprocal(s: CalcState): CalcState {
  if (s.error) return s;
  const cur = Number(s.display);
  if (cur === 0) return errState;
  return { ...s, display: fmt(1 / cur), fresh: true };
}

/** Final numeric value on the calculator (finishes any pending operation). null if invalid. */
export function currentValue(s: CalcState): number | null {
  if (s.error) return null;
  const r = s.op && s.acc !== null ? equals(s) : s;
  if (r.error) return null;
  const n = Number(r.display);
  return Number.isFinite(n) ? n : null;
}
