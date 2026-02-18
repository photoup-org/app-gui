import { NextResponse } from 'next/server';
import { checkOrgExists, createOrg, inviteAdminToOrg } from '@/lib/auth0-management';

const slugify = (text: string) =>
    text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');

export async function POST(req: Request) {
    try {
        const { organizationName, adminEmail, plan } = await req.json();

        if (!organizationName || !adminEmail || !plan) {
            return NextResponse.json(
                { error: 'Missing required fields: organizationName, adminEmail, plan' },
                { status: 400 }
            );
        }

        const slug = slugify(organizationName);

        // 1. Check if organization exists
        try {
            const exists = await checkOrgExists(slug);
            if (exists) {
                return NextResponse.json(
                    { error: 'Organization with this name already exists.' },
                    { status: 409 }
                );
            }
        } catch (e: any) {
            console.error('Error checking organization existence:', e);
            return NextResponse.json(
                { error: `Internal Error checking existence: ${e.message}` },
                { status: 500 }
            );
        }

        // 2. Create Organization
        let newOrg;
        try {
            newOrg = await createOrg(slug, organizationName, { plan });
        } catch (e: any) {
            console.error('Error creating organization:', e);
            // If 409 comes from createOrg
            if (e.message.includes('already exists')) {
                return NextResponse.json(
                    { error: 'Organization with this name already exists.' },
                    { status: 409 }
                );
            }
            throw e;
        }

        // 3. Invite Admin
        try {
            await inviteAdminToOrg(newOrg.id, adminEmail);
        } catch (e: any) {
            console.error('Error inviting admin:', e);
            // Org created but invite failed. Return success with warning?
            // Or fail? Let's return error but note orgId.
            return NextResponse.json({
                success: true,
                orgId: newOrg.id,
                warning: 'Organization created but failed to send invitation.',
                error: e.message
            });
        }

        return NextResponse.json({
            success: true,
            orgId: newOrg.id,
            message: 'Organization created and invitation sent.',
        });
    } catch (error: any) {
        console.error('Error registering organization:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
