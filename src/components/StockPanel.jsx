// src/components/StockPanel.jsx
import React from "react";
import "../styles/components.css";

export default function StockPanel({ stock, isOwner, isActive, onTake, onAddStock }) {
  const total = stock?.reduce((s, i) => s + i.quantity, 0) || 0;

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Storage ({total} sticks remaining)</h3>
        {isOwner && isActive && (
          <button className="btn-secondary" onClick={onAddStock}>+ Add Stock</button>
        )}
      </div>

      {stock?.length === 0 ? (
        <div className="empty-state">No cigarettes in storage</div>
      ) : (
        <div className="stock-grid">
          {stock?.map((item) => (
            <div key={item.brandId} className={`stock-card ${item.quantity === 0 ? "out" : ""}`}>
              <div className="stock-card-name">{item.brandName}</div>
              <div className="stock-card-qty">
                <span className="qty-num">{item.quantity}</span>
                <span className="qty-label">sticks left</span>
              </div>
              <div className="stock-card-price">Tk {item.pricePerStick} / stick</div>
            </div>
          ))}
        </div>
      )}

      {isActive && total > 0 && (
        <button className="btn-primary take-btn" onClick={onTake}>
          🚬 Take Cigarettes
        </button>
      )}
      {!isActive && (
        <div className="session-ended-notice">Session has ended — no more taking!</div>
      )}
    </div>
  );
}
