// src/components/MyBill.jsx
import React from "react";
import "../styles/components.css";

export default function MyBill({ member }) {
  if (!member) return null;
  const takes = member.takes || [];

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>My Bill — {member.name}</h3>
        <div className="total-badge">Tk {member.totalBill || 0}</div>
      </div>

      {takes.length === 0 ? (
        <div className="empty-state">You haven't taken any cigarettes yet.</div>
      ) : (
        <>
          <div className="bill-list">
            {takes.map((t, i) => (
              <div key={i} className="bill-row">
                <div className="bill-row-left">
                  <div className="bill-brand">{t.brandName}</div>
                  <div className="bill-detail">{t.quantity} sticks × Tk {t.pricePerStick}</div>
                </div>
                <div className="bill-amount">Tk {t.amount}</div>
              </div>
            ))}
          </div>
          <div className="bill-total-row">
            <span>Total</span>
            <span className="bill-grand">Tk {member.totalBill}</span>
          </div>
        </>
      )}
    </div>
  );
}
