// lib/prisma.ts (ou onde tiveres a instância)
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
    datasourceUrl: 'file:./dev.db'
})

export default prisma