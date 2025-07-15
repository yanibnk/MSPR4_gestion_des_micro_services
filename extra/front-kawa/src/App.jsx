// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardClient from "./pages/DashboardClient";
import DashboardAdmin from "./pages/DashboardAdmin";
import Navbar from "./components/Navbar"; // On la créera juste après

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/client" element={<DashboardClient />} />
        <Route path="/admin" element={<DashboardAdmin />} />
      </Routes>
    </Router>
  );
}

export default App;
