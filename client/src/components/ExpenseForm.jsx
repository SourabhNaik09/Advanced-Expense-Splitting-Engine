import { useState } from "react";

export default function ExpenseForm({ members, onAddExpense }) {
  const [form, setForm] = useState({
    payer: members[0] || "",
    description: "",
    amount: "",
    splitType: "equal",
    participants: [...members]
  });

  const [customAmounts, setCustomAmounts] = useState({});
  const [percentages, setPercentages] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const toggleParticipant = (member) => {
    setForm((prev) => {
      const has = prev.participants.includes(member);
      return {
        ...prev,
        participants: has
          ? prev.participants.filter((p) => p !== member)
          : [...prev.participants, member]
      };
    });
  };

  const handleCustomAmount = (member, value) => {
    setCustomAmounts((prev) => ({ ...prev, [member]: value }));
  };

  const handlePercentage = (member, value) => {
    setPercentages((prev) => ({ ...prev, [member]: value }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!form.amount || Number(form.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (form.participants.length === 0) {
      newErrors.participants = "Select at least one participant";
    }

    if (form.splitType === "custom") {
      const total = form.participants.reduce(
        (sum, p) => sum + Number(customAmounts[p] || 0), 0
      );
      const diff = Math.abs(total - Number(form.amount));
      if (diff > 0.01) {
        newErrors.custom = `Custom amounts (₹${total}) must equal the total (₹${form.amount})`;
      }
    }

    if (form.splitType === "percentage") {
      const total = form.participants.reduce(
        (sum, p) => sum + Number(percentages[p] || 0), 0
      );
      if (Math.abs(total - 100) > 0.01) {
        newErrors.percentage = `Percentages must add up to 100% (currently ${total}%)`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const expense = {
      payer: form.payer,
      description: form.description.trim(),
      amount: Number(form.amount),
      splitType: form.splitType,
      participants: form.participants
    };

    if (form.splitType === "custom") {
      expense.customAmounts = {};
      form.participants.forEach((p) => {
        expense.customAmounts[p] = Number(customAmounts[p] || 0);
      });
    }

    if (form.splitType === "percentage") {
      expense.percentages = {};
      form.participants.forEach((p) => {
        expense.percentages[p] = Number(percentages[p] || 0);
      });
    }

    onAddExpense(expense);

    setForm((prev) => ({
      ...prev,
      description: "",
      amount: "",
      splitType: "equal"
    }));
    setCustomAmounts({});
    setPercentages({});
    setErrors({});
  };

  return (
    <section className="card panel-span-2">
      <div className="section-head">
        <h3>New Expense</h3>
        <p>Who paid, how much, and how should the cost be divided?</p>
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
          {errors.description && (
            <span className="validation-error">{errors.description}</span>
          )}
        </label>

        <label>
          Amount (₹)
          <input
            type="number"
            name="amount"
            placeholder="Enter amount"
            value={form.amount}
            onChange={handleChange}
            min="1"
            step="0.01"
          />
          {errors.amount && (
            <span className="validation-error">{errors.amount}</span>
          )}
        </label>

        <label>
          Split Type
          <select name="splitType" value={form.splitType} onChange={handleChange}>
            <option value="equal">Equal</option>
            <option value="custom">Custom Amounts</option>
            <option value="percentage">Percentage</option>
          </select>
        </label>

        {/* Participant selector */}
        <div className="full-width">
          <label>Participants</label>
          <div className="participant-checkboxes">
            {members.map((member) => (
              <label key={member}>
                <input
                  type="checkbox"
                  checked={form.participants.includes(member)}
                  onChange={() => toggleParticipant(member)}
                />
                {member}
              </label>
            ))}
          </div>
          {errors.participants && (
            <span className="validation-error">{errors.participants}</span>
          )}
        </div>

        {/* Custom amounts per participant */}
        {form.splitType === "custom" && (
          <div className="full-width">
            <label>Custom Amounts</label>
            <div className="split-inputs">
              {form.participants.map((person) => (
                <div className="split-input-row" key={person}>
                  <span>{person}</span>
                  <input
                    type="number"
                    placeholder="₹0"
                    value={customAmounts[person] || ""}
                    onChange={(e) => handleCustomAmount(person, e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}
            </div>
            {errors.custom && (
              <span className="validation-error">{errors.custom}</span>
            )}
          </div>
        )}

        {/* Percentage per participant */}
        {form.splitType === "percentage" && (
          <div className="full-width">
            <label>Percentage Split</label>
            <div className="split-inputs">
              {form.participants.map((person) => (
                <div className="split-input-row" key={person}>
                  <span>{person}</span>
                  <input
                    type="number"
                    placeholder="0%"
                    value={percentages[person] || ""}
                    onChange={(e) => handlePercentage(person, e.target.value)}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              ))}
            </div>
            {errors.percentage && (
              <span className="validation-error">{errors.percentage}</span>
            )}
          </div>
        )}

        <button type="submit">Add Expense</button>
      </form>
    </section>
  );
}