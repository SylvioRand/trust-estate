export interface UpdatePasswordInterface {
	password: string,
	newPassword: string
}

export interface UpdateInfoUserInterface {
	firstName: string
	lastName: string
	phone: string
}

export interface UserDetailsInterface {
	id: string
	firstName: string
	lastName?: string
	email: string
	phone?: string
	createdAt: Date
}