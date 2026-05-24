import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Migrating device statuses...");
  // We need to fetch and update all devices with status OFFLINE or BUSY
  const result = await prisma.device.updateMany({
    where: {
      status: {
        in: ["OFFLINE", "BUSY"] as any, // Cast to any since we haven't changed the types yet
      },
    },
    data: {
      status: "ACTIVE",
    },
  });

  console.log(`Successfully migrated ${result.count} devices to ACTIVE status.`);
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
