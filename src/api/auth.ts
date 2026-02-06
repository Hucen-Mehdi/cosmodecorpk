import { API_BASE_URL as BASE_URL } from './config';
const API_BASE_URL = `${BASE_URL}/auth`;

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    // Return data directly, caller should check response.ok or look for error messages in data
    return data;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    return data;
}

export async function getCurrentUser(token: string): Promise<{ user: AuthUser | null }> {
    try {
        const response = await fetch(`${API_BASE_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            return { user: null };
        }

        const data = await response.json();
        if (!response.ok) {
            return { user: null };
        }
        return data;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        return { user: null };
    }
}
