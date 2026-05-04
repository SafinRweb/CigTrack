// src/components/TakeModal.jsx
import React, { useState } from "react";
import "../styles/components.css";

export default function TakeModal({ stock, onTake, onClose }) {
  const [selectedBrand, setSelectedBrand] = useState(stock[0]?.brandId || "");
  const [quantity, setQuantity] = useState(1);

  const brand = stock.find((s) => s.brandId === selectedBrand);
  const total = brand ? brand.pricePerStick * quantity : 0;
  const maxQty = brand?.quantity || 1;

  const handleSubmit = () => {
    if (!brand || quantity < 1) return;
    onTake(brand.brandId, brand.brandName, Number(quantity), brand.pricePerStick);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🚬 Take Cigarettes</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="field">
          <label>Brand</label>
          <select value={selectedBrand} onChange={(e) => { setSelectedBrand(e.target.value); setQuantity(1); }}>
            {stock.map((s) => (
              <option key={s.brandId} value={s.brandId}>
                {s.brandName} ({s.quantity} left) — Tk {s.pricePerStick}/stick
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>How many sticks?</label>
          <div className="qty-stepper">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
            <input
              type="number"
              min="1"
              max={maxQty}
              value={quantity}
              onChange={(e) => setQuantity(Math.min(maxQty, Math.max(1, Number(e.target.value))))}
            />
            <button onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}>+</button>
          </div>
        </div>

        <div className="take-preview">
          <span>{quantity} stick{quantity > 1 ? "s" : ""} of {brand?.brandName}</span>
          <span className="take-cost">= Tk {total}</span>
        </div>

        <button className="btn-primary" onClick={handleSubmit}>
          Confirm Take
        </button>
      </div>
    </div>
  );
}
