// hooks/useWebSocket.js
import { useEffect, useRef } from "react";

const useWebSocket = (onMessage) => {
  const socketRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080"); // your WebSocket server port
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("🔌 WebSocket connected");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      onMessage?.(message); // 👈 Message forwarded to your component
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  const send = (data) => {
  const socket = socketRef.current;

  if (!socket) {
    console.warn("WebSocket not initialized yet");
    return;
  }

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(data));
  } else {
    // 🧠 Try again every 200ms until ready or timeout after ~2s
    const interval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
        clearInterval(interval);
      }
    }, 200);

    // Optional: Stop trying after 10 tries
    setTimeout(() => clearInterval(interval), 2000);
  }
};


  return { socketRef, send };
};

export default useWebSocket;
