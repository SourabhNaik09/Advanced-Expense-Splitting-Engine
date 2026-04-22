import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import SummaryCards from "./components/SummaryCards";
import ExpenseForm from "./components/ExpenseForm";
import MembersPanel from "./components/MembersPanel";
import SettlementsTable from "./components/SettlementsTable";
import BalanceChart from "./components/BalanceChart";
import ActivityPanel from "./components/ActivityPanel";

const initialMembers = ["Aarav", "Bhavna", "Charan", "Divya"];

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function App() {
  const [members, setMembers] = useState(initialMembers);
  const [expenses, setExpenses] = useState([
    {
      id: makeId(),
      payer: "Aarav",
      description: "Team dinner",
      amount: 1200,
      splitType: "equal",
      participants: [...initialMembers],
      timestamp: new Date().toISOString()
    },
    {
      id: makeId(),
      payer: "Bhavna",
      description: "Cab fare",
      amount: 600,
      splitType: "equal",
      participants: ["Aarav", "Bhavna", "Charan"],
      timestamp: new Date().toISOString()
    }
  ]);
  const [settlements, setSettlements] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  /* ---- Toast helper ---- */
  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  /* ---- Recalculate settlements on any data change ---- */
  useEffect(() => {
    async function calculate() {
      if (members.length === 0) {
        setSettlements([]);
        setBalances({});
        return;
      }
      setLoading(true);
      try {
        const res = await fetch("/api/settle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ members, expenses })
        });
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        const data = await res.json();
        setSettlements(data.settlements || []);
        setBalances(data.balances || {});
      } catch (error) {
        console.error("Settlement error:", error);
        showToast("Failed to calculate settlements. Is the server running?", "error");
      } finally {
        setLoading(false);
      }
    }
    calculate();
  }, [members, expenses]);

  /* ---- Derived stats ---- */
  const totalExpense = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );

  const pendingSettlements = settlements.length;

  /* ---- Member CRUD ---- */
  function handleAddMember(name) {
    const cleaned = name.trim();
    if (!cleaned || members.includes(cleaned)) {
      if (members.includes(cleaned)) showToast("Member already exists", "error");
      return;
    }
    setMembers((prev) => [...prev, cleaned]);
    showToast(`${cleaned} added to the group`);
  }

  function handleRemoveMember(name) {
    setMembers((prev) => prev.filter((m) => m !== name));
    // Also remove from participants of existing expenses
    setExpenses((prev) =>
      prev.map((exp) => ({
        ...exp,
        participants: exp.participants.filter((p) => p !== name)
      }))
    );
    showToast(`${name} removed from the group`);
  }

  /* ---- Expense CRUD ---- */
  function handleAddExpense(expense) {
    setExpenses((prev) => [
      {
        ...expense,
        id: makeId(),
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
    showToast("Expense added successfully");
  }

  function handleDeleteExpense(id) {
    setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    showToast("Expense deleted");
  }

  return (
    <div className="app-shell">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
      <Header />
      <main className="dashboard-grid">
        <section className="hero">
          <div>
            <span className="eyebrow">⚡ Expense Engine</span>
            <h1>Smart group<br />settlements</h1>
            <p className="hero-copy">
              Add expenses, manage members, and let the graph-based algorithm
              compute the fewest transactions to settle all debts.
            </p>
          </div>
          <div className="hero-badge">
            <span>Algorithm</span>
            <strong>Min Cash Flow</strong>
          </div>
        </section>

        <SummaryCards
          totalExpense={totalExpense}
          membersCount={members.length}
          pendingSettlements={pendingSettlements}
          expenseCount={expenses.length}
        />

        <ExpenseForm members={members} onAddExpense={handleAddExpense} />
        <MembersPanel
          members={members}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
        <SettlementsTable settlements={settlements} loading={loading} />
        <BalanceChart balances={balances} />
        <ActivityPanel expenses={expenses} onDelete={handleDeleteExpense} />
      </main>
    </div>
  );
}