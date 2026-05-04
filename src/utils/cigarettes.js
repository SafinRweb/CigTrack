// src/utils/cigarettes.js
export const CIGARETTE_BRANDS = [
  { id: "bnh",          name: "Benson & Hedges (B&H)", pricePerStick: 20 },
  { id: "marlboro_adv", name: "Marlboro Advance",       pricePerStick: 20 },
  { id: "gold_leaf",    name: "Gold Leaf",               pricePerStick: 15 },
  { id: "lucky_strike", name: "Lucky Strike",            pricePerStick: 12 },
  { id: "derby",        name: "Derby",                   pricePerStick: 8  },
  { id: "pilot",        name: "Pilot",                   pricePerStick: 8  },
  { id: "hollywood",    name: "Hollywood",               pricePerStick: 8  },
  { id: "royals",       name: "Royals",                  pricePerStick: 7  },
  { id: "camel",        name: "Camel",                   pricePerStick: 10 },
  { id: "maxim",        name: "Maxim",                   pricePerStick: 10 },
  { id: "marlboro_red", name: "Marlboro Red",            pricePerStick: 20 },
  { id: "marlboro_ra",  name: "Marlboro Red Advance",    pricePerStick: 20 },
];

export const getBrandById = (id) =>
  CIGARETTE_BRANDS.find((b) => b.id === id);

export const calculateBill = (takes) => {
  // takes = [{ brandId, quantity, pricePerStick }, ...]
  return takes.reduce((sum, t) => sum + t.quantity * t.pricePerStick, 0);
};
