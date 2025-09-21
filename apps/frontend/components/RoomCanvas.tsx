"use client";

import React, { useEffect, useState } from "react";
import { WSS_URL } from "@/config";
import Canvas from "./Canvas";

export default function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const ws = new WebSocket(`${WSS_URL}?token=${token}`);

    ws.onopen = () => {
      setSocket(ws);
      ws.send(
        JSON.stringify({
          type: "join_room",
          roomId: Number(roomId),
        })
      );
    };
  }, []);

  if (!socket) {
    return <span>Connecting to server....</span>;
  }

  return (
    <>
      <Canvas roomId={roomId} socket={socket} />
    </>
  );
}
