// app/utils/adminStatus.ts
//
// The admin list shows a single "status" per account, but the interesting
// review state does not live on the account row: lawyers and firms carry it on
// their satellite profile (`lawyerProfile` / `firmProfile`.verificationStatus)
// while `account.status` stays "active" through the whole review.
//
// This module is the single place that resolves the two into what the UI shows
// and sorts by. Consumers: UsersPage (table + sort) and UserDetailModal
// (action gating).

export type DerivedAccountStatus =
  | "active"
  | "pending"
  | "under_review"
  | "rejected"
  | "suspended"
  | "dormant"
  | "deleted";

/**
 * Structural shape shared by `AccountListItem` and `AdminUserDetail` — the
 * latter extends a type that has no satellite profiles, so they are optional
 * here.
 */
export interface VerificationBearingAccount {
  status: string;
  lawyerProfile?: { verificationStatus?: string | null } | null;
  firmProfile?: { verificationStatus?: string | null } | null;
}

/**
 * Profile verification states that replace the account status in the UI.
 *
 * `verified` is deliberately absent: a verified lawyer is simply an active
 * account. `disputed` maps to under review because the SCN dispute is still
 * being reviewed. Anything unrecognised falls through to the account status.
 */
const PROFILE_STATUS_OVERRIDES: Record<string, DerivedAccountStatus> = {
  pending: "pending",
  under_review: "under_review",
  disputed: "under_review",
  rejected: "rejected",
};

/** The raw verification state, or `null` for accounts with no profile. */
export function getProfileVerificationStatus(
  account: VerificationBearingAccount,
): string | null {
  return (
    account.lawyerProfile?.verificationStatus ??
    account.firmProfile?.verificationStatus ??
    null
  );
}

/**
 * The status an admin row should display and sort by.
 *
 * The fallback is normalised the same way the old `UserDetailModal` did it, so
 * both shapes work: `AccountListItem.status` is already `"active"`, while
 * `AdminUserListItem.status` is the prettier `"Active"` / `"Under Review"`.
 */
export function getDisplayStatus(
  account: VerificationBearingAccount,
): DerivedAccountStatus {
  const verification = getProfileVerificationStatus(account);
  if (verification) {
    const key = verification.trim().toLowerCase().replace(/\s+/g, "_");
    if (PROFILE_STATUS_OVERRIDES[key]) return PROFILE_STATUS_OVERRIDES[key];
  }
  return String(account.status ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_") as DerivedAccountStatus;
}
