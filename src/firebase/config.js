import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-d-76Slz8US1MPIitmjHavpcch-HY58o",
  authDomain: "cigtrack-app.firebaseapp.com",
  projectId: "cigtrack-app",
  storageBucket: "cigtrack-app.firebasestorage.app",
  messagingSenderId: "609973925704",
  appId: "1:609973925704:web:1e52c512afef3a1cdce57d",
  measurementId: "G-C52Y7G14FV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;