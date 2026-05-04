// src/firebase/sessionService.js
import {
  doc,
  collection,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { db } from "./config";
import { v4 as uuidv4 } from "uuid";

// ── Create a new session ──────────────────────────────────────────────────────
export const createSession = async ({ sessionName, ownerName, stock }) => {
  const ownerId = uuidv4();
  const sessionRef = doc(collection(db, "sessions"));

  const members = {
    [ownerId]: {
      name: ownerName,
      isOwner: true,
      joinedAt: Date.now(),
      takes: [],    // [{ brandId, brandName, quantity, pricePerStick, takenAt }]
      totalBill: 0,
    },
  };

  await setDoc(sessionRef, {
    id: sessionRef.id,
    name: sessionName,
    ownerName,
    ownerId,
    stock,          // [{ brandId, brandName, pricePerStick, quantity }]
    members,
    active: true,
    createdAt: serverTimestamp(),
    endedAt: null,
  });

  return { sessionId: sessionRef.id, memberId: ownerId };
};

// ── Join an existing session ──────────────────────────────────────────────────
export const joinSession = async (sessionId, memberName) => {
  const sessionRef = doc(db, "sessions", sessionId);
  const snap = await getDoc(sessionRef);
  if (!snap.exists()) throw new Error("Session not found");
  const data = snap.data();
  if (!data.active) throw new Error("Session has already ended");

  const memberId = uuidv4();
  await updateDoc(sessionRef, {
    [`members.${memberId}`]: {
      name: memberName,
      isOwner: false,
      joinedAt: Date.now(),
      takes: [],
      totalBill: 0,
    },
  });

  return { sessionId, memberId };
};

// ── Take cigarettes from stock ────────────────────────────────────────────────
export const takeCigarettes = async (sessionId, memberId, brandId, brandName, quantity, pricePerStick) => {
  const sessionRef = doc(db, "sessions", sessionId);
  const snap = await getDoc(sessionRef);
  const data = snap.data();

  // Check stock
  const stockItem = data.stock.find((s) => s.brandId === brandId);
  if (!stockItem || stockItem.quantity < quantity)
    throw new Error("Not enough stock!");

  // Deduct from stock
  const updatedStock = data.stock.map((s) =>
    s.brandId === brandId ? { ...s, quantity: s.quantity - quantity } : s
  );

  const takeEntry = {
    brandId,
    brandName,
    quantity,
    pricePerStick,
    amount: quantity * pricePerStick,
    takenAt: Date.now(),
  };

  const member = data.members[memberId];
  const newTakes = [...(member.takes || []), takeEntry];
  const newBill = newTakes.reduce((s, t) => s + t.amount, 0);

  await updateDoc(sessionRef, {
    stock: updatedStock,
    [`members.${memberId}.takes`]: newTakes,
    [`members.${memberId}.totalBill`]: newBill,
  });
};

// ── Add more stock (owner only) ───────────────────────────────────────────────
export const addStock = async (sessionId, brandId, brandName, pricePerStick, quantityToAdd) => {
  const sessionRef = doc(db, "sessions", sessionId);
  const snap = await getDoc(sessionRef);
  const data = snap.data();

  const existing = data.stock.find((s) => s.brandId === brandId);
  let updatedStock;
  if (existing) {
    updatedStock = data.stock.map((s) =>
      s.brandId === brandId ? { ...s, quantity: s.quantity + quantityToAdd } : s
    );
  } else {
    updatedStock = [...data.stock, { brandId, brandName, pricePerStick, quantity: quantityToAdd }];
  }

  await updateDoc(sessionRef, { stock: updatedStock });
};

// ── End session (owner only) ──────────────────────────────────────────────────
export const endSession = async (sessionId) => {
  const sessionRef = doc(db, "sessions", sessionId);
  await updateDoc(sessionRef, { active: false, endedAt: serverTimestamp() });
};

// ── Real-time session listener ────────────────────────────────────────────────
export const subscribeToSession = (sessionId, callback) => {
  const sessionRef = doc(db, "sessions", sessionId);
  return onSnapshot(sessionRef, (snap) => {
    if (snap.exists()) callback(snap.data());
    else callback(null);
  });
};

// ── Get session once ──────────────────────────────────────────────────────────
export const getSession = async (sessionId) => {
  const snap = await getDoc(doc(db, "sessions", sessionId));
  return snap.exists() ? snap.data() : null;
};
