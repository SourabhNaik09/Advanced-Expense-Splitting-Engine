export function calculateSettlements(members, expenses) {
  const balances = Object.fromEntries(members.map((member) => [member, 0]));

  for (const expense of expenses) {
    const participants = expense.participants?.length
      ? expense.participants
      : members;

    const share = Number(expense.amount) / participants.length;
    balances[expense.payer] += Number(expense.amount);

    for (const person of participants) {
      balances[person] -= share;
    }
  }

  const creditors = [];
  const debtors = [];

  for (const [name, balance] of Object.entries(balances)) {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded > 0) creditors.push({ name, amount: rounded });
    if (rounded < 0) debtors.push({ name, amount: Math.abs(rounded) });
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

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