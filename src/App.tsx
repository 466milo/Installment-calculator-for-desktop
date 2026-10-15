import React, { useState } from 'react';
import CalculatorScreen from './ui/calculator/CalculatorScreen';
import HistoryScreen from './ui/history/HistoryScreen';

type Tab = 'calculator' | 'history';

export default function App() {
  const [tab, setTab] = useState<Tab>('calculator');
  // `nonce` forces the calculator to remount even when the same saved plan is opened twice
  const [opened, setOpened] = useState<{ id?: string; nonce: number }>({ nonce: 0 });

  const openPlan = (id: string) => {
    setOpened({ id, nonce: Date.now() });
    setTab('calculator');
  };

  return (
    <div className="app">
      <header className="topbar">
        <h1>Installment Calculator</h1>
        <nav>
          <button className={tab === 'calculator' ? 'tab active' : 'tab'} onClick={() => setTab('calculator')}>
            Calculator
          </button>
          <button className={tab === 'history' ? 'tab active' : 'tab'} onClick={() => setTab('history')}>
            History
          </button>
        </nav>
      </header>

      <main className="content">
        {/* Calculator stays mounted (just hidden) so typed values survive a visit to History */}
        <div style={{ display: tab === 'calculator' ? 'block' : 'none' }}>
          <CalculatorScreen key={opened.nonce} planId={opened.id} />
        </div>
        {tab === 'history' && <HistoryScreen onOpen={openPlan} />}
      </main>
    </div>
  );
}
