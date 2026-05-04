// src/pages/Session.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { takeCigarettes, addStock, endSession } from "../firebase/sessionService";
import { CIGARETTE_BRANDS } from "../utils/cigarettes";
import StockPanel   from "../components/StockPanel";
import MyBill       from "../components/MyBill";
import MembersPanel from "../components/MembersPanel";
import AddStockModal from "../components/AddStockModal";
import TakeModal    from "../components/TakeModal";
import EndSessionModal from "../components/EndSessionModal";
import ShareButton  from "../components/ShareButton";
import "../styles/Session.css";

export default function Session() {
  const { sessionId } = useParams();
  const navigate      = useNavigate();
  const { session, loading, error } = useSession(sessionId);
  const [memberId, setMemberId]   = useState(null);
  const [tab, setTab]             = useState("stock"); // stock | mybill | members
  const [showAdd, setShowAdd]     = useState(false);
  const [showTake, setShowTake]   = useState(false);
  const [showEnd, setShowEnd]     = useState(false);
  const [feedback, setFeedback]   = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(`member_${sessionId}`);
    if (!stored) navigate(`/join/${sessionId}`, { replace: true });
    else setMemberId(stored);
  }, [sessionId, navigate]);

  const flash = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 2500);
  };

  if (loading) return <div className="center-screen"><div className="spinner" /></div>;
  if (error)   return <div className="center-screen error-msg">{error}</div>;
  if (!session) return null;

  const me      = session.members?.[memberId];
  const isOwner = me?.isOwner;
  const isActive = session.active;
  const availableStock = session.stock?.filter((s) => s.quantity > 0) || [];

  const handleTake = async (brandId, brandName, quantity, pricePerStick) => {
    try {
      await takeCigarettes(sessionId, memberId, brandId, brandName, quantity, pricePerStick);
      flash(`✅ Took ${quantity} x ${brandName}`);
      setTab("mybill");
    } catch (e) {
      flash("❌ " + e.message);
    }
  };

  const handleAddStock = async (brandId, brandName, pricePerStick, qty) => {
    try {
      await addStock(sessionId, brandId, brandName, pricePerStick, qty);
      flash(`✅ Added ${qty} sticks of ${brandName}`);
    } catch (e) {
      flash("❌ " + e.message);
    }
  };

  const handleEndSession = async () => {
    await endSession(sessionId);
    setShowEnd(false);
    setTab("members");
  };

  return (
    <div className="session-page">
      {/* Header */}
      <header className="session-header">
        <div className="session-header-left">
          <span className="brand-mark">🚬</span>
          <div>
            <div className="session-name">{session.name}</div>
            <div className="session-meta">
              {isActive
                ? <span className="badge-active">● LIVE</span>
                : <span className="badge-ended">✓ ENDED</span>}
              <span className="session-owner">by {session.ownerName}</span>
            </div>
          </div>
        </div>
        <div className="session-header-right">
          <ShareButton sessionId={sessionId} />
          {isOwner && isActive && (
            <button className="btn-end" onClick={() => setShowEnd(true)}>End</button>
          )}
        </div>
      </header>

      {/* Feedback toast */}
      {feedback && <div className="toast">{feedback}</div>}

      {/* Tabs */}
      <div className="tabs">
        <button className={tab === "stock"   ? "tab active" : "tab"} onClick={() => setTab("stock")}>
          📦 Stock
        </button>
        <button className={tab === "mybill"  ? "tab active" : "tab"} onClick={() => setTab("mybill")}>
          💸 My Bill
        </button>
        <button className={tab === "members" ? "tab active" : "tab"} onClick={() => setTab("members")}>
          👥 Members
        </button>
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {tab === "stock" && (
          <StockPanel
            stock={session.stock}
            isOwner={isOwner}
            isActive={isActive}
            onTake={() => setShowTake(true)}
            onAddStock={() => setShowAdd(true)}
          />
        )}
        {tab === "mybill" && (
          <MyBill member={me} />
        )}
        {tab === "members" && (
          <MembersPanel members={session.members} isOwner={isOwner} currentMemberId={memberId} />
        )}
      </div>

      {/* Modals */}
      {showTake && (
        <TakeModal
          stock={availableStock}
          onTake={handleTake}
          onClose={() => setShowTake(false)}
        />
      )}
      {showAdd && isOwner && (
        <AddStockModal
          onAdd={handleAddStock}
          onClose={() => setShowAdd(false)}
        />
      )}
      {showEnd && isOwner && (
        <EndSessionModal
          members={session.members}
          onConfirm={handleEndSession}
          onClose={() => setShowEnd(false)}
        />
      )}
    </div>
  );
}
