import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";  // Asegúrate de tenerlo importado
import "./navbar.css"; 
const Navbar = ({ userType, user }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleLogout = () => {
    // Eliminar los datos de localStorage al cerrar sesión
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("userType");
    localStorage.removeItem("username");
    localStorage.removeItem("photoUrl");

    // Redirigir al login después de cerrar sesión
    window.location.href = "/login";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <span className="vulcastock-logo">VulcaStock</span>
        </Link>

        {/* Menu items */}
        <div className="navbar-nav mx-auto">
          <Link to="/Productos" className="nav-link">
            Tienda
          </Link>
          <Link to="/nosotros" className="nav-link">
            Nosotros
          </Link>
        </div>

        {/* Search bar */}
        <div className="d-flex mx-3">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar producto"
          />
        </div>

        {/* User dropdown */}
        {user ? (
            <Dropdown>
            <Dropdown.Toggle variant="secondary" id="dropdown-basic" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src={user.photoUrl} alt="User" className="user-photo" style={{ width: "50px", height: "50px", borderRadius: "20%", marginRight: "20px",marginTop: " 2px",}} />
              {user.name}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item as="button" onClick={handleLogout}>Cerrar sesión</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <Link to="/login" className="btn btn-warning text-white">
            Ingresar
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;






