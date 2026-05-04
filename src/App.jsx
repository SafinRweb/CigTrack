// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home    from "./pages/Home";
import Join    from "./pages/Join";
import Session from "./pages/Session";
import "./styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<Home />} />
        <Route path="/join/:sessionId"   element={<Join />} />
        <Route path="/session/:sessionId" element={<Session />} />
        <Route path="*"                  element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
