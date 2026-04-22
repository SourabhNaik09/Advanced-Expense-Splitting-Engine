export function calculateSettlements(members, expenses) {
  const balances = Object.fromEntries(members.map((member) => [member, 0]));

  for (const expense of expenses) {
    const amount = Number(expense.amount);
    const payer = expense.payer;
    const splitType = expense.splitType || "equal";
    const participants = expense.participants?.length
      ? expense.participants
      : members;

    // Credit the payer
    balances[payer] = (balances[payer] || 0) + amount;

    if (splitType === "custom" && expense.customAmounts) {
      // Custom: each participant owes their specified amount
      for (const [person, customAmt] of Object.entries(expense.customAmounts)) {
        if (balances[person] !== undefined) {
          balances[person] -= Number(customAmt);
        }
      }
    } else if (splitType === "percentage" && expense.percentages) {
      // Percentage: each participant owes their percentage of the total
      for (const [person, pct] of Object.entries(expense.percentages)) {
        if (balances[person] !== undefined) {
          balances[person] -= Math.round((amount * Number(pct)) / 100 * 100) / 100;
        }
      }
    } else {
      // Equal split (default)
      const share = amount / participants.length;
      for (const person of participants) {
        if (balances[person] !== undefined) {
          balances[person] -= share;
        }
      }
    }
  }

  // Separate into creditors and debtors
  const creditors = [];
  const debtors = [];

  for (const [name, balance] of Object.entries(balances)) {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded > 0) creditors.push({ name, amount: rounded });
    if (rounded < 0) debtors.push({ name, amount: Math.abs(rounded) });
  }

  // Sort descending for greedy matching
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // Greedy minimum cash-flow settlement
  const settlements = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.amount, creditor.amount);

    settlements.push({
      from: debtor.name,
      to: creditor.name,
      amount: Math.round(amount * 100) / 100
    });

    debtor.amount = Math.round((debtor.amount - amount) * 100) / 100;
    creditor.amount = Math.round((creditor.amount - amount) * 100) / 100;

    if (debtor.amount <= 0.01) i += 1;
    if (creditor.amount <= 0.01) j += 1;
  }

  return { balances, settlements };
}