export function midPrice(price?: number|null, min?: number|null, max?: number|null) {
  if (price != null) return Number(price);
  const a = Number(min||0), b = Number(max||0);
  return (a + b) / 2;
}

export function displayCHF(n: number) {
  return `CHF ${n.toFixed(2)}`;
}
