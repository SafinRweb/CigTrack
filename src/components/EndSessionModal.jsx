// src/components/EndSessionModal.jsx
import React from "react";
import "../styles/components.css";

export default function EndSessionModal({ members, onConfirm, onClose }) {
  const memberList = Object.values(members || {});
  const grandTotal = memberList.reduce((s, m) => s + (m.totalBill || 0), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🏁 End Session?</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <p className="modal-desc">Final bills before ending:</p>

        <div className="bill-list">
          {memberList.map((m, i) => (
            <div key={i} className="bill-row">
              <div className="bill-brand">{m.name}{m.isOwner ? " 👑" : ""}</div>
              <div className="bill-amount">Tk {m.totalBill || 0}</div>
            </div>
          ))}
        </div>

        <div className="bill-total-row">
          <span>Grand Total</span>
          <span className="bill-grand">Tk {grandTotal}</span>
        </div>

        <p className="warn-text">⚠️ Once ended, no one can take more cigarettes!</p>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>End Session</button>
        </div>
      </div>
    </div>
  );
}
