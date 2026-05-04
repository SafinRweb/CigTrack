// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CIGARETTE_BRANDS } from "../utils/cigarettes";
import { createSession } from "../firebase/sessionService";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  // ── Create session state ──────────────────────────────────────
  const [sessionName, setSessionName] = useState("");
  const [ownerName, setOwnerName]     = useState("");
  const [stock, setStock]             = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(CIGARETTE_BRANDS[0].id);
  const [quantity, setQuantity]       = useState(10);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  // ── Join via link state ───────────────────────────────────────
  const [joinLink, setJoinLink] = useState("");
  const [joinError, setJoinError] = useState("");

  // ── PWA install state ─────────────────────────────────────────
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled]     = useState(false);

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) { setShowIOSGuide(true); return; }
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setIsInstalled(true);
    setInstallPrompt(null);
  };

  // ── Join via pasted link ──────────────────────────────────────
  const handleJoinLink = () => {
    setJoinError("");
    const trimmed = joinLink.trim();
    if (!trimmed) return setJoinError("Paste a session link first");
    try {
      const url = new URL(trimmed);
      const match = url.pathname.match(/\/(join|session)\/([^/]+)/);
      if (!match) throw new Error();
      navigate(`/join/${match[2]}`);
    } catch {
      setJoinError("Doesn't look like a valid CigTrack link");
    }
  };

  // ── Stock helpers ─────────────────────────────────────────────
  const addStockItem = () => {
    const brand = CIGARETTE_BRANDS.find((b) => b.id === selectedBrand);
    const existing = stock.find((s) => s.brandId === selectedBrand);
    if (existing) {
      setStock(stock.map((s) =>
        s.brandId === selectedBrand ? { ...s, quantity: s.quantity + Number(quantity) } : s
      ));
    } else {
      setStock([...stock, {
        brandId: brand.id, brandName: brand.name,
        pricePerStick: brand.pricePerStick, quantity: Number(quantity),
      }]);
    }
  };

  const removeStockItem = (brandId) => setStock(stock.filter((s) => s.brandId !== brandId));

  const handleCreate = async () => {
    if (!sessionName.trim()) return setError("Session name required");
    if (!ownerName.trim())   return setError("Your name is required");
    if (stock.length === 0)  return setError("Add at least one brand to storage");
    setError("");
    setLoading(true);
    try {
      const { sessionId, memberId } = await createSession({ sessionName, ownerName, stock });
      localStorage.setItem(`member_${sessionId}`, memberId);
      navigate(`/session/${sessionId}`);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const totalSticks = stock.reduce((s, i) => s + i.quantity, 0);
  const totalValue  = stock.reduce((s, i) => s + i.quantity * i.pricePerStick, 0);

  // ── Bottom sheet picker state ─────────────────────────────────
  const [showPicker, setShowPicker] = useState(false);
  const selectedBrandObj = CIGARETTE_BRANDS.find((b) => b.id === selectedBrand);

  return (
    <div className="home-page">
      <div className="bg-glow" />
      <div className="bg-grid" />

      {/* ── Hero ── */}
      <header className="hero">
        <h1 className="hero-title">
          <span className="cig-icon">🚬</span>
          CigTrack
        </h1>
        <p className="hero-desc">
          Start a session · Share the link · Split the bill
        </p>

        {/* Install button — mobile only, hidden if already installed */}
        {!isInstalled && (isIOS || installPrompt) && (
          <button className="install-btn" onClick={handleInstall}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 3v13M7 11l5 5 5-5"/><path d="M5 21h14"/>
            </svg>
            {isIOS ? "Add to Home Screen" : "Install App"}
          </button>
        )}
        {isInstalled && (
          <div className="installed-pill">✓ Running as installed app</div>
        )}
      </header>

      {/* ── Join via link ── */}
      <section className="home-section">
        <div className="section-eyebrow">Got an invite link?</div>
        <div className="join-row">
          <input
            className="join-input"
            placeholder="Paste session link here…"
            value={joinLink}
            onChange={(e) => { setJoinLink(e.target.value); setJoinError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleJoinLink()}
          />
          <button className="join-btn" onClick={handleJoinLink}>Go →</button>
        </div>
        {joinError && <p className="field-error">{joinError}</p>}
      </section>

      {/* ── Divider ── */}
      <div className="or-divider"><span>or start a new session</span></div>

      {/* ── Create session ── */}
      <section className="home-section create-section">
        <div className="section-eyebrow">New Session</div>

        <div className="field-group">
          <label className="field-label">Session Name</label>
          <input
            className="field-input"
            placeholder="e.g. Friday night at Raju's"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
        </div>

        <div className="field-group">
          <label className="field-label">Your Name (You're the owner)</label>
          <input
            className="field-input"
            placeholder="e.g. Rakib"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
        </div>

        {/* Stock picker */}
        <div className="stock-block">
          <label className="field-label">Add Cigarettes to Storage</label>

          {/* Custom bottom-sheet trigger instead of <select> */}
          <button className="brand-picker-trigger" onClick={() => setShowPicker(true)}>
            <span className="picker-selected">
              <span className="picker-name">{selectedBrandObj.name}</span>
              <span className="picker-price">Tk {selectedBrandObj.pricePerStick}/stick</span>
            </span>
            <span className="picker-chevron">▾</span>
          </button>

          <div className="qty-row">
            <div className="qty-stepper">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <input
                type="number" min="1" value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              />
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className="add-btn" onClick={addStockItem}>+ Add</button>
          </div>
        </div>

        {stock.length > 0 && (
          <div className="stock-list">
            {stock.map((s) => (
              <div key={s.brandId} className="stock-row">
                <div className="stock-row-info">
                  <span className="stock-row-name">{s.brandName}</span>
                  <span className="stock-row-qty">{s.quantity} sticks</span>
                </div>
                <div className="stock-row-right">
                  <span className="stock-row-val">Tk {s.quantity * s.pricePerStick}</span>
                  <button className="stock-remove" onClick={() => removeStockItem(s.brandId)}>✕</button>
                </div>
              </div>
            ))}
            <div className="stock-totals">
              <span>{totalSticks} sticks total</span>
              <span>Tk {totalValue} value</span>
            </div>
          </div>
        )}

        {error && <p className="field-error">{error}</p>}

        <button className="create-btn" onClick={handleCreate} disabled={loading}>
          {loading ? <span className="btn-loader" /> : "🔥  Start Session"}
        </button>
      </section>

      <p className="home-footer">CigTrack · Powered by Firebase</p>

      {/* ── iOS install guide ── */}
      {showIOSGuide && (
        <div className="sheet-overlay" onClick={() => setShowIOSGuide(false)}>
          <div className="sheet ios-guide" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">Add to Home Screen</div>
            <div className="ios-steps">
              <div className="ios-step">
                <div className="ios-step-num">1</div>
                <div className="ios-step-text">
                  Tap the <strong>Share</strong> button at the bottom of Safari
                  <span className="ios-icon-hint">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                  </span>
                </div>
              </div>
              <div className="ios-step">
                <div className="ios-step-num">2</div>
                <div className="ios-step-text">Scroll down and tap <strong>"Add to Home Screen"</strong></div>
              </div>
              <div className="ios-step">
                <div className="ios-step-num">3</div>
                <div className="ios-step-text">Tap <strong>"Add"</strong> — done! Open it from your home screen like any app.</div>
              </div>
            </div>
            <div className="ios-note">⚠️ Must be opened in Safari, not Chrome</div>
            <button className="create-btn" style={{marginTop: 16}} onClick={() => setShowIOSGuide(false)}>Got it</button>
          </div>
        </div>
      )}

      {/* ── Bottom sheet brand picker ── */}
      {showPicker && (
        <div className="sheet-overlay" onClick={() => setShowPicker(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">Select Brand</div>
            <div className="sheet-list">
              {CIGARETTE_BRANDS.map((b) => (
                <button
                  key={b.id}
                  className={`sheet-item ${b.id === selectedBrand ? "active" : ""}`}
                  onClick={() => { setSelectedBrand(b.id); setShowPicker(false); }}
                >
                  <span className="sheet-item-name">{b.name}</span>
                  <span className="sheet-item-price">Tk {b.pricePerStick}/stick</span>
                  {b.id === selectedBrand && <span className="sheet-check">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
