import React, { useCallback, useEffect, useState } from 'react';
import { planRepository } from '../../data/repository/planRepository';
import { InstallmentPlan } from '../../data/entities';
import { rs } from '../../domain/calculator/format';

const formatDate = (ms: number) =>
  new Date(ms).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

export default function HistoryScreen({ onOpen }: { onOpen: (id: string) => void }) {
  const [plans, setPlans] = useState<InstallmentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPlans(await planRepository.getAll());
      setError(null);
    } catch {
      setError('Could not load saved calculations. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const doDelete = async (p: InstallmentPlan) => {
    if (!window.confirm('Delete calculation?\nThis saved calculation will be permanently removed.')) return;
    try {
      await planRepository.delete(p.id);
      await load();
    } catch {
      setError('Could not delete calculation');
    }
  };

  return (
    <div className="history">
      <div className="history-head">
        <h2>Calculation History</h2>
        <button className="btn btn-outline small" onClick={load} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {error ? <p className="error center">{error}</p> : null}
      {!error && !loading && plans.length === 0 ? <p className="center muted">No saved calculations yet</p> : null}

      <div className="history-grid">
        {plans.map((p) => (
          <div key={p.id} className="card" onClick={() => onOpen(p.id)} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') onOpen(p.id); }}>
            <div className="card-head">
              <span className="date">{formatDate(p.createdAt)}</span>
              <button
                className="delete"
                onClick={(e) => { e.stopPropagation(); doDelete(p); }}
              >
                Delete
              </button>
            </div>
            <Line label="Actual Price" value={rs(p.actualPrice)} />
            <Line label="Total Installment Price" value={rs(p.totalInstallmentPrice)} />
            <Line label="Down Payment" value={rs(p.downPaymentAmount)} />
            <Line label="Installments" value={String(p.numberOfInstallments)} />
            <Line label="Monthly Installment" value={rs(p.monthlyInstallment)} bold />
          </div>
        ))}
      </div>
    </div>
  );
}

function Line({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="line">
      <span>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 400 }}>{value}</span>
    </div>
  );
}
