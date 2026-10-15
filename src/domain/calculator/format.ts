const group = (intPart: string) => intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100;

/** 100000 -> "Rs. 100,000", 8727.2727 -> "Rs. 8,727.27", null -> "—" */
export function rs(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `Rs. ${number(value)}`;
}

export function number(value: number): string {
  const [i, d] = round2(Math.abs(value)).toFixed(2).split('.');
  const dec = d.replace(/0+$/, '');
  return `${value < 0 ? '-' : ''}${group(i)}${dec ? '.' + dec : ''}`;
}

/** Editable plain text, no grouping: 24000 -> "24000", 8.333333 -> "8.33" */
export function plain(value: number): string {
  if (!Number.isFinite(value)) return '';
  let s = round2(value).toFixed(2);
  s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}
