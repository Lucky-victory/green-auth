
export interface IApikey {
  status: API_KEY_STATUS;
  created_at: string;
  updated_at: string;
  last_used_at?: string | null;
  key: string;
  created_by: string;
  expires_in: string;
  permission: API_KEY_PERMISSIONS;
}
export type API_KEY_PERMISSIONS = "can_crud" | "can_read" | "can_create";
export type API_KEY_STATUS = "revoked" | "active" | "expired" | "deleted";
export type NEW_API_KEY = Pick<
  IApikey,
  "created_by" | "expires_in" | "key" | "permission"
>;
export interface ILink {
  id: number;
  short_url: string;
  created_at: string;
  updated_at: string;
  custom_title?: string;
  /**
   * this could be api key id
   */
  created_by: string;
  long_url: string;
  views: number;
}
export type NEW_LINK = Pick<
  ILink,
  "custom_title" | "created_by" | "long_url" | "short_url"
>;
export interface ILinkMetadata {
  referers: string;
  /**
   * this could be browser, device, etc
   */
  user_agent: string;
  ip: string;
  country?: string;
  city?: string;
  created_at?: string;
}
export interface IUser {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  email: string;
  password?: string;
  auth_id?: string;
  verification_status?: VERIFICATION_STATUS;
  last_login?: Date | null;
  auth_type: AUTH_TYPE;
  avatar?: string;
}
export type AUTH_TYPE = "google" | "github" | "email";
export type NEW_USER = Pick<
  IUser,
  | "email"
  | "first_name"
  | "avatar"
  | "auth_id"
  | "last_name"
  | "password"
  | "username"
  | "verification_status"
  | "auth_type"
>;
export type VERIFICATION_STATUS = "pending" | "verified" | "unverified";
