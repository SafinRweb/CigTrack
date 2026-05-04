// src/components/AddStockModal.jsx
import React, { useState } from "react";
import { CIGARETTE_BRANDS } from "../utils/cigarettes";
import "../styles/components.css";

export default function AddStockModal({ onAdd, onClose }) {
  const [brandId, setBrandId]   = useState(CIGARETTE_BRANDS[0].id);
  const [quantity, setQuantity] = useState(10);

  const brand = CIGARETTE_BRANDS.find((b) => b.id === brandId);

  const handleSubmit = () => {
    if (!brand || quantity < 1) return;
    onAdd(brand.id, brand.name, brand.pricePerStick, Number(quantity));
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>📦 Add to Storage</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="field">
          <label>Brand</label>
          <select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
            {CIGARETTE_BRANDS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} — Tk {b.pricePerStick}/stick
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Quantity to Add</label>
          <div className="qty-stepper">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
        </div>

        <div className="take-preview">
          <span>Adding {quantity} sticks of {brand?.name}</span>
          <span className="take-cost">Tk {quantity * (brand?.pricePerStick || 0)} value</span>
        </div>

        <button className="btn-primary" onClick={handleSubmit}>
          Add to Storage
        </button>
      </div>
    </div>
  );
}
