import React from 'react';

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

interface NumberFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  decimal?: boolean;
  prefix?: string;
  suffix?: string;
  error?: string;
  hint?: string;
  inputRef?: (el: HTMLInputElement | null) => void;
  onSubmit?: () => void;
}

export function NumberField(p: NumberFieldProps) {
  return (
    <label className="field">
      <span className="label">{p.label}</span>
      <span className={p.error ? 'input-row has-error' : 'input-row'}>
        {p.prefix ? <span className="affix">{p.prefix}</span> : null}
        <input
          ref={p.inputRef}
          value={p.value}
          inputMode={p.decimal === false ? 'numeric' : 'decimal'}
          placeholder="0"
          autoComplete="off"
          onChange={(e) => p.onChangeText(e.target.value)}
          onFocus={(e) => e.target.select()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && p.onSubmit) {
              e.preventDefault();
              p.onSubmit();
            }
          }}
        />
        {p.suffix ? <span className="affix">{p.suffix}</span> : null}
      </span>
      {p.error ? <span className="error">{p.error}</span> : p.hint ? <span className="hint">{p.hint}</span> : null}
    </label>
  );
}

export function ResultRow({
  label, value, emphasis,
}: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className={emphasis ? 'result-row emphasis' : 'result-row'}>
      <span className="result-label">{label}</span>
      <span className="result-value">{value}</span>
    </div>
  );
}

export function HighlightCard({ children }: { children: React.ReactNode }) {
  return <div className="highlight">{children}</div>;
}
