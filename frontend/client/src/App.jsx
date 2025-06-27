import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import Home         from "./home";
import Login        from "./login";
import ProductList  from "./lista_productos";
import ProductList2 from "./lista_admin";
import Dashboard    from "./dashboard";
import Navbar       from "./navbar";
import ProductDetail from "./detalle_producto";
import CartPage     from "./carritoPage";
import ProductForm  from "./productForm";
import Services from "./servicios";
import ServiceDetail from "./serviceDetail";
import BoletaList from "./lista_Boleta";
const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser]         = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("access");
    const storedUser  = localStorage.getItem("user");
    const storedType  = localStorage.getItem("userType");

    // Si no hay token o usuario, forzar login
    if (!accessToken || !storedUser) {
      if (location.pathname !== "/login") {
        navigate("/login");
      }
      return;
    }

    // 1) Decodificar y verificar expiración
    const { exp } = jwtDecode(accessToken);
    const now     = Date.now() / 1000;
    if (exp < now) {
      localStorage.clear();
      navigate("/login");
      return;
    }

    // 2) Parsear el objeto user y actualizar estado
    const parsedUser = JSON.parse(storedUser);
    setUser({
      name: parsedUser.nickname,
      photoUrl: parsedUser.photoUrl || "https://www.w3schools.com/howto/img_avatar.png",
    });
    setUserType(storedType);

    // Si estamos en login y ya autenticados, redirigir al Home
    if (location.pathname === "/login") {
      navigate("/");
    }

  }, [location.pathname, navigate]);

  return (
    <div>
      {/* Navbar oculto en /login */}
      {location.pathname !== "/login" && (
        <Navbar user={user} userType={userType} />
      )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/Productos" element={<ProductList />} />
        <Route path="/ProductosAdmin" element={<ProductList2 />} />
        <Route path="/productos/nuevo" element={<ProductForm />} />
        <Route path="/productos/:id/editar" element={<ProductForm />} />
        <Route path="/dashboard" element={userType === "admin" ? <Dashboard /> : <Login />} />
        <Route path="/Productos/:id" element={<ProductDetail />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/servicios" element={<Services />} />
        <Route path="/servicios/:id" element={<ServiceDetail />} />
        <Route path="/boletas" element={<BoletaList />} />
        {/* ...otras rutas... */}
      </Routes>
    </div>
  );
};

export default App;






