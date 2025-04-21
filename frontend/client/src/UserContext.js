// UserContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Creamos el contexto
const UserContext = createContext();

// Proveedor del contexto
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    const loggedInUserType = localStorage.getItem("userType");

    if (loggedInUser && loggedInUserType) {
      setUser({
        name: localStorage.getItem("username"),
        photoUrl: localStorage.getItem("photoUrl"),
      });
      setUserType(loggedInUserType);
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
