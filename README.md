# Appfin

Scaffold inicial do aplicativo de gestão financeira pessoal (mobile-first).

Este repositório contém um esqueleto Next.js + Tailwind + Prisma com as entidades e utilitários iniciais.

Para rodar localmente:

1. Copie .env.example para .env e configure DATABASE_URL (ex: file:./dev.db)
2. npm install
3. npx prisma migrate dev --name init
4. npm run prisma:seed
5. npm run dev
