


/*
Your Favorites feature is implemented using localStorage, which means favorites are saved per user on their own
 browser and stay saved even if they close the site or refresh
*/
import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both fields.");
      return;
    }

    // check if existing user
    const users = JSON.parse(localStorage.getItem("users")) || {};
    if (users[username]) {
      if (users[username].password === password) {
        onLogin(username);
      } else {
        setError("Incorrect password.");
      }
    } else {
      // new user registration
      users[username] = { password, favorites: [] };
      localStorage.setItem("users", JSON.stringify(users));
      onLogin(username);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #90caf9 0%, #e3f2fd 100%)",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "white",
          padding: "2rem 3rem",
          borderRadius: "12px",
          boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#1976d2" }}>Login / Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: "0.6rem", marginTop: "1rem" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "0.6rem", marginTop: "0.7rem" }}
        />
        <button
          type="submit"
          style={{
            marginTop: "1rem",
            padding: "0.6rem 1rem",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </form>
    </div>
  );
}
