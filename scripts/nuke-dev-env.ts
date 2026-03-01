import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { deleteAllOrganizations, deleteAllUsers } from '../lib/auth/auth0-management';
import { stripe } from '../lib/stripe';

dotenv.config({ path: '.env.local' }); // Ensure it loads your local dev env

const prisma = new PrismaClient();

async function nukeDatabase() {
    console.log('☢️  Starting Database Nuke...');
    try {
        await prisma.orderItem.deleteMany();
        console.log('   ✅ OrderItems deleted');
        await prisma.order.deleteMany();
        console.log('   ✅ Orders deleted');
        await prisma.user.deleteMany();
        console.log('   ✅ Users deleted');
        await prisma.department.deleteMany();
        console.log('   ✅ Departments deleted');
        await prisma.organization.deleteMany();
        console.log('   ✅ Organizations deleted');
        await prisma.address.deleteMany();
        console.log('   ✅ Addresses deleted');
        console.log('🎉 Database successfully wiped!');
    } catch (error) {
        console.error('❌ Error wiping database:', error);
    }
}

async function nukeAuth0() {
    console.log('\n☢️  Starting Auth0 Tenant Nuke...');
    try {
        await deleteAllOrganizations();
        await deleteAllUsers();
        console.log('🎉 Auth0 tenant successfully wiped!');
    } catch (error) {
        console.error('❌ Error wiping Auth0:', error);
    }
}

async function nukeStripe() {
    console.log('\n☢️  Starting Stripe Test Data Nuke...');

    const secretKey = process.env.STRIPE_SECRET_KEY || '';

    // CRITICAL SAFETY CHECK: Never allow this to run on live data
    if (!secretKey.startsWith('sk_test_')) {
        console.error('❌ ABORTING STRIPE NUKE: You are not using a test key (sk_test_).');
        return;
    }

    try {
        let hasMore = true;
        let startingAfter: string | undefined = undefined;
        let deletedCount = 0;

        // Stripe returns a maximum of 100 customers per request, so we must paginate
        while (hasMore) {
            const response: any = await stripe.customers.list(
                startingAfter ? { limit: 100, starting_after: startingAfter } : { limit: 100 }
            );

            for (const customer of response.data) {
                await stripe.customers.del(customer.id);
                console.log(`   ✅ Stripe Customer deleted: ${customer.email || customer.id}`);
                deletedCount++;
            }

            hasMore = response.has_more;
            if (hasMore && response.data.length > 0) {
                startingAfter = response.data[response.data.length - 1].id;
            }
        }

        console.log(`🎉 Stripe wipe complete! Deleted ${deletedCount} test customers.`);
    } catch (error) {
        console.error('❌ Error wiping Stripe:', error);
    }
}

async function main() {
    console.warn('⚠️  WARNING: THIS WILL DESTROY ALL USERS AND ORGS IN DB AND AUTH0 ⚠️');
    console.warn('Press Ctrl+C immediately if you are pointing to Production!');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // await nukeDatabase();
    // await nukeAuth0();
    await nukeStripe();
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });