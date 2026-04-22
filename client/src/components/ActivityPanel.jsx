import { Trash2 } from "lucide-react";

export default function ActivityPanel({ expenses, onDelete }) {
  function formatTime(iso) {
    const date = new Date(iso);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  const splitLabels = {
    equal: "Equal",
    custom: "Custom",
    percentage: "Percentage"
  };

  return (
    <section className="card">
      <div className="section-head">
        <h3>Expense History</h3>
        <p>All recorded group expenses, newest first.</p>
      </div>
      <div className="activity-list">
        {expenses.length === 0 ? (
          <p className="muted">No expenses recorded yet.</p>
        ) : (
          expenses.map((expense) => (
            <div className="activity-item" key={expense.id}>
              <div>
                <strong>{expense.description}</strong>
                <p>
                  Paid by {expense.payer} • {expense.participants.length} members
                  {expense.splitType !== "equal" && (
                    <> • <span className="pill" style={{ fontSize: "0.7rem", padding: "3px 8px" }}>
                      {splitLabels[expense.splitType] || expense.splitType}
                    </span></>
                  )}
                </p>
                <span className="activity-timestamp">
                  {formatTime(expense.timestamp)}
                </span>
              </div>
              <div className="activity-right">
                <span className="activity-amount">₹{expense.amount}</span>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(expense.id)}
                  aria-label="Delete expense"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}