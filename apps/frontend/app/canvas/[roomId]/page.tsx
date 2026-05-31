import RoomCanvas from "@/components/RoomCanvas";

export default async function CanvasPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  
  if (!roomId) {
    return <div className="flex items-center justify-center h-screen text-red-500">Invalid Room ID</div>;
  }
  
  return <RoomCanvas roomId={roomId} />;
}