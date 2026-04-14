import { IndianRupee, Users, Layers3, ArrowRightLeft } from "lucide-react";

export default function SummaryCards({
  totalExpense,
  membersCount,
  activeGroups,
  pendingSettlements
}) {
  const cards = [
    { label: "Total Expense", value: `₹${totalExpense}`, icon: IndianRupee },
    { label: "Members", value: membersCount, icon: Users },
    { label: "Groups", value: activeGroups, icon: Layers3 },
    { label: "Settlements", value: pendingSettlements, icon: ArrowRightLeft }
  ];

  return (
    <section className="summary-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article className="card summary-card" key={card.label}>
            <div>
              <p>{card.label}</p>
              <h3>{card.value}</h3>
            </div>
            <div className="summary-icon">
              <Icon size={20} />
            </div>
          </article>
        );
      })}
    </section>
  );
}