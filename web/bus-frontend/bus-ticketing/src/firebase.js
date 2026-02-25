import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBr80r1w1Ns_H6iKOfFPEdBkEtIxmgkarU",
  authDomain: "bus-ticket-issuing-system.firebaseapp.com",
  projectId: "bus-ticket-issuing-system",
  storageBucket: "bus-ticket-issuing-system.firebasestorage.app",
  messagingSenderId: "531196138685",
  appId: "1:531196138685:web:53a485f314869ee04813d4",
  measurementId: "G-CL56ECKB7W"
};

export const app = initializeApp(firebaseConfig);

