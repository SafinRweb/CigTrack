// src/pages/Join.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSession, joinSession } from "../firebase/sessionService";
import "../styles/Join.css";

export default function Join() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [memberName, setMemberName] = useState("");
  const [session, setSession]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [joining, setJoining]       = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    // If already a member, go straight to session
    const stored = localStorage.getItem(`member_${sessionId}`);
    if (stored) {
      navigate(`/session/${sessionId}`, { replace: true });
      return;
    }
    getSession(sessionId).then((data) => {
      if (!data) setError("Session not found or expired.");
      else if (!data.active) setError("This session has already ended.");
      else setSession(data);
      setLoading(false);
    });
  }, [sessionId, navigate]);

  const handleJoin = async () => {
    if (!memberName.trim()) return setError("Enter your name");
    setError("");
    setJoining(true);
    try {
      const { memberId } = await joinSession(sessionId, memberName.trim());
      localStorage.setItem(`member_${sessionId}`, memberId);
      navigate(`/session/${sessionId}`, { replace: true });
    } catch (e) {
      setError(e.message);
    }
    setJoining(false);
  };

  if (loading) return <div className="center-screen"><div className="spinner" /></div>;

  return (
    <div className="join-page">
      <div className="join-card">
        <div className="join-icon">🚬</div>
        {error ? (
          <>
            <h2 className="join-title">Oops!</h2>
            <p className="join-error">{error}</p>
            <button className="btn-primary" onClick={() => navigate("/")}>Go Home</button>
          </>
        ) : (
          <>
            <h2 className="join-title">You're invited!</h2>
            <p className="join-session-name">"{session?.name}"</p>
            <p className="join-owner">Started by <strong>{session?.ownerName}</strong></p>

            <div className="field">
              <label>Your Name</label>
              <input
                placeholder="e.g. Raju"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                autoFocus
              />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn-primary" onClick={handleJoin} disabled={joining}>
              {joining ? "Joining..." : "Join Session →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
