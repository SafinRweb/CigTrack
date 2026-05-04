// src/components/ShareButton.jsx
import React, { useState } from "react";

export default function ShareButton({ sessionId }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/join/${sessionId}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Join my CigTrack session", url: link });
    } else {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button className="btn-share" onClick={handleShare}>
      {copied ? "✅ Copied!" : "🔗 Share"}
    </button>
  );
}
