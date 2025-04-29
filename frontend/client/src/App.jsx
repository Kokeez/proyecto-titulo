import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Home from "./home";
import Login from "./login";
import ProductList from "./lista_productos";
import Dashboard from "./dashboard";
import Navbar from "./navbar";
import ProductDetail  from "./detalle_producto";

import { jwtDecode } from "jwt-decode"; // Asegúrate de usar el paquete correcto de jwt-decode

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("username");
    const loggedInUserType = localStorage.getItem("userType");
    const photoUrl = localStorage.getItem("photoUrl");
    const accessToken = localStorage.getItem("access");

    if (loggedInUser && loggedInUserType && accessToken) {
      // Decodificamos el token y verificamos la expiración
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;

      // Si el token ha expirado
      if (decodedToken.exp < currentTime) {
        // Eliminar datos y redirigir a login si el token ha expirado
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("userType");
        localStorage.removeItem("username");
        localStorage.removeItem("photoUrl");
        navigate("/login");
      } else {
        setUser({
          name: loggedInUser,
          photoUrl: photoUrl || "https://www.w3schools.com/howto/img_avatar.png",
        });
        setUserType(loggedInUserType);
      }
    } else {
      // Si no hay usuario logueado, redirigimos al login
      if (location.pathname !== "/login") {
        navigate("/login");
      }
    }
  }, [location.pathname, navigate]);

  return (
    <div>
      {/* Mostrar Navbar solo si no estamos en la página de login */}
      {location.pathname !== "/login" && <Navbar userType={userType} user={user} />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Productos" element={<ProductList />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/Productos/:id" element={<ProductDetail />} />
        {/* Solo el admin puede acceder al dashboard */}
        {userType === "admin" && <Route path="/dashboard" element={<Dashboard />} />}
      </Routes>
    </div>
  );
};

export default App;






