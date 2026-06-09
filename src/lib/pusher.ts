import Pusher from "pusher"

// Mantenemos la instancia de Pusher viva durante el desarrollo
const globalForPusherV2 = globalThis as unknown as {
  pusherV2: Pusher | undefined
}

export const pusherServer = globalForPusherV2.pusherV2 ?? new Pusher({
  appId: "2164758",
  key: "e2b815df86ed71acf449",
  secret: "2b2b9656a95262b02cfa",
  cluster: "us3",
  useTLS: true,
})

if (process.env.NODE_ENV !== "production") globalForPusherV2.pusherV2 = pusherServer
