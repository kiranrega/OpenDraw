import { BACKEND_URL } from "@/config"
import { ChatMessageSchema } from "@repo/common/types"
import axios from "axios"

export async function getExistingShapes(roomId:string) {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`)
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
    }).filter(shape => shape !== null)
    
    return shapes
}