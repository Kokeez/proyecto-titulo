import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css"

const Dashboard = () => {
  const navigate = useNavigate();
  const userType = localStorage.getItem("userType");

  useEffect(() => {
    if (userType !== "admin") {
      navigate("/"); // Redirige a Home si no es admin
    }
  }, [userType, navigate]);

  return (
    <div>
      <h1>Dashboard - Admin</h1>
      <p>Bienvenido, solo los administradores pueden ver esta página.</p>
    </div>
  );
};

export default Dashboard;
