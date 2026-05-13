import prisma from '@/lib/prisma';
import * as repo from '@/lib/repositories/provisioning';

export async function executeTenantProvisioningTx(params: {
    nif: string;
    orgName: string;
    deptName: string;
    userEmail: string;
    userName: string;
    jobTitle?: string;
    phone?: string;
    metadata: Record<string, any>;
    stripeData: { customerId: string; subscriptionId?: string; intentId: string };
    lineItems: Array<{ stripeProductId: string; quantity: number }>;
}) {
    return await prisma.$transaction(async (tx) => {
        // 1. Organization
        const organization = await repo.upsertOrganizationTx(tx, { nif: params.nif, name: params.orgName });

        // 2. Addresses
        let parsedBilling = null, parsedShipping = null;
        try { if (params.metadata.billingAddress) parsedBilling = JSON.parse(params.metadata.billingAddress); } catch (e) { }
        try { if (params.metadata.shippingAddress) parsedShipping = JSON.parse(params.metadata.shippingAddress); } catch (e) { }

        const billingAddress = await repo.createBillingAddressTx(tx, {
            street: parsedBilling?.streetAddress || '',
            city: parsedBilling?.city || '',
            zipCode: parsedBilling?.postalCode || '',
            country: parsedBilling?.country || 'PT',
            nif: params.nif,
        });

        let shippingAddressId: string | null = null;
        if (parsedShipping) {
            const sAddr = await repo.createShippingAddressTx(tx, {
                street: parsedShipping?.streetAddress || '',
                city: parsedShipping?.city || '',
                zipCode: parsedShipping?.postalCode || '',
                country: parsedShipping?.country || 'PT',
                nif: params.nif,
            });
            shippingAddressId = sAddr.id;
        }

        // 3. Department
        const department = await repo.createDepartmentTx(tx, {
            name: params.deptName,
            stripeCustomerId: params.stripeData.customerId,
            stripeSubscriptionId: params.stripeData.subscriptionId,
            organizationId: organization.id,
            billingAddressId: billingAddress.id,
            shippingAddressId: shippingAddressId,
        });

        // 4. Admin User
        await repo.createAdminUserTx(tx, {
            email: params.userEmail,
            name: params.userName,
            jobTitle: params.jobTitle || null,
            phone: params.phone || null,
            departmentId: department.id,
        });

        // 5. Order & Hardware
        let orderItemsData: any[] = [];
        const pendingCartId = params.metadata.pendingCartId;

        // Fetch and map the pending cart items
        if (pendingCartId) {
            const pendingCart = await tx.pendingCart.findUnique({
                where: { id: pendingCartId }
            });

            if (pendingCart && Array.isArray(pendingCart.items as any[])) {
                orderItemsData = (pendingCart.items as any[]).map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity
                }));
            }
        }

        // Create the order with nested items inline
        const order = await repo.createOrderWithIntentTx(tx, {
            departmentId: department.id,
            stripeIntentId: params.stripeData.intentId,
            customerEmail: params.userEmail,
            customerName: params.userName
        }, orderItemsData);

        // Clean up the Pending Cart
        if (pendingCartId) {
            await tx.pendingCart.delete({
                where: { id: pendingCartId }
            });
        }

        return { department, organization };
    });
}
