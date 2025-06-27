// src/components/Login.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import companyLogo from "../src/images/logo.png";  // ajusta la ruta a tu imagen
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setUserType } = useUser();

  useEffect(() => {
    document.body.classList.add("login-page");
    return () => document.body.classList.remove("login-page");
  }, []);

  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("access",  data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("user",    JSON.stringify(data.user));
        const type = data.user.rol === "Administrador" ? "admin" : "user";
        localStorage.setItem("userType", type);

        setUser(data.user);
        setUserType(type);

        toast.success("¡Login exitoso!");
        navigate("/");
      } else {
        setError(data.error || "Credenciales incorrectas");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el backend.");
    }

    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      {/* Lado izquierdo: imagen */}
      <div className="login-image">
        <img src={companyLogo} alt="Cars Integral" />
      </div>

      {/* Lado derecho: formulario */}
      <div className="login-container">
        <h1>Iniciar sesión</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="nickname">Usuario</label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ingrese usuario"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese contraseña"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Cargando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;


