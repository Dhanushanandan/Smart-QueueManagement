export type UserRole = 'ADMIN' | 'TELLER' | 'CITIZEN';

export interface User {
    uid: string;
    name: string;
    email: string;
    mobile: string;
    nic: string;
    dob: string;
    status: string;
    step: string;
    role?: UserRole;
}