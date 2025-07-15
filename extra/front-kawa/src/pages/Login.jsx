import React, { useState } from "react";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [motdepasse, setMotdepasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErreur("");
    setMessage("");

    try {
      const res = await axios.get("http://localhost:3001/utilisateurs");
      const utilisateur = res.data.find(
        (u) => u.email === email && u.motdepasse === motdepasse
      );

      if (utilisateur) {
        setMessage(`Bienvenue ${utilisateur.nom} (${utilisateur.type})`);
        // Stocker ou rediriger si nécessaire ici
      } else {
        setErreur("Email ou mot de passe incorrect");
      }
    } catch (err) {
      console.error("Erreur axios :", err);
      setErreur("Erreur de connexion au serveur");
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Connexion</h2>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", maxWidth: 300 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={motdepasse}
          onChange={(e) => setMotdepasse(e.target.value)}
          required
        />
        <button type="submit" style={{ marginTop: "1rem" }}>
          Se connecter
        </button>
      </form>
      {erreur && <p style={{ color: "red" }}>{erreur}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}

export default Login;
