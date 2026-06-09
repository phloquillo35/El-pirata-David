export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
}

export interface IUser {
  id: string;
  email: string;
  password?: string;
  name: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserAddress {
  id: string;
  userId: string;
  alias: string;
  street: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  lastName: string;
  phone?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<IUser, 'password'>;
  accessToken: string;
  refreshToken?: string;
}

export interface UpdateProfileDTO {
  name?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}
