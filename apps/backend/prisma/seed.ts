import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'
import { hashPassword } from '../src/shared/security/password'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})

const CATEGORY_NAMES = ['Estudo', 'Saúde', 'Carreira', 'Pessoal', 'Trabalho', 'Social', 'Hobby']

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      id: randomUUID(),
      email: 'admin@admin.com',
      username: 'admin',
      passwordHash: await hashPassword('admin'),
    },
  })

  for (const name of CATEGORY_NAMES) {
    const existing = await prisma.questCategory.findFirst({ where: { name } })

    if (existing) continue

    await prisma.questCategory.create({
      data: {
        id: randomUUID(),
        name,
        createdBy: admin.id,
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
