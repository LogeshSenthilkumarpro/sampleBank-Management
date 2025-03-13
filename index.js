import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import AdminDashboard from "./AdminDashboard.jsx";
import CustomerDashboard from "./CustomerDashboard.jsx";
import Loan from "./Loan.jsx"; // Added import
import { AuthProvider } from "./AuthContext.js";
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/loan" element={<Loan />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);