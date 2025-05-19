export interface Account {
    id?: number;
    title: 'Mr' | 'Mrs' | 'Ms' | 'Dr';
    first_name: string;
    last_name: string;
    email: string;
    role: 'Admin' | 'User';
    status: 'Active' | 'Inactive';
}

export interface CreateAccountDto extends Omit<Account, 'id'> {
    password: string;
}

export interface UpdateAccountDto extends Partial<Account> {
    password?: string;
} 