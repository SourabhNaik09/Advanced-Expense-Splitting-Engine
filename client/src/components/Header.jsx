import { WalletCards, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <header className="topbar">
      <div className="brand">
        <div className="brand-icon">
          <WalletCards size={18} />
        </div>
        <div>
          <h2>SplitWise Engine</h2>
          <p>Minimum cash-flow settlements</p>
        </div>
      </div>
      <div className="topbar-actions">
        <div className="topbar-chip">v1.0</div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}