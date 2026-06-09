import Pusher from "pusher"

// Mantenemos la instancia de Pusher viva durante el desarrollo
const globalForPusherV2 = globalThis as unknown as {
  pusherV2: Pusher | undefined
}

export const pusherServer = globalForPusherV2.pusherV2 ?? new Pusher({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || "",
  useTLS: true,
})

if (process.env.NODE_ENV !== "production") globalForPusherV2.pusherV2 = pusherServer
