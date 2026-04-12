# Expense Simplifier
### Graph-based debt optimization engine

A web app that takes overlapping group debts and runs a **net-balance reduction algorithm** to find the minimum number of transactions needed to settle up.

---

## 🚀 How to Run

No build step needed. Just open the file in your browser:

```bash
# Option 1 — Double-click
open index.html

# Option 2 — VS Code Live Server
# Install "Live Server" extension → right-click index.html → Open with Live Server

# Option 3 — Python local server
python3 -m http.server 3000
# Then visit http://localhost:3000
```

---

## 📁 Project Structure

```
expense-splitter/
├── index.html        ← Main HTML (all tabs, modals, layout)
├── css/
│   └── style.css     ← All styles (responsive, animations)
├── js/
│   └── app.js        ← Algorithm + all rendering logic
└── README.md
```

---

## ⚙️ Algorithm

**Net-Balance Reduction — O(n log n)**

1. Compute each person's net balance (total received − total paid)
2. Split into **creditors** (positive) and **debtors** (negative)
3. Greedily match the largest debtor to the largest creditor
4. Settle as much as possible in one transaction, repeat
5. Result: **at most n−1 transactions** for n people (provably optimal)

---

## ✨ Features

| Feature | Description |
|---|---|
| Add / Remove People | Color-coded group members |
| Add Expenses | Paid-by + flexible split-among selection |
| Graph View | Original vs Optimized debt graph (canvas) |
| Analysis | Bar chart + individual balance cards |
| Settlement | Minimum transaction plan + % reduction |
| Responsive | Works on mobile and desktop |

---

## 🛠 Tech Stack

- **Vanilla HTML / CSS / JS** — zero dependencies, no build step
- **Canvas API** — graph and bar chart rendering
- **Google Fonts** — Inter typeface

---

## 📄 License

MIT
