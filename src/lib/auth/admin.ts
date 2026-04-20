/**
 * Admin identity + approval helpers.
 *
 * For now the admin is a single hardcoded email. When we have more than one
 * admin, promote this to a column on profiles (`is_admin boolean`) and adjust.
 */

export const ADMIN_EMAIL = "hulusitunc1@gmail.com";

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";
