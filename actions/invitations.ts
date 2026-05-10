"use server";

import { revalidatePath } from "next/cache";
import { getAppSession } from "@/lib/auth/session";
import { createOrgInvitation } from "@/lib/auth/auth0-management";

type InviteUserResponse = 
  | { success: true; invitationUrl: string }
  | { success: false; error: string };

export async function inviteUserAction(formData: FormData): Promise<InviteUserResponse> {
  try {
    const session = await getAppSession();
    
    if (!session || !session.user) {
      return { success: false, error: "Unauthorized: No active session." };
    }

    const orgId = session.user.org_id || session.user.org_slug;
    
    if (!orgId) {
      return { success: false, error: "Unauthorized: No organization ID found in session." };
    }

    const email = formData.get("email")?.toString();
    const role = formData.get("role")?.toString()?.toLowerCase();
    const sendEmail = formData.get("sendEmail") !== "false";

    if (!email || !role) {
      return { success: false, error: "Email and role are required." };
    }

    const ROLE_MAP: Record<string, string> = {
      "admin": process.env.AUTH0_ROLE_ADMIN_ID || "",
      "user": process.env.AUTH0_ROLE_USER_ID || "",
    };

    const roleId = ROLE_MAP[role];
    if (!roleId) {
      return { success: false, error: `Invalid role selected: ${role}` };
    }

    // Role ID format depends on how you store them. Assuming `role` value corresponds to Auth0 Role ID or a predefined mapping
    // We pass an array of roles, for simplicity mapping the single role here
    const roleIds = [roleId];

    const inviterName = session.user.name || session.user.email || "Admin";

    const result = await createOrgInvitation(orgId, inviterName, email, roleIds, sendEmail);

    // Revalidate the team settings page to reflect the new pending invitation
    revalidatePath("/dashboard/settings/team"); // Adjust path if needed later

    return { 
      success: true, 
      invitationUrl: result.invitation_url 
    };

  } catch (error: any) {
    console.error("Failed to invite user:", error);
    return { 
      success: false, 
      error: error.message || "An unexpected error occurred while inviting the user." 
    };
  }
}
