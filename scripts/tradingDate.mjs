// Compute previous A-share trading day (simple weekday logic, no CN holiday calendar).
// - If today is Monday -> previous Friday
// - If today is Sunday -> previous Friday
// - If today is Saturday -> previous Friday
// - Else -> yesterday

export function previousTradingDateISO(now = new Date()) {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0 Sun .. 6 Sat

  const subtractDays = (n) => {
    const x = new Date(d);
    x.setDate(x.getDate() - n);
    return x;
  };

  let prev;
  if (day === 1) prev = subtractDays(3); // Mon -> Fri
  else if (day === 0) prev = subtractDays(2); // Sun -> Fri
  else if (day === 6) prev = subtractDays(1); // Sat -> Fri
  else prev = subtractDays(1);

  return prev.toISOString().slice(0, 10);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(previousTradingDateISO());
}
