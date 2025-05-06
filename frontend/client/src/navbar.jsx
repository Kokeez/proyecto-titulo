import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate }                 from 'react-router-dom';
import {Dropdown,InputGroup,FormControl,ListGroup} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './navbar.css';
import { FaWarehouse } from 'react-icons/fa'; 
import { FaCar } from 'react-icons/fa';

function Navbar({ userType, user }) {
  // Hooks
  const [menuVisible, setMenuVisible] = useState(false);
  const [query, setQuery]             = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showList, setShowList]       = useState(false);
  const debounceRef                   = useRef(null);
  const navigate                      = useNavigate();

  // Funciones
  const toggleMenu = () => setMenuVisible(v => !v);

  const handleLogout = () => {
    ['access','refresh','userType','username','photoUrl']
      .forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setShowList(false);
      return;
    }

    // Crea un timeout para debouncing
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/productos/search/?q=${encodeURIComponent(query)}`
        );
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();

        setSuggestions(data);
        setShowList(data.length > 0);
      } catch (err) {
        console.error('Error al buscar productos:', err);
        setSuggestions([]);
        setShowList(false);
      }
    }, 300);

    // Cleanup: limpia el timeout si query cambia antes de los 300ms
    return () => clearTimeout(handler);
  }, [query]);

  const onSelect = id => {
    setShowList(false);
    setQuery('');
    navigate(`/productos/${id}`);
  };


  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        {/* BRAND: icono + texto, SIEMPRE */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <FaWarehouse 
            size={24} 
            className="me-2" 
            style={{ color: '#ffd200' }} 
          />
          <span className="vulcastock-logo">VulcaStock</span>
        </Link>

        {/* Toggle para moviles */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Menu items */}
        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link to="/productos" className="nav-link">
                Tienda
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/carrito" className="nav-link">
                Carrito
              </Link>
            </li>
            {userType === "admin" && (
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              </li>
            )}
          </ul>

      {/* Search */}
      <div className="position-relative mx-3">
        <InputGroup>
          <FormControl
            placeholder="Buscar producto..."
            value={query}
            onFocus={() => query && setShowList(true)}
            onChange={e => {
              setQuery(e.target.value);
              setShowList(true);
            }}
            onBlur={() => setTimeout(() => setShowList(false), 150)}
          />
        </InputGroup>

        {showList && suggestions.length > 0 && (
          <ListGroup
            className="position-absolute w-100"
            style={{ zIndex: 1000 }}
          >
            {suggestions.map(prod => (
              <ListGroup.Item
                key={prod.id}
                action
                onMouseDown={() => onSelect(prod.id)}
              >
                {prod.nombre}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
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
      </div>
    </nav>
  );
};

export default Navbar;






