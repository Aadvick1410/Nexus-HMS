import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    let newSocket;

    if (user) {
      newSocket = io('http://localhost:5000');
      
      newSocket.on('connect', () => {
        if (user._id) {
          newSocket.emit('join_room', user._id);
        }
        
        if (user.role === 'Doctor' || user.role === 'Nurse') {
          newSocket.emit('join_room', 'emergency_ward');
        }
      });

      newSocket.on('new_notification', (data) => {
        toast.info(data.message || 'New notification received', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
