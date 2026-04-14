export default function SettlementsTable({ settlements, loading }) {
  return (
    <section className="card panel-span-2">
      <div className="section-head">
        <h3>Optimized Settlements</h3>
        <p>Generated through the minimum cash flow algorithm.</p>
      </div>
      {loading ? (
        <p className="muted">Calculating settlements...</p>
      ) : settlements.length === 0 ? (
        <p className="muted">No settlements required.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((item, index) => (
                <tr key={`${item.from}-${item.to}-${index}`}>
                  <td>{item.from}</td>
                  <td>{item.to}</td>
                  <td>₹{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}