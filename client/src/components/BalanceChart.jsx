export default function BalanceChart({ balances }) {
  const entries = Object.entries(balances || {}).map(([name, amount]) => ({
    name,
    amount: Math.round(amount * 100) / 100
  }));

  if (entries.length === 0) {
    return (
      <section className="card">
        <div className="section-head">
          <h3>Net Balances</h3>
          <p>See who owes money and who is owed.</p>
        </div>
        <p className="muted">Add members and expenses to see balances.</p>
      </section>
    );
  }

  const maxAbs = Math.max(...entries.map((e) => Math.abs(e.amount)), 1);

  return (
    <section className="card">
      <div className="section-head">
        <h3>Net Balances</h3>
        <p>See who owes money and who is owed.</p>
      </div>
      <div className="balance-chart">
        {entries.map((entry) => {
          const pct = (Math.abs(entry.amount) / maxAbs) * 45;
          const isPositive = entry.amount >= 0;

          return (
            <div className="balance-row" key={entry.name}>
              <span className="balance-name">{entry.name}</span>
              <div className="balance-bar-wrap">
                <div className="balance-bar-track" />
                <div
                  className={`balance-bar ${isPositive ? "positive" : "negative"}`}
                  style={{ width: `${Math.max(pct, 1)}%` }}
                />
              </div>
              <span className={`balance-value ${isPositive ? "positive" : "negative"}`}>
                {isPositive ? "+" : "−"}₹{Math.abs(entry.amount)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
