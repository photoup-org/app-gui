// scripts/nuke-dev-env.ts
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
// Use relative path to avoid tsx alias resolution issues, or use @/lib/... if configured
import { deleteAllOrganizations, deleteAllUsers } from '../lib/auth/auth0-management';

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

async function main() {
    console.warn('⚠️  WARNING: THIS WILL DESTROY ALL USERS AND ORGS IN DB AND AUTH0 ⚠️');
    console.warn('Press Ctrl+C immediately if you are pointing to Production!');

    await new Promise(resolve => setTimeout(resolve, 3000));

    await nukeDatabase();
    await nukeAuth0();
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });