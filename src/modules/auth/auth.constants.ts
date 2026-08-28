export const AUTH_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
  MODERATOR: "MODERATOR",
  VENDOR: "VENDOR",
} as const;

export type AuthRole = (typeof AUTH_ROLES)[keyof typeof AUTH_ROLES];

/**
 * Roles that are considered administrative and may access the admin panel
 * and admin REST APIs via requireAdminRole().
 *
 * USER, MODERATOR, and VENDOR are NOT in this list and will be denied.
 */
export const ADMIN_ROLES: AuthRole[] = [AUTH_ROLES.ADMIN, AUTH_ROLES.SUPER_ADMIN];

export const AUTH_ERRORS = {
  UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  INVALID_TOKEN: "AUTH_INVALID_TOKEN",
  TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
  USER_ALREADY_EXISTS: "AUTH_USER_ALREADY_EXISTS",
  FORBIDDEN: "AUTH_FORBIDDEN",
  RATE_LIMIT_EXCEEDED: "AUTH_RATE_LIMIT_EXCEEDED",
} as const;
