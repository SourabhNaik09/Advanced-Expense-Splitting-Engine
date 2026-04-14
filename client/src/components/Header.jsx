import { WalletCards } from "lucide-react";

export default function Header() {
  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-icon">
          <WalletCards size={20} />
        </div>
        <div>
          <h2>Expense Split Dashboard</h2>
          <p>Full-stack internship project</p>
        </div>
      </div>
      <div className="topbar-chip">React + Express + Algorithm</div>
    </header>
  );
}