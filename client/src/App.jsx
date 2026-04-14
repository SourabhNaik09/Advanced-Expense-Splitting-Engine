import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import SummaryCards from "./components/SummaryCards";
import ExpenseForm from "./components/ExpenseForm";
import MembersPanel from "./components/MembersPanel";
import SettlementsTable from "./components/SettlementsTable";
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function calculate() {
      setLoading(true);
      try {
        const res = await fetch("/api/settle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ members, expenses })
        });
        const data = await res.json();
        setSettlements(data.settlements || []);
      } catch (error) {
        console.error("Settlement error:", error);
      } finally {
        setLoading(false);
      }
    }
    calculate();
  }, [members, expenses]);

  const totalExpense = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [expenses]
  );

  const activeGroups = 1;
  const pendingSettlements = settlements.length;

  function handleAddMember(name) {
    const cleaned = name.trim();
    if (!cleaned || members.includes(cleaned)) return;
    setMembers((prev) => [...prev, cleaned]);
  }

  function handleAddExpense(expense) {
    setExpenses((prev) => [
      {
        ...expense,
        id: makeId(),
        timestamp: new Date().toISOString()
      },
      ...prev
    ]);
  }

  return (
    <div className="app-shell">
      <Header />
      <main className="dashboard-grid">
        <section className="hero card">
          <div>
            <p className="eyebrow">Smart financial coordination</p>
            <h1>Advance Expense Splitting Engine</h1>
            <p className="hero-copy">
              Track group expenses, compute net balances, and generate minimum
              settlement transactions through an optimized workflow.
            </p>
          </div>
          <div className="hero-badge">
            <span>Algorithm</span>
            <strong>Minimum Cash Flow</strong>
          </div>
        </section>

        <SummaryCards
          totalExpense={totalExpense}
          membersCount={members.length}
          activeGroups={activeGroups}
          pendingSettlements={pendingSettlements}
        />

        <ExpenseForm members={members} onAddExpense={handleAddExpense} />
        <MembersPanel members={members} onAddMember={handleAddMember} />
        <SettlementsTable settlements={settlements} loading={loading} />
        <ActivityPanel expenses={expenses} />
      </main>
    </div>
  );
}