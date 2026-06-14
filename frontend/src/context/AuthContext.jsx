import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('hms_token');
    const role = localStorage.getItem('hms_user_role');
    const name = localStorage.getItem('hms_user_name');
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ _id: payload.id || payload._id || 'mock-user-id', role: role || payload.role, name: name });
      } catch (e) {
        setUser({ _id: 'mock-user-id', role: role, name: name });
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
