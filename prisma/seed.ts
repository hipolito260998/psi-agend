import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@psicologia.com' },
    update: {},
    create: {
      email: 'admin@psicologia.com',
      password: hashedPassword,
      name: 'Dra. Psicóloga',
      role: Role.ADMIN,
      phone: '555-1234',
    },
  })

  console.log('Seeded database with:', admin.email)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
