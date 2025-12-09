export type roleType = 'user' | 'treasury' | 'admin' | 'superadmin';

export interface User {
  /** User ID */
  id: string;
  /** User full name */
  fullName: string;
  /** User affiliation */
  affiliation: string;
  /** User affiliation ID */
  affiliationId: string;
  /** User role */
  role: roleType;
  /** User email */
  email: string;
  /** User phone */
  phone: string;
}
