// UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Creamos el contexto
const UserContext = createContext();

// Proveedor del contexto
export const UserProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    // 1) Leemos el JSON completo
    const storedUser = localStorage.getItem("user");
    const storedType = localStorage.getItem("userType");

    if (storedUser) {
      // 2) Parseamos el JSON para recuperar nickname, foto, rol, etc.
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setUserType(storedType);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, userType, setUser, setUserType }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook para acceder al contexto
export const useUser = () => useContext(UserContext);
