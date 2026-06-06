"use client";

import React, { useEffect, useState } from "react";
import { WSS_URL } from "@/config";
import Canvas from "./Canvas";
import { useRouter } from "next/navigation";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [hasToken, setHasToken] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setHasToken(!!token);
    
    // Convert roomId to number
    const numericRoomId = typeof roomId === 'string' ? parseInt(roomId, 10) : roomId;
    
    if (isNaN(numericRoomId) || numericRoomId <= 0) {
      console.error("Invalid room ID:", roomId);
      return;
    }
    
    if (!token) {
      console.log("No authentication token found. Initializing sandbox guest session.");
      // Create a mock socket
      const mockWs = {
        send: (data: string) => {
          console.log("Sandbox socket send (not synced):", data);
        },
        onmessage: null,
        readyState: 1, // WebSocket.OPEN
        addEventListener: () => {},
        removeEventListener: () => {},
        close: () => {}
      } as unknown as WebSocket;
      
      setSocket(mockWs);
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
    <div className="relative w-full h-screen overflow-hidden">
      {!hasToken && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500/10 border border-amber-500/25 text-amber-200 px-4 py-2 rounded-lg text-xs font-medium backdrop-blur-md shadow-sm z-30 flex items-center space-x-2 select-none">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
          <span>Sandbox Mode (Local Only)</span>
          <span className="text-amber-500/30">•</span>
          <button 
            onClick={() => router.push('/signin')}
            className="text-white hover:underline font-semibold cursor-pointer"
          >
            Sign in to save & collaborate
          </button>
        </div>
      )}
      <Canvas roomId={roomId} socket={socket} />
    </div>
  );
}
