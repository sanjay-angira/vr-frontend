
export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
}

export interface Admin {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
}

export interface AsyncState {
    isLoading: boolean;
    error: string | null;
}
