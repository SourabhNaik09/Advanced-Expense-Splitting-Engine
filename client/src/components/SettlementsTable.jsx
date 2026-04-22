import { ArrowRight } from "lucide-react";

export default function SettlementsTable({ settlements, loading }) {
  return (
    <section className="card panel-span-2">
      <div className="section-head">
        <h3>Optimized Settlements</h3>
        <p>The minimum number of transactions needed to settle all debts.</p>
      </div>
      {loading ? (
        <p className="muted">Calculating settlements...</p>
      ) : settlements.length === 0 ? (
        <p className="muted">No settlements required — all balances are even.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>From</th>
                <th></th>
                <th>To</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((item, index) => (
                <tr key={`${item.from}-${item.to}-${index}`}>
                  <td>
                    <span className="amount-debit">{item.from}</span>
                  </td>
                  <td>
                    <span className="settlement-arrow">
                      <ArrowRight size={16} />
                    </span>
                  </td>
                  <td>
                    <span className="amount-credit">{item.to}</span>
                  </td>
                  <td>
                    <strong>₹{item.amount}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}