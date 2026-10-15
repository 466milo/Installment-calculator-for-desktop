import React, { useRef } from 'react';
import { useCalculator } from '../../hooks/useCalculator';
import { plain, rs } from '../../domain/calculator/format';
import { HighlightCard, NumberField, ResultRow, Section } from '../components/Components';
import BasicCalculator from '../components/BasicCalculator';

export default function CalculatorScreen({ planId }: { planId?: string }) {
  const c = useCalculator(planId);
  const { inputs, result: r } = c;
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const next = (i: number) => () => refs.current[i + 1]?.focus();
  const ref = (i: number) => (el: HTMLInputElement | null) => { refs.current[i] = el; };

  const actualNum = Number(inputs.actual);
  const dpNum = Number(inputs.dpAmount);

  return (
    <div className="calc-layout">
      <div className="calc-form">
        <Section title="Product Price">
          <NumberField
            label="Actual Price" prefix="Rs." value={inputs.actual} onChangeText={c.onActual}
            hint={inputs.actual && actualNum > 0 ? rs(actualNum) : undefined}
            inputRef={ref(0)} onSubmit={next(0)}
          />
          <NumberField
            label="Installment Percentage (%)" suffix="%" value={inputs.percent}
            onChangeText={c.onPercent} inputRef={ref(1)} onSubmit={next(1)}
          />
          <ResultRow label="Markup Amount" value={rs(r.markup)} />
          <NumberField
            label="Total Installment Price" prefix="Rs." value={inputs.total}
            onChangeText={c.onTotal} error={r.errors.total}
            hint={inputs.total && r.total > 0 ? rs(r.total) : undefined}
            inputRef={ref(2)} onSubmit={next(2)}
          />
        </Section>

        <Section title="Down Payment">
          <NumberField
            label="Down Payment (%)" suffix="%" value={inputs.dpPercent}
            onChangeText={c.onDpPercent} error={r.errors.dpPercent}
            inputRef={ref(3)} onSubmit={next(3)}
          />
          <NumberField
            label="Down Payment Amount" prefix="Rs." value={inputs.dpAmount}
            onChangeText={c.onDpAmount} error={r.errors.dpAmount}
            hint={inputs.dpAmount && dpNum > 0 ? rs(dpNum) : undefined}
            inputRef={ref(4)} onSubmit={next(4)}
          />
        </Section>

        <Section title="Installment Plan">
          <NumberField
            label="Number of Installments" decimal={false} value={inputs.installments}
            onChangeText={c.onInstallments} error={r.errors.installments}
            inputRef={ref(5)} onSubmit={next(5)}
          />
          <HighlightCard>
            <ResultRow label="Remaining Amount" value={rs(r.remaining)} emphasis />
          </HighlightCard>
          <NumberField
            label="Monthly Installment" prefix="Rs." value={inputs.monthly}
            onChangeText={c.onMonthly} error={r.errors.monthly}
            hint={inputs.monthly && r.monthly ? rs(r.monthly) : undefined}
            inputRef={ref(6)}
          />
        </Section>

        {c.message ? <p className="message">{c.message}</p> : null}

        <div className="buttons">
          <button className="btn btn-outline" onClick={c.reset}>Reset</button>
          <button className="btn btn-fill" disabled={!r.canSave} onClick={c.save}>
            Save Calculation
          </button>
        </div>
      </div>

      <aside className="calc-side">
        <BasicCalculator
          onUsePrice={(v) => {
            c.onActual(plain(v));
            refs.current[0]?.focus();
          }}
        />
      </aside>
    </div>
  );
}
