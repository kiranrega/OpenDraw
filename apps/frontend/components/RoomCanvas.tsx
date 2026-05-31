"use client";

import React, { useEffect, useState } from "react";
import { WSS_URL } from "@/config";
import Canvas from "./Canvas";
import { useProtectedRoute } from "@/hooks/useAuth";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  useProtectedRoute();

  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Convert roomId to number
    const numericRoomId = typeof roomId === 'string' ? parseInt(roomId, 10) : roomId;
    
    if (isNaN(numericRoomId) || numericRoomId <= 0) {
      console.error("Invalid room ID:", roomId);
      return;
    }
    
    if (!token) {
      console.error("No authentication token found");
      return;
    }
    
    console.log("Connecting to WebSocket with roomId:", numericRoomId);
    const ws = new WebSocket(`${WSS_URL}?token=${token}`);

    ws.onopen = () => {
      console.log("WebSocket connected, joining room:", numericRoomId);
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: numericRoomId,
        })
      );
    };
    
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    ws.onclose = () => {
      console.log("WebSocket closed");
      setSocket(null);
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId]);

  if (!socket) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p>Connecting to drawing room...</p>
      </div>
    );
  }

  return (
    <>
      <Canvas roomId={roomId} socket={socket} />
    </>
  );
}
