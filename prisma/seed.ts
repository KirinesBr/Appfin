import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const defaults = [
    { name: 'Alimentação', category_type: 'expense' },
    { name: 'Transporte', category_type: 'expense' },
    { name: 'Moradia', category_type: 'expense' },
    { name: 'Saúde', category_type: 'expense' },
    { name: 'Lazer', category_type: 'expense' },
    { name: 'Assinatura', category_type: 'expense' },
    { name: 'Educação', category_type: 'expense' },
    { name: 'Salário', category_type: 'income' },
    { name: 'Renda Extra', category_type: 'income' }
  ]
  for (const c of defaults) {
    await prisma.category.upsert({
      where: { name: c.name },
      update: {},
      create: {
        name: c.name,
        category_type: c.category_type as any
      }
    })
  }
  console.log('Seed concluído')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
