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
    plan: z.enum(['STARTER', 'INDUSTRIAL_PRO', 'EXECUTIVE']).default('STARTER'),
    billingAddressData: AddressSchema.optional(),
});

export const AdminUserSchema = z.object({
    email: z.string().email('Valid email is required'),
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
    const dummyAddress = await tx.address.create({
        data: {
            street: validated.billingAddressData?.street || 'N/A',
            city: validated.billingAddressData?.city || 'N/A',
            zipCode: validated.billingAddressData?.zipCode || 'N/A',
            country: validated.billingAddressData?.country || 'N/A',
        },
    });

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
            billingAddressId: dummyAddress.id,
            subStatus: 'ACTIVE',
            plan: validated.plan,
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
            auth0UserId: `pending-${Date.now()}`,
            role: 'ADMIN',
            departmentId: validated.departmentId,
        },
    });
}

/**
 * Takes Stripe cart items, matches them to HardwareProducts, and issues an Order.
 */
export async function createHardwareOrderTx(
    tx: TxClient,
    departmentId: string,
    cartItemsStr: string | any[] // Accepts line_items desc array from Stripe
) {
    const cartItems = typeof cartItemsStr === 'string' ? JSON.parse(cartItemsStr) : cartItemsStr;

    const orderItemsInput = [];
    for (const item of cartItems) {
        if (item.price?.product) {
            const productIdStripe = typeof item.price.product === 'string' ? item.price.product : item.price.product.id;
            const hardwareProduct = await tx.hardwareProduct.findUnique({
                where: { stripeProductId: productIdStripe },
            });

            if (hardwareProduct) {
                orderItemsInput.push({
                    productId: hardwareProduct.id,
                    quantity: item.quantity || 1,
                });
            }
        }
    }

    // Validate mapping output to make sure it respects basic limits
    const validatedItems = OrderItemsSchema.parse(orderItemsInput);

    if (validatedItems.length > 0) {
        const order = await tx.order.create({
            data: {
                departmentId: departmentId,
                status: 'PAID_UNSHIPPED',
            },
        });

        for (const input of validatedItems) {
            await tx.orderItem.create({
                data: {
                    orderId: order.id,
                    productId: input.productId,
                    quantity: input.quantity,
                },
            });
        }

        return order;
    }

    return null;
}
