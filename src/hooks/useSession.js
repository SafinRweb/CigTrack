// src/hooks/useSession.js
import { useState, useEffect, useCallback } from "react";
import { subscribeToSession } from "../firebase/sessionService";

export const useSession = (sessionId) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    const unsub = subscribeToSession(sessionId, (data) => {
      if (data) {
        setSession(data);
        setError(null);
      } else {
        setError("Session not found");
      }
      setLoading(false);
    });
    return () => unsub();
  }, [sessionId]);

  return { session, loading, error };
};
