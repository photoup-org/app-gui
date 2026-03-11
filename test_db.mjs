import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const plans = await prisma.planTier.findMany();
    console.log("PLANS: ", plans.map(p => ({ name: p.name, priceAmount: p.priceAmount })));
    
    const products = await prisma.hardwareProduct.findMany();
    console.log("PRODUCTS: ", products.map(p => ({ name: p.name, price: Number(p.price) })));
}
main().finally(() => prisma.$disconnect());
