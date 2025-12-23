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
	id: string,
	email: string,
	firstName: string,
	lastName: string,
	phone: string,
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
  role: string;
  sellerStats: SellerStats;
  creditBalance: number;
  createdAt: string;
}

export interface LoginResponse {
  user: User;
}
