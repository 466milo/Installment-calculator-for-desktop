import React, { useEffect, useRef, useState } from 'react';

interface Props {
  onCancel: () => void;
  /** Resolves true when saved (dialog is closed by the parent), false on failure. */
  onSave: (name: string) => Promise<boolean>;
}

/** Modal that asks for a name before saving. (window.prompt is not supported in Electron.) */
export default function SaveDialog({ onCancel, onSave }: Props) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const valid = name.trim().length > 0;

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    const ok = await onSave(name);
    if (!ok) setBusy(false); // on success the parent unmounts this dialog
  };

  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-title"
        onKeyDown={(e) => { if (e.key === 'Escape' && !busy) onCancel(); }}
      >
        <h2 id="save-title">Save Calculation</h2>
        <label className="field">
          <span className="label">Name</span>
          <span className="input-row">
            <input
              ref={inputRef}
              value={name}
              maxLength={80}
              placeholder="e.g. Ali – Samsung TV"
              autoComplete="off"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }}
            />
          </span>
        </label>
        <div className="buttons">
          <button className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn btn-fill" onClick={submit} disabled={!valid || busy}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
