import { useState } from "react";

export default function MembersPanel({ members, onExpenseAdd }) {
  const [form, setForm] = useState({
    payer: members[0] || "",
    description: "",
    amount: "",
    splitType: "equal",
    participants: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onExpenseAdd({
      payer: form.payer,
      description: form.description,
      amount: Number(form.amount),
      participants: form.participants.length ? form.participants : members
    });

    setForm((prev) => ({
      ...prev,
      description: "",
      amount: "",
      splitType: "equal"
    }));
  }

  return (
    <section className="card panel-span-2">
      <div className="section-head">
        <h3>Add Expense</h3>
        <p>Capture payer, amount, and expense description.</p>
      </div>
      <form className="expense-form" onSubmit={handleSubmit}>
        <label>
          Payer
          <select name="payer" value={form.payer} onChange={handleChange}>
            {members.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </label>

        <label>
          Description
          <input
            type="text"
            name="description"
            placeholder="Dinner, fuel, subscription..."
            value={form.description}
            onChange={handleChange}
          />
        </label>

        <label>
          Amount
          <input
            type="number"
            name="amount"
            placeholder="Enter amount"
            value={form.amount}
            onChange={handleChange}
            min="1"
          />
        </label>

        <label>
          Split Type
          <select name="splitType" value={form.splitType} onChange={handleChange}>
            <option value="equal">Equal</option>
            <option value="custom">Custom</option>
            <option value="percentage">Percentage</option>
          </select>
        </label>

        <button type="submit">Add Expense</button>
      </form>
    </section>
  );
}