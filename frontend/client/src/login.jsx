import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import "./login.css";


const Login = () => {
  const navigate = useNavigate();
    useEffect(() => {
        // Añadir la clase "login-page" cuando estamos en la página de login
        document.body.classList.add("login-page");
        // Eliminar la clase "login-page" al salir de la página de login
        return () => {
          document.body.classList.remove("login-page");
        };
      }, []);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const userData = { username: username, password: password };
  
    try {
      const response = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
  
      const data = await response.json();
  
      console.log("Datos recibidos del backend:", data);
  
      if (response.status === 200) {
        // Almacenar el JWT en el localStorage
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("userType", data.is_admin ? "admin" : "user");  // Guardar tipo de usuario
        localStorage.setItem("username", data.username); // Guardar nombre de usuario
        localStorage.setItem("photoUrl", data.photo_url || "https://www.w3schools.com/howto/img_avatar.png"); // Foto por defecto
        toast.success('¡Login exitoso!');
        // Redirigir a la página principal o dashboard
        navigate("/");
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error("Error de red:", err);
      setError("Error al conectar con el backend.");
    }
    setLoading(false);
  };


  return (
    <div className="login-container">
      <h1>Iniciar sesión</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <label htmlFor="username">Usuario</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
  );
};

export default Login;

