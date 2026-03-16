import { Prisma } from '@prisma/client';

type TxClient = Omit<Prisma.TransactionClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export async function upsertOrganizationTx(tx: TxClient, data: { nif: string; name: string }) {
    return tx.organization.upsert({
        where: { nif: data.nif },
        create: { name: data.name, nif: data.nif },
        update: {}
    });
}

export async function createBillingAddressTx(tx: TxClient, data: { street: string; city: string; zipCode: string; country: string; nif: string }) {
    return tx.address.create({ data });
}

export async function createShippingAddressTx(tx: TxClient, data: { street: string; city: string; zipCode: string; country: string; nif: string }) {
    return tx.address.create({ data });
}

export async function createDepartmentTx(tx: TxClient, data: {
    name: string; stripeCustomerId: string; stripeSubscriptionId?: string;
    organizationId: string; billingAddressId: string; shippingAddressId?: string | null;
}) {
    const deptSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return tx.department.create({
        data: {
            ...data,
            slug: `${deptSlug}-${Date.now().toString().slice(-4)}`,
            auth0OrgId: 'PENDING',
            subStatus: 'ACTIVE',
        }
    });
}

export async function createAdminUserTx(tx: TxClient, data: { email: string; name: string; jobTitle?: string | null; phone?: string | null; departmentId: string; }) {
    return tx.user.create({
        data: { ...data, role: 'ADMIN' }
    });
}

export async function createOrderWithIntentTx(tx: TxClient, data: { departmentId: string; stripeIntentId: string; customerEmail: string; customerName: string; }) {
    return tx.order.create({
        data: { ...data, status: 'PAID_UNSHIPPED' }
    });
}

export async function attachHardwareToOrderTx(tx: TxClient, orderId: string, lineItems: Array<{ stripeProductId: string; quantity: number }>) {
    for (const item of lineItems) {
        if (!item.stripeProductId) continue;
        const hardware = await tx.hardwareProduct.findUnique({ where: { stripeProductId: item.stripeProductId } });
        if (hardware) {
            await tx.orderItem.create({
                data: { orderId, productId: hardware.id, quantity: item.quantity }
            });
        }
    }
}
