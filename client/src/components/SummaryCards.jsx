import { IndianRupee, Users, Receipt, ArrowRightLeft } from "lucide-react";
import { useEffect, useRef } from "react";

function AnimatedNumber({ value, prefix = "", suffix = "" }) {
  const spanRef = useRef(null);
  const prevValue = useRef(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = typeof value === "number" ? value : parseFloat(value) || 0;
    const duration = 600;
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);

      if (spanRef.current) {
        spanRef.current.textContent = `${prefix}${current}${suffix}`;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    }

    requestAnimationFrame(animate);
  }, [value, prefix, suffix]);

  return <span ref={spanRef}>{`${prefix}${typeof value === "number" ? value : 0}${suffix}`}</span>;
}

export default function SummaryCards({
  totalExpense,
  membersCount,
  pendingSettlements,
  expenseCount
}) {
  const cards = [
    {
      label: "Total Expense",
      value: totalExpense,
      prefix: "₹",
      icon: IndianRupee
    },
    {
      label: "Members",
      value: membersCount,
      icon: Users
    },
    {
      label: "Expenses",
      value: expenseCount,
      icon: Receipt
    },
    {
      label: "Settlements",
      value: pendingSettlements,
      icon: ArrowRightLeft
    }
  ];

  return (
    <section className="summary-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article className="card summary-card" key={card.label}>
            <div>
              <p>{card.label}</p>
              <h3>
                <AnimatedNumber
                  value={card.value}
                  prefix={card.prefix || ""}
                />
              </h3>
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