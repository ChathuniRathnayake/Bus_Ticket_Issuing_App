// src/utils/auth.js
export const getAuthToken = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    // Optional: You can add token refresh logic later using Firebase
    return token;
  } catch (err) {
    console.error("Token error:", err);
    localStorage.removeItem("token");
    return null;
  }
};