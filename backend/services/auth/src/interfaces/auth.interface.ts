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

export interface SellerStats {
  totalListings: number;
  averageRating: number;
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  phoneVerified: boolean,
  sub: string;
  role: string;
  sellerStats: SellerStats;
  creditBalance: number;
  createdAt: string;
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
