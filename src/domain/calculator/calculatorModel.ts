import * as calc from './installmentCalculator';
import { plain } from './format';

/** Which down-payment field drives the others. 'monthly' = user typed the monthly installment. */
export type DpSource = 'percent' | 'amount' | 'monthly';
/** Whether the total comes from actual price + percentage, or was typed directly. */
export type TotalSource = 'percent' | 'total';

/** Raw text of every field, plus which down-payment field the user edited last. */
export interface CalcInputs {
  actual: string;
  percent: string;
  total: string;
  dpPercent: string;
  dpAmount: string;
  installments: string;
  monthly: string;
  totalSrc: TotalSource;
  lastEdited: DpSource;
}

export const DEFAULT_INSTALLMENTS = '11';
export const DEFAULT_PERCENT = '40';
export const DEFAULT_DP_PERCENT = '12';

export const emptyInputs = (): CalcInputs => ({
  actual: '',
  percent: DEFAULT_PERCENT,
  total: '',
  dpPercent: DEFAULT_DP_PERCENT,
  dpAmount: '',
  installments: DEFAULT_INSTALLMENTS,
  monthly: '',
  totalSrc: 'percent',
  lastEdited: 'percent',
});

export interface CalcErrors {
  total?: string;
  monthly?: string;
  dpPercent?: string;
  dpAmount?: string;
  installments?: string;
}

export interface CalcResult {
  actual: number;
  percent: number;
  markup: number;
  total: number;
  dpPercent: number;
  dpAmount: number;
  installments: number;
  remaining: number | null; // null when inputs are invalid
  monthly: number | null; // null when inputs are invalid
  errors: CalcErrors;
  canSave: boolean;
}

const EPS = 0.005;

const num = (s: string): number => {
  const n = Number(s);
  return s.trim() !== '' && Number.isFinite(n) && n >= 0 ? n : 0;
};

/** Keeps only digits and at most one decimal point. */
export function filterDecimal(s: string): string {
  const cleaned = s.replace(/[^0-9.]/g, '').slice(0, 15);
  const dot = cleaned.indexOf('.');
  return dot < 0 ? cleaned : cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, '');
}

export const filterInt = (s: string) => s.replace(/[^0-9]/g, '').slice(0, 4);

const parseN = (s: string) => (/^\d+$/.test(s) ? parseInt(s, 10) : 0);

/** Total price: typed directly, or actual price + markup from the percentage. */
const totalOf = (i: CalcInputs) => {
  if (i.totalSrc === 'total') return num(i.total);
  const actual = num(i.actual);
  return calc.calculateTotalPrice(actual, calc.calculateMarkup(actual, num(i.percent)));
};

/**
 * Keeps all dependent fields in sync. Only fields the user is NOT currently driving are
 * rewritten, so the field being typed in is never overwritten and no update loop can occur.
 *  - Total: either derived from actual + percentage, or typed (then percentage is derived).
 *  - Down payment: driven by its percent, its amount, or the typed monthly installment.
 *  - Monthly: derived from the down payment unless the user typed it.
 */
export function relink(i: CalcInputs): CalcInputs {
  const out: CalcInputs = { ...i };
  const actual = num(i.actual);
  const total = totalOf(i);
  const n = parseN(i.installments);

  // 1. Total <-> percentage
  if (i.totalSrc === 'percent') {
    out.total = actual > 0 ? plain(total) : '';
  } else if (actual > 0 && total >= actual) {
    out.percent = plain(((total - actual) / actual) * 100);
  }

  // 2. Down payment
  if (i.lastEdited === 'percent') {
    out.dpAmount =
      i.dpPercent === '' ? '' : plain(calc.calculateDownPaymentFromPercentage(total, num(i.dpPercent)));
  } else if (i.lastEdited === 'amount') {
    out.dpPercent =
      i.dpAmount === '' || total <= 0
        ? ''
        : plain(calc.calculatePercentageFromDownPayment(total, num(i.dpAmount)));
  } else if (n > 0 && total > 0 && i.monthly !== '') {
    // Monthly typed: down payment = total - monthly * installments
    const dp = Math.max(calc.calculateRemainingAmount(total, num(i.monthly) * n), 0);
    out.dpAmount = plain(dp);
    out.dpPercent = plain(calc.calculatePercentageFromDownPayment(total, dp));
  }

  // 3. Monthly installment (derived unless the user is typing it)
  if (i.lastEdited !== 'monthly') {
    const dp = num(out.dpAmount);
    out.monthly =
      n > 0 && total > 0 && dp <= total + EPS
        ? plain(calc.calculateMonthlyInstallment(Math.max(total - dp, 0), n))
        : '';
  }
  return out;
}

export function compute(i: CalcInputs): CalcResult {
  const actual = num(i.actual);
  const percent = i.totalSrc === 'percent' ? num(i.percent) : actual > 0 ? ((num(i.total) - actual) / actual) * 100 : num(i.percent);
  const total = totalOf(i);
  const markup = total - actual;
  const dpAmount = num(i.dpAmount);
  const dpPercent = num(i.dpPercent);
  const n = parseN(i.installments);

  const errors: CalcErrors = {};
  if (i.totalSrc === 'total' && i.total !== '' && actual > 0 && total < actual - EPS)
    errors.total = 'Cannot be less than the actual price';
  if (dpPercent > 100 + 1e-9) errors.dpPercent = 'Cannot exceed 100%';
  if (dpAmount > total + EPS) errors.dpAmount = 'Cannot be more than the total price';
  if (i.installments === '') errors.installments = 'Enter number of installments';
  else if (n <= 0) errors.installments = 'Must be a whole number greater than 0';
  if (i.lastEdited === 'monthly' && n > 0 && num(i.monthly) * n > total + EPS)
    errors.monthly = 'Too high for this total price';

  const ok = Object.keys(errors).length === 0 && total > 0;
  const remaining = ok ? Math.max(calc.calculateRemainingAmount(total, dpAmount), 0) : null;
  const monthly = remaining === null ? null : calc.calculateMonthlyInstallment(remaining, n);

  return {
    actual, percent, markup, total, dpPercent, dpAmount,
    installments: n, remaining, monthly, errors,
    canSave: actual > 0 && remaining !== null && monthly !== null,
  };
}
