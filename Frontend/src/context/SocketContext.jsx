import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { SERVER_URL } from '../services/api';

// One authenticated Socket.IO connection per logged-in session. The four
// features that need real-time updates (sidebar dot, notifications, chat, ATS
// board) used to each open their own connection; they now share this one.
const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, token } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Only hold a connection while authenticated. The server derives the room
    // from the token, so no client-side 'join' is sent.
    if (!user?._id || !token) return undefined;

    const connection = io(SERVER_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
    });
    // Setting the created connection into state is the whole point of this
    // effect (subscribing to an external system), so the set-state-in-effect
    // lint rule is a false positive here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(connection);

    return () => {
      connection.disconnect();
      setSocket(null);
    };
  }, [user?._id, token]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

// Returns the shared socket, or null while disconnected/logged out. Consumers
// must guard for null and attach listeners inside an effect that depends on it.
// eslint-disable-next-line react-refresh/only-export-components
export function useSocket() {
  return useContext(SocketContext);
}
