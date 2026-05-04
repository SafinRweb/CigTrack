// src/components/MembersPanel.jsx
import React from "react";
import "../styles/components.css";

export default function MembersPanel({ members, isOwner, currentMemberId }) {
  if (!members) return null;
  const memberList = Object.entries(members).sort((a, b) =>
    b[1].totalBill - a[1].totalBill
  );
  const grandTotal = memberList.reduce((s, [, m]) => s + (m.totalBill || 0), 0);

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>All Members ({memberList.length})</h3>
        <div className="total-badge">Total: Tk {grandTotal}</div>
      </div>

      <div className="members-list">
        {memberList.map(([id, member]) => (
          <div key={id} className={`member-card ${id === currentMemberId ? "me" : ""}`}>
            <div className="member-card-left">
              <div className="member-avatar">{member.name[0].toUpperCase()}</div>
              <div>
                <div className="member-name">
                  {member.name}
                  {member.isOwner && <span className="owner-tag">OWNER</span>}
                  {id === currentMemberId && <span className="you-tag">YOU</span>}
                </div>
                <div className="member-sticks">
                  {member.takes?.reduce((s, t) => s + t.quantity, 0) || 0} sticks total
                </div>
              </div>
            </div>
            <div className="member-bill">Tk {member.totalBill || 0}</div>
          </div>
        ))}
      </div>

      {/* Breakdown per member (visible to owner) */}
      {isOwner && (
        <div className="owner-summary">
          <div className="divider">Bill Summary</div>
          {memberList.map(([id, member]) => (
            <div key={id} className="summary-row">
              <span>{member.name}</span>
              <span className="summary-bill">Tk {member.totalBill || 0}</span>
            </div>
          ))}
          <div className="summary-row grand">
            <span>Grand Total</span>
            <span>Tk {grandTotal}</span>
          </div>
        </div>
      )}
    </div>
  );
}
