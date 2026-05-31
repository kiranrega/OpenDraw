import { BACKEND_URL } from "@/config"
import { ChatMessageSchema } from "@repo/common/types"
import axios from "axios"

export async function getExistingShapes(roomId:string) {
    const token = localStorage.getItem("token");
    
    // Convert roomId to number if it's a string
    const numericRoomId = typeof roomId === 'string' ? parseInt(roomId, 10) : roomId;
    
    if (isNaN(numericRoomId) || numericRoomId <= 0) {
        console.error("Invalid room ID:", roomId);
        return [];
    }
    
    const res = await axios.get(`${BACKEND_URL}/chats/${numericRoomId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const messages = res.data.messages
    
    const shapes = messages.map((shape:{message:string}) => {
        try {
            const parsed = JSON.parse(shape.message)
            // Validate shape against schema to prevent XSS
            const validation = ChatMessageSchema.safeParse(parsed)
            if (!validation.success) {
                console.warn("Invalid shape data received from server:", validation.error)
                return null
            }
            return validation.data.shape
        } catch (e) {
            console.error("Failed to parse shape:", e)
            return null
        }
    }).filter((shape: any) => shape !== null)
    
    return shapes
}