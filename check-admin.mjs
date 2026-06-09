import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log('All Users:', users.map(u => ({ id: u.id, name: u.name, role: u.role })))
  
  const notifs = await prisma.notification.findMany()
  console.log('Notifications:', notifs)
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
