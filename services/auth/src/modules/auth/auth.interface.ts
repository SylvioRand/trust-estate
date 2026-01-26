import { Role } from "@prisma/client"

export interface LoginUserInterface {
  email: string,
  password: string
}

export interface SignUpUserInterface {
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  password: string
}

export interface UserInterface {
  id: string;
  role: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
}



export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  firstName: string;
  lastName: string;
  phoneVerified: boolean;
  role: string;
  hasPassword: boolean;

  creditBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  user: User;
}

export interface UserGoogleInterface {
  id: string
  email: string
  verified_email: string
  name: string
  given_name: string
  family_name: string
  picture: string
}

export interface changePermissionInterface {
	id: string
	role: Role
}