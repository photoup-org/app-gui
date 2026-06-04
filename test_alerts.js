const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const alerts = await prisma.alert.findMany();
  console.log("ALERTS:", alerts.length);
  
  const systemLogs = await prisma.systemLog.findMany({
    where: { category: 'ALERT' }
  });
  console.log("SYSTEM LOGS (ALERTS):", systemLogs.length);
  console.log(systemLogs[0]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
