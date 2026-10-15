import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalcInputs, DpSource, compute, emptyInputs, filterDecimal, filterInt, relink,
} from '../domain/calculator/calculatorModel';
import { plain } from '../domain/calculator/format';
import { planRepository } from '../data/repository/planRepository';

// Releases a typed monthly value. Price edits keep the down-payment percentage;
// installment-count edits keep the exact down-payment amount.
const freeForPrice = (i: CalcInputs): DpSource => (i.lastEdited === 'monthly' ? 'percent' : i.lastEdited);
const freeForCount = (i: CalcInputs): DpSource => (i.lastEdited === 'monthly' ? 'amount' : i.lastEdited);

/** View-model for the calculator screen: holds state, delegates all math to the domain layer. */
export function useCalculator(planId?: string) {
  const [inputs, setInputs] = useState<CalcInputs>(emptyInputs());
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const result = useMemo(() => compute(inputs), [inputs]);

  const flash = useCallback((m: string) => {
    setMessage(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2500);
  }, []);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  // Open a saved calculation from history
  useEffect(() => {
    if (!planId) return;
    let cancelled = false;
    (async () => {
      try {
        const p = await planRepository.getById(planId);
        if (cancelled) return;
        if (!p) return flash('Saved calculation not found');
        setInputs(relink({
          actual: plain(p.actualPrice),
          percent: plain(p.installmentPercentage),
          total: plain(p.totalInstallmentPrice),
          dpPercent: '',
          dpAmount: plain(p.downPaymentAmount),
          installments: String(p.numberOfInstallments),
          monthly: '',
          totalSrc: 'total',
          lastEdited: 'amount',
        }));
      } catch {
        if (!cancelled) flash('Could not open calculation');
      }
    })();
    return () => { cancelled = true; };
  }, [planId, flash]);

  const update = (fn: (i: CalcInputs) => CalcInputs) => setInputs((i) => relink(fn(i)));

  return {
    inputs,
    result,
    message,
    // Editing anything except the monthly installment releases a typed monthly value
    // (the down payment keeps the percentage it had), so monthly goes back to being derived.
    onActual: (v: string) => update((i) => ({ ...i, actual: filterDecimal(v), totalSrc: 'percent', lastEdited: freeForPrice(i) })),
    onPercent: (v: string) => update((i) => ({ ...i, percent: filterDecimal(v), totalSrc: 'percent', lastEdited: freeForPrice(i) })),
    onTotal: (v: string) => update((i) => ({ ...i, total: filterDecimal(v), totalSrc: 'total', lastEdited: freeForPrice(i) })),
    onDpPercent: (v: string) => update((i) => ({ ...i, dpPercent: filterDecimal(v), lastEdited: 'percent' })),
    onDpAmount: (v: string) => update((i) => ({ ...i, dpAmount: filterDecimal(v), lastEdited: 'amount' })),
    onInstallments: (v: string) => update((i) => ({ ...i, installments: filterInt(v), lastEdited: freeForCount(i) })),
    onMonthly: (v: string) => update((i) => ({ ...i, monthly: filterDecimal(v), lastEdited: 'monthly' })),
    reset: () => setInputs(emptyInputs()),
    save: async (name: string): Promise<boolean> => {
      const r = result;
      const trimmed = name.trim();
      if (!r.canSave || !trimmed) return false;
      try {
        await planRepository.save({
          name: trimmed,
          actualPrice: r.actual,
          installmentPercentage: r.percent,
          totalInstallmentPrice: r.total,
          downPaymentPercentage: r.dpPercent,
          downPaymentAmount: r.dpAmount,
          remainingAmount: r.remaining!,
          numberOfInstallments: r.installments,
          monthlyInstallment: r.monthly!,
        });
        flash(`Saved as "${trimmed}"`);
        return true;
      } catch {
        flash('Could not save calculation');
        return false;
      }
    },
  };
}
