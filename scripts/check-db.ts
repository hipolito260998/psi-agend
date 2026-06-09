import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log('--- ALL USERS ---')
  users.forEach(u => console.log(`ID: ${u.id} | Email: ${u.email} | Role: ${u.role}`))
  
  const notifs = await prisma.notification.findMany()
  console.log('--- NOTIFICATIONS ---')
  console.log(`Total: ${notifs.length}`)
  notifs.forEach(n => console.log(`Notif: ${n.title} for User: ${n.userId}`))
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
