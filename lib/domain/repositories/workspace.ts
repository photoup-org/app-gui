import { Prisma } from '@prisma/client';
import { z } from 'zod';

// ==========================================
// ZOD SCHEMAS FOR VALIDATION
// ==========================================

export const OrganizationSchema = z.object({
    nif: z.string().min(1, 'NIF is required'),
    name: z.string().min(1, 'Organization name is required'),
});

export const AddressSchema = z.object({
    street: z.string().default('N/A'),
    city: z.string().default('N/A'),
    zipCode: z.string().default('N/A'),
    country: z.string().default('N/A'),
});

export const DepartmentSchema = z.object({
    name: z.string().min(1, 'Department name is required'),
    organizationId: z.string().min(1),
    stripeCustomerId: z.string().min(1),
    stripeSubscriptionId: z.string().optional(),
    planId: z.string().optional(),
    billingAddressData: z.string().optional(),
    shippingAddressData: z.string().optional(),
});

export const AdminUserSchema = z.object({
    email: z.string().email('Valid email is required'),
    name: z.string().optional(),
    jobTitle: z.string().optional(),
    phone: z.string().optional(),
    departmentId: z.string().min(1),
});

export const OrderItemsSchema = z.array(
    z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().default(1),
    })
);



// ==========================================
// TRANSACTIONAL SERVICE FUNCTIONS
// ==========================================

/**
 * Type alias for a Prisma Transaction Client to ensure operations run inside the caller's transaction.
 */
export type TxClient = Omit<
    Prisma.TransactionClient,
    '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

/**
 * Validates metadata and upserts an Organization.
 */
export async function upsertOrganizationTx(tx: TxClient, input: z.infer<typeof OrganizationSchema>) {
    const validated = OrganizationSchema.parse(input);

    return await tx.organization.upsert({
        where: { nif: validated.nif },
        create: {
            name: validated.name,
            nif: validated.nif,
        },
        update: {},
    });
}

/**
 * Validates metadata, creates a dummy billing address, and creates a Department.
 */
export async function createDepartmentTx(tx: TxClient, input: z.infer<typeof DepartmentSchema>) {
    const validated = DepartmentSchema.parse(input);

    // Address creation
    let parsedBilling = null;
    if (validated.billingAddressData) {
        try { parsedBilling = JSON.parse(validated.billingAddressData); } catch (e) { }
    }
    const billingAddress = await tx.address.create({
        data: {
            street: parsedBilling?.streetAddress || 'N/A',
            city: parsedBilling?.city || 'N/A',
            zipCode: parsedBilling?.postalCode || 'N/A',
            country: parsedBilling?.country || 'N/A',
        },
    });

    let shippingAddress = null;
    let parsedShipping = null;
    if (validated.shippingAddressData) {
        try { parsedShipping = JSON.parse(validated.shippingAddressData); } catch (e) { }
        if (parsedShipping) {
            shippingAddress = await tx.address.create({
                data: {
                    street: parsedShipping?.streetAddress || 'N/A',
                    city: parsedShipping?.city || 'N/A',
                    zipCode: parsedShipping?.postalCode || 'N/A',
                    country: parsedShipping?.country || 'N/A',
                },
            });
        }
    }

    const deptSlug = validated.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Temporary auth0 slug (caller must update with real auth0 string later)
    const auth0OrgSlug = `temp-${Date.now().toString().slice(-6)}`;

    return await tx.department.create({
        data: {
            name: validated.name,
            slug: `${deptSlug}-${Date.now().toString().slice(-4)}`,
            auth0OrgId: auth0OrgSlug,
            stripeCustomerId: validated.stripeCustomerId,
            stripeSubscriptionId: validated.stripeSubscriptionId,
            organizationId: validated.organizationId,
            billingAddressId: billingAddress.id,
            shippingAddressId: shippingAddress?.id || null,
            subStatus: 'ACTIVE',
            planId: validated.planId,
        },
    });
}

/**
 * Validates metadata and creates the core Admin User record pending Auth0 login.
 */
export async function createAdminUserTx(tx: TxClient, input: z.infer<typeof AdminUserSchema>) {
    const validated = AdminUserSchema.parse(input);

    return await tx.user.create({
        data: {
            email: validated.email,
            name: validated.name || null,
            jobTitle: validated.jobTitle || null,
            phone: validated.phone || null,
            role: 'ADMIN',
            departmentId: validated.departmentId,
        },
    });
}

/**
 * Takes a parsed cart array from Stripe metadata, matches items to HardwareProducts via their ID, and issues an Order.
 */
export async function createHardwareOrderTx(
    tx: TxClient,
    departmentId: string,
    cartItemsRaw: any[],
    intentId: string,
    customerEmail: string,
    userId: string | null = null
) {
    const cartItems = OrderItemsSchema.parse(cartItemsRaw);
    if (cartItems.length > 0) {
        const order = await tx.order.create({
            data: {
                departmentId: departmentId,
                status: 'PAID_UNSHIPPED',
                stripeIntentId: intentId,
                customerEmail: customerEmail,
                userId: userId
            },
        });

        for (const item of cartItems) {
            try {
                const hardwareProduct = await tx.hardwareProduct.findUnique({
                    where: { id: item.productId },
                });

                if (!hardwareProduct) {
                    console.error(`[CRITICAL] Order creation failed mapping: Product ID ${item.productId} not found in DB. Skipping item.`);
                    continue;
                }

                await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: hardwareProduct.id,
                        quantity: item.quantity,
                    },
                });
            } catch (dbErr) {
                console.error(`[CRITICAL] Order creation DB query failed for Product ID ${item.productId}:`, dbErr);
            }
        }

        return order;
    }

    return null;
}
