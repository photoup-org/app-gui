import { getFleetHealthSummary, getCurrentBillingTier } from '@/lib/ai/haas-tools';

async function main() {
  // IMPORTANT: Replace this with a real Tenant ID (Department ID) from your database
  const tenantId = '71cc83b5-cba4-430f-be33-8200dbb8c90f';

  console.log(`Running tests for Tenant ID: ${tenantId}\n`);

  try {
    console.log('--- Testing getFleetHealthSummary ---');
    const fleetSummary = await getFleetHealthSummary(tenantId);
    console.dir(fleetSummary, { depth: null });

    // --- Edge Case Review for getFleetHealthSummary ---
    // 1. Strict Tenant Filtering: The query uses `where: { departmentId: tenantId }`. 
    //    If the AI provides an incorrect, malformed, or missing tenantId, Prisma will silently return an empty array `[]`, resulting in `{}`.
    // 2. No Devices: If the department genuinely has no devices associated with it yet, the response will be `{}`.
    // 3. Status Values: Ensure that devices actually have a populated `status` field in the database.

    console.log('\n--- Testing getCurrentBillingTier ---');
    const billingTier = await getCurrentBillingTier(tenantId);
    console.dir(billingTier, { depth: null });
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

main();
