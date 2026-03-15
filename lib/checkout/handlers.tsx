import prisma from '@/lib/prisma';

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
        // 1. Upsert Organization
        const organization = await tx.organization.upsert({
            where: { nif: params.nif },
            create: { name: params.orgName, nif: params.nif },
            update: {}
        });

        // 2. Safely Parse Addresses
        let parsedBilling = null, parsedShipping = null;
        try { if (params.metadata.billingAddress) parsedBilling = JSON.parse(params.metadata.billingAddress); } catch (e) { }
        try { if (params.metadata.shippingAddress) parsedShipping = JSON.parse(params.metadata.shippingAddress); } catch (e) { }

        const billingAddress = await tx.address.create({
            data: {
                street: parsedBilling?.streetAddress || '',
                city: parsedBilling?.city || '',
                zipCode: parsedBilling?.postalCode || '',
                country: parsedBilling?.country || 'PT',
                nif: params.nif,
            }
        });

        let shippingAddressId: string | null = null;
        if (parsedShipping) {
            const sAddr = await tx.address.create({
                data: {
                    street: parsedShipping?.streetAddress || '',
                    city: parsedShipping?.city || '',
                    zipCode: parsedShipping?.postalCode || '',
                    country: parsedShipping?.country || 'PT',
                    nif: params.nif,
                }
            });
            shippingAddressId = sAddr.id;
        }

        // 3. Create Department
        const deptSlug = params.deptName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const department = await tx.department.create({
            data: {
                name: params.deptName,
                slug: `${deptSlug}-${Date.now().toString().slice(-4)}`,
                stripeCustomerId: params.stripeData.customerId,
                stripeSubscriptionId: params.stripeData.subscriptionId,
                auth0OrgId: 'PENDING', // Updated post-transaction
                organizationId: organization.id,
                billingAddressId: billingAddress.id,
                shippingAddressId: shippingAddressId,
                subStatus: 'ACTIVE',
            }
        });

        // 4. Create Admin User
        await tx.user.create({
            data: {
                email: params.userEmail,
                name: params.userName,
                jobTitle: params.jobTitle || null,
                phone: params.phone || null,
                role: 'ADMIN',
                departmentId: department.id,
            }
        });

        // 5. Create Order with Stripe Intent ID mapping
        const order = await tx.order.create({
            data: {
                departmentId: department.id,
                status: 'PAID_UNSHIPPED',
                stripeIntentId: params.stripeData.intentId,
                customerEmail: params.userEmail,
                customerName: params.userName
            }
        });

        // 6. Map Hardware Items
        for (const item of params.lineItems) {
            if (!item.stripeProductId) continue;
            const hardware = await tx.hardwareProduct.findUnique({
                where: { stripeProductId: item.stripeProductId }
            });

            if (hardware) {
                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: hardware.id,
                        quantity: item.quantity
                    }
                });
            }
        }

        return { department, organization };
    });
}
