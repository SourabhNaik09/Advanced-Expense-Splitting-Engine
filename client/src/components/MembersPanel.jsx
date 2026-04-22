import { useState } from "react";
import { UserPlus, X } from "lucide-react";

export default function MembersPanel({ members, onAddMember, onRemoveMember }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddMember(name);
    setName("");
  };

  return (
    <section className="card">
      <div className="section-head">
        <h3>Members</h3>
        <p>Manage the people in your group.</p>
      </div>
      <div className="member-list">
        {members.map((member) => (
          <div className="pill member-pill" key={member}>
            <span>{member}</span>
            <button
              className="pill-remove"
              onClick={() => onRemoveMember(member)}
              aria-label={`Remove ${member}`}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <form className="inline-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add a member..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">
          <UserPlus size={16} />
          <span>Add</span>
        </button>
      </form>
    </section>
  );
}