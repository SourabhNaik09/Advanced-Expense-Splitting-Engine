export default function ActivityPanel({ expenses }) {
  return (
    <section className="card">
      <div className="section-head">
        <h3>Recent Expenses</h3>
        <p>Latest recorded activity in the system.</p>
      </div>
      <div className="activity-list">
        {expenses.map((expense) => (
          <div className="activity-item" key={expense.id}>
            <div>
              <strong>{expense.description}</strong>
              <p>
                Paid by {expense.payer} • {expense.participants.length} members
              </p>
            </div>
            <span>₹{expense.amount}</span>
          </div>
        ))}
      </div>
    </section>
  );
}